const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// GridFS bucket for file storage
let bucket;

// Initialize GridFS bucket when MongoDB connection is ready
mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'materials'
  });
  console.log('GridFS bucket initialized');
});

// Configure multer for memory storage (files will be stored in MongoDB)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/avi',
      'video/quicktime'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, Word documents, text files, PowerPoint presentations, and videos are allowed.'), false);
    }
  }
});

// Function to upload file to GridFS
const uploadToGridFS = (fileBuffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        mimetype: mimetype,
        uploadDate: new Date()
      }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', (file) => {
      resolve({
        fileId: file._id,
        filename: file.filename,
        size: file.length,
        mimetype: mimetype
      });
    });

    uploadStream.end(fileBuffer);
  });
};

// Function to download file from GridFS
const downloadFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }

    const downloadStream = bucket.openDownloadStream(mongoose.Types.ObjectId(fileId));
    const chunks = [];

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    downloadStream.on('error', reject);
  });
};

// Function to delete file from GridFS
const deleteFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }

    bucket.delete(mongoose.Types.ObjectId(fileId), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Function to get file info from GridFS
const getFileInfo = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }

    bucket.find({ _id: mongoose.Types.ObjectId(fileId) }).toArray((error, files) => {
      if (error) {
        reject(error);
      } else if (files.length === 0) {
        reject(new Error('File not found'));
      } else {
        resolve(files[0]);
      }
    });
  });
};

module.exports = {
  upload,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  getFileInfo,
  getBucket: () => bucket
};
