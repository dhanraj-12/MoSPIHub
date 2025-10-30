declare namespace NodeJS {
    interface ProcessEnv {
        PORT : string
        DB_USER :string
        DB_HOST :string
        DATABASE:string
        DB_PASSWORD :string
        RDSPORT:string
        MONGO_URI:string
        AWS_ACCESS_KEY_ID:string
        AWS_SECRET_ACCESS_KEY:string
        AWS_REGION:string
        S3_BUCKET_NAME:string
        REDIS_HOST:string
        REDIS_PORT:string
        REDIS_PASSWORD:string
    }
  }