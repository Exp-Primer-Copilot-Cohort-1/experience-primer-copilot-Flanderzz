// Create web server
// 1. npm install express
// 2. npm install body-parser
// 3. npm install cors
// 4. npm install mongoose
// 5. npm install nodemon --save-dev
// 6. npm install mongoose-auto-increment
// 7. npm install multer
// 8. npm install multer-s3
// 9. npm install aws-sdk
// 10. npm install dotenv
// 11. npm install bcrypt

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

const connection = mongoose.connection;
autoIncrement.initialize(connection);
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single('file');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/comment/uploadfiles', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      url: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

app.post('/api/comment/uploadImage', (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
  });

  const params = {
    Bucket: 'react-comment-app