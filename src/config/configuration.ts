export default () => ({
  aws: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_USER_POOL_ID,
    clientId: process.env.AWS_CLIENT_ID,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
  },
  /* database: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    } */
});
