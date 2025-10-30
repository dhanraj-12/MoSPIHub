package types

// Job represents the data structure sent by the Node.js service
// This is the source of truth for all job-related structs across the service.
type Job struct {
	JobID     string `json:"jobId"`
	S3Key     string `json:"s3Key"`
	TableName string `json:"tableName"`
	SurveyID  string `json:"surveyId"`
}
