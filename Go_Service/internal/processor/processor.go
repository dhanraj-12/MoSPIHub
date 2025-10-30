package processor

import (
	"context"
	"encoding/csv"
	"fmt"
	"go_csv_worker/internal/database"
	"go_csv_worker/internal/types"
	"io"
	"log"
	"os"
	"strconv"
	"sync"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3Client is the global S3 client instance
var S3Client *s3.Client
// Global configuration variables
var AWS_S3_BUCKET string 
var BATCH_SIZE int
var WORKER_COUNT int

func init() {
    // --- 1. Load Configuration from Environment ---
    
	// Load critical settings, fail early if missing
	AWS_S3_BUCKET = os.Getenv("AWS_S3_BUCKET")
	awsKeyID := os.Getenv("AWS_ACCESS_KEY_ID")
	awsSecretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	awsRegion := os.Getenv("AWS_REGION")
	log.Println("AWS S3 Bucket:", AWS_S3_BUCKET)
	log.Println("AWS Region:", awsRegion)
	log.Println("AWS Access Key ID:", awsKeyID)
	log.Println("AWS Secret Access Key:", awsSecretKey != "")
	if AWS_S3_BUCKET == "" || awsKeyID == "" || awsSecretKey == "" || awsRegion == "" {
		log.Fatal("FATAL: One or more critical AWS environment variables (BUCKET, KEY_ID, SECRET_KEY, REGION) are missing from .env.")
	}

    // Load worker configuration
    // Note: Error handling is basic, relying on zero value if conversion fails
    var err error
    BATCH_SIZE, err = strconv.Atoi(os.Getenv("BATCH_SIZE"))
    if err != nil || BATCH_SIZE == 0 { BATCH_SIZE = 500 }
    
    WORKER_COUNT, err = strconv.Atoi(os.Getenv("WORKER_COUNT"))
    if err != nil || WORKER_COUNT == 0 { WORKER_COUNT = 5 }


	// --- 2. Explicitly Configure Credentials ---
	
	// Create a credential provider using the keys from the environment variables.
	credProvider := credentials.NewStaticCredentialsProvider(awsKeyID, awsSecretKey, "")

	// Load configuration, explicitly setting the region and the static credential provider.
	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithRegion(awsRegion),
		config.WithCredentialsProvider(credProvider),
	)
	
	if err != nil {
		log.Fatalf("FATAL: failed to load AWS config: %v", err)
	}
	
	S3Client = s3.NewFromConfig(cfg)
	log.Println("✅ AWS S3 Client initialized using static credentials and region.")
}

// ExecuteJob is the main entry point called by the Goroutine in cmd/main.go.
// It now accepts the shared types.Job
func ExecuteJob(job types.Job) error {
	ctx := context.TODO()

	// 1. Download CSV from S3
	csvStream, err := downloadS3Object(ctx, job.S3Key)
	if err != nil {
		return fmt.Errorf("failed S3 download: %w", err)
	}
	defer csvStream.Close()

	reader := csv.NewReader(csvStream)
	reader.LazyQuotes = true

	// 2. Get Headers
	headers, err := reader.Read()
	if err != nil {
		return fmt.Errorf("error reading CSV headers: %w", err)
	}
    
    // 3. Prepare Table
	if err := database.CreateTable(job.TableName, headers); err != nil {
		return fmt.Errorf("error creating table %s: %w", job.TableName, err)
	}

	// 4. Concurrency Setup (Your original logic, now integrated)
	batchChan := make(chan [][]string, WORKER_COUNT)
	var wg sync.WaitGroup

	// Start workers for insertion
	for i := 0; i < WORKER_COUNT; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for batch := range batchChan {
				log.Printf("[Job %s] Worker %d: Inserting batch of %d rows...", job.JobID, id, len(batch))
				
                // Use the database package function
				if err := database.InsertBatch(job.TableName, headers, batch); err != nil {
					log.Printf("[Job %s] ❌ Worker %d: Error inserting batch: %v", job.JobID, id, err)
					// In a real app, you might stop all workers or log a critical failure here
				} else {
					log.Printf("[Job %s] ✅ Worker %d: Batch inserted successfully", job.JobID, id)
				}
			}
		}(i + 1)
	}

	// 5. Stream CSV rows into batches
	batch := [][]string{}
	totalRows := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("[Job %s] ⚠️ Skipping bad row at line %d: %v", job.JobID, totalRows+2, err)
			continue
		}
		batch = append(batch, record)
		totalRows++

		if len(batch) >= BATCH_SIZE {
			batchChan <- batch
			// Allocate new slice to prevent workers from modifying underlying data 
            // before it's been processed in the concurrent goroutine
			batch = make([][]string, 0, BATCH_SIZE) 
		}
	}
	// Send final batch
	if len(batch) > 0 {
		batchChan <- batch
	}

	close(batchChan)
	wg.Wait()
    
    log.Printf("[Job %s] Total rows processed: %d", job.JobID, totalRows)
	return nil
}

// downloadS3Object retrieves the file stream from S3 using the S3 key.
func downloadS3Object(ctx context.Context, s3Key string) (io.ReadCloser, error) {
	input := &s3.GetObjectInput{
		Bucket: &AWS_S3_BUCKET,
		Key:    &s3Key,
	}

	// Pass nil as options since we set it up globally in init()
	result, err := S3Client.GetObject(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to get object %s from S3: %w", s3Key, err)
	}

	// Returns the ReadCloser (the stream)
	return result.Body, nil
}
