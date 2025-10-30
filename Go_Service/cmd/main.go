package main

import (
	"context"
	"encoding/json"
	"go_csv_worker/internal/database"
	"go_csv_worker/internal/processor"
	"go_csv_worker/internal/types"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/joho/godotenv"
)

// Global variables initialized from environment
var (
	JOB_QUEUE_NAME    string
	STATUS_QUEUE_NAME string
	REDIS_HOST        string
)

var ctx = context.Background()
var rdb *redis.Client

func init() {
	// --- 1. Load Environment Variables ---
	if err := godotenv.Load(); err != nil {
		log.Fatal("FATAL: Error loading .env file:", err)
	}

	// --- 2. Load Configuration ---
	REDIS_HOST = os.Getenv("REDIS_HOST")
	JOB_QUEUE_NAME = os.Getenv("JOB_QUEUE_NAME")
	STATUS_QUEUE_NAME = os.Getenv("STATUS_QUEUE_NAME")
	
	if REDIS_HOST == "" || JOB_QUEUE_NAME == "" || STATUS_QUEUE_NAME == "" {
		log.Fatal("FATAL: Redis configuration missing in environment variables.")
	}

	// --- 3. Initialize External Services ---
	
	// Redis Connection
	rdb = redis.NewClient(&redis.Options{
		Addr:     REDIS_HOST,
		Password: os.Getenv("REDIS_PASSWORD"), 
		DB:       0,
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("FATAL: Could not connect to Redis at %s: %v", REDIS_HOST, err)
	}
	log.Printf("Successfully connected to Redis at %s.", REDIS_HOST)
	
	// Database Connection
	if err := database.InitDB(); err != nil {
		log.Fatalf("FATAL: Failed to initialize database: %v", err)
	}
}

func main() {
	log.Println("Go Worker started. Listening for jobs...")

	// The infinite worker loop
	for {
		// BLPop: Blocks until a job arrives on the queue
		result, err := rdb.BLPop(ctx, 0, JOB_QUEUE_NAME).Result()
		
		if err == redis.Nil {
			continue 
		}
		if err != nil {
			log.Printf("Redis BLPOP error: %v. Retrying in 5 seconds...", err)
			time.Sleep(5 * time.Second)
			continue
		}

		jobMessage := result[1]
		
		var job types.Job // <-- FIX: Use the shared type
		if err := json.Unmarshal([]byte(jobMessage), &job); err != nil {
			log.Printf("[ERROR] Failed to deserialize job message: %v. Message: %s", err, jobMessage)
			continue 
		}

		// Delegate the heavy work to a Goroutine
		go processJob(job)
	}
}

// processJob calls the processor logic and handles final status reporting.
func processJob(job types.Job) { // <-- FIX: Use the shared type
	log.Printf("[Job %s] START processing. S3 Key: %s", job.JobID, job.S3Key)
	startTime := time.Now()
    var success bool = false

	defer func() {
		duration := time.Since(startTime)
		log.Printf("[Job %s] FINISHED in %v. Success: %t", job.JobID, duration, success)
		
		reportStatus(job.JobID, duration, success)
	}()
	
	// Call the processor's main execution function
	err := processor.ExecuteJob(job) // <-- This now receives the correct type

	if err != nil {
		log.Printf("[Job %s] ERROR: %v", job.JobID, err)
		success = false
		return 
	}
	
	success = true
}

// reportStatus pushes the final result back to a Redis status queue/key.
func reportStatus(jobID string, duration time.Duration, success bool) {
	status := "FAILURE"
	if success {
		status = "SUCCESS"
	}
	
	statusMessage := map[string]interface{}{
		"jobId": jobID,
		"status": status,
		"duration": duration.String(),
		"timestamp": time.Now().Unix(),
	}

	jsonMessage, err := json.Marshal(statusMessage)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal status for job %s: %v", jobID, err)
		return
	}
    
    // RPUSH the status message onto a separate list for Node.js consumption
	_, err = rdb.RPush(ctx, STATUS_QUEUE_NAME, jsonMessage).Result()
	if err != nil {
		log.Printf("[ERROR] Failed to push status for job %s to Redis: %v", jobID, err)
	}
}
