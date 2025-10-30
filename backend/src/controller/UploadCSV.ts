import s3Client from "../Util/s3client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";


const uploadCsv = async (filename : string, filebuffer : Buffer) => {
    try {
        const s3key = `images/${Date.now()}_${filename}`;
        const uploadparam = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: s3key,
            Body: filebuffer, 
            ACL: "public-read",
        }

        const command = new PutObjectCommand(uploadparam as any)
        await s3Client.send(command);
        console.log("✅ File uploaded successfully:", filename);
        return s3key;
    
    } catch(err) {
        console.error("❌ Upload failed:", err);
        throw err;
    }
}


export default uploadCsv;