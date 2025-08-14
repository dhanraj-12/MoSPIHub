declare namespace NodeJS {
    interface ProcessEnv {
        PORT : string
        DB_USER :string
        DB_HOST :string
        DATABASE:string
        DB_PASSWORD :string
        RDSPORT:string
    }
  }