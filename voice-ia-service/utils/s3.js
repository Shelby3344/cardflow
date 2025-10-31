const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload de áudio para S3
 * @param {Buffer} audioBuffer - Buffer do áudio
 * @param {string} filename - Nome do arquivo (opcional)
 * @returns {string} - URL pública do arquivo
 */
const uploadAudioToS3 = async (audioBuffer, filename = null) => {
  const key = filename || `audio/${uuidv4()}.mp3`;
  const bucket = process.env.AWS_S3_BUCKET;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
    ACL: 'public-read',
  });

  try {
    await s3Client.send(command);
    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.error('Erro ao enviar áudio para S3:', error);
    throw error;
  }
};

module.exports = { uploadAudioToS3 };
