package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/lib/pq"
)



var DB *sql.DB

func InitDB() error {
	dbConfig := fmt.Sprint(os.Getenv("DB_CONFIG"))
	log.Println(("Connecting to PostgreSQL with config: " + dbConfig))
	var err error
	DB, err = sql.Open("postgres", dbConfig)
	if err != nil {
		return fmt.Errorf(("Failed to open PostgreSQL connection: " + err.Error()))
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(10)

	if err = DB.Ping(); err != nil {
		return fmt.Errorf(("Failed to ping PostgreSQL: " + err.Error()))
	}

	log.Println("Successfully connected to PostgreSQL")
	return nil
}



func CreateTable(tableName string, headers []string) error {
	var cols []string
	cols = append(cols, "id SERIAL PRIMARY KEY")
	for _, h := range headers { 
		col := fmt.Sprintf("\"%s\" TEXT", strings.TrimSpace(h))
		cols = append(cols, col)
	}

	query := fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s (%s);", tableName, strings.Join(cols, ","))
	_, err := DB.Exec(query)
	
	if err == nil {
		log.Printf("✅ Table %s created/ready.", tableName)
	}
	return err
}

func InsertBatch(tableName string, headers []string, batch [][]string) error {
	columnList := "\"" + strings.Join(headers, "\",\"") + "\""
	valueStrings := []string{}
	valueArgs := []interface{}{}
	argCounter := 1

	for _, row := range batch {
		placeholders := []string{}
		for range headers {
			placeholders = append(placeholders, fmt.Sprintf("$%d", argCounter))
			argCounter++
		}
		valueStrings = append(valueStrings, "("+strings.Join(placeholders, ",")+")")
		for _, val := range row {
			valueArgs = append(valueArgs, val) 
		}
	}

	stmt := fmt.Sprintf("INSERT INTO %s (%s) VALUES %s", tableName, columnList, strings.Join(valueStrings, ","))
	_, err := DB.Exec(stmt, valueArgs...)
	return err
}

