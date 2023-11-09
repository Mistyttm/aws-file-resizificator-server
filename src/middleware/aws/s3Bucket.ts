import * as AWS from 'aws-sdk';

// Code sourced from week 7 s3 demonstration 
AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
    region: "ap-southeast-2",
});

// Create an S3 client
const s3 = new AWS.S3();

const bucketName = process.env.BUCKET_NAME ?? "cab432-team1-bucket";

export async function createS3bucket() {
    try {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Created bucket: ${bucketName}`);
    } catch (error: any) {
        if (error.statusCode === 409) {
            console.log(`Bucket already exists: ${bucketName}`);
        } else {
            console.log(`Error creating bucket: ${error}`);
        }
    }
}

/* Set bucket policy to remove files uploaded 1 day ago */
export async function setS3LifecyclePolicy() {
    const policyParams = {
      Bucket: bucketName, 
      LifecycleConfiguration: {
       Rules: [ {
        Expiration: { Days: 1 }, // Delete files after 1 day
         Filter: { Prefix: '' }, // Apply policy to all bucket files
         ID: 'RemoveUploads', 
         Status: 'Enabled', 
        }]}
     };
    try {
      await s3.putBucketLifecycleConfiguration(policyParams).promise();
      console.log('Lifecycle policy has been set - uploads will be removed from bucket after 1 day.');
    } catch (error) {
      console.error('Error setting bucket lifecycle policy: ', error); 
    }
  }

// Upload data to S3
export async function uploadToS3(params: any) {
    try {
        await s3.upload(params).promise();
        console.log("File uploaded successfully.");
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
}

/* Remove file from s3 storage */
export async function deleteFromS3(fileName: string) {
    const params = { Bucket: bucketName, Key: fileName };

    try {
        await s3.deleteObject(params).promise();
        console.log("File deleted successfully.");
    } catch (error) {
        console.error("Error deleting file: ", error);
    } 
}

/* Search s3 for a file by filename */
export async function searchS3(fileName: string) {
    const params = { Bucket: bucketName, Key: fileName, };

    try {
        await s3.headObject(params).promise();
        return true;
    } catch (error: any) {
        if (error.code === "NotFound") {
            console.log("File was not found in the s3 bucket.");
            return false;
        } else {
            console.error(error);
            return false;
        }
    }
}

/* Get a signed url for the address of the video uploaded to s3 */
export async function getSignedUrl(params: any) {
    try {
        const url = await s3.getSignedUrlPromise("getObject", params);
        console.log(url);
        return url;
    } catch (error) {
        console.error(error);
    }
}
