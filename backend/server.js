// backend/server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup MongoDB with environment variable
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Mongoose Schema
const Booking = mongoose.model('Booking', new mongoose.Schema({
  fullName: String,
  email: String,
  service: String,
  vehicleInfo: String,
  preferredDate: String,
  notes: String,
  imagePath: String
}));

// Multer config for uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Setup Nodemailer with env variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Handle form submission
app.post('/submit-booking', upload.single('vehicleImage'), async (req, res) => {
  try {
    const { fullName, email, service, vehicleInfo, preferredDate, notes } = req.body;
    const imagePath = req.file ? req.file.path : '';

    const newBooking = new Booking({
      fullName,
      email,
      service,
      vehicleInfo,
      preferredDate,
      notes,
      imagePath
    });

    await newBooking.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Booking Received',
      text: `Name: ${fullName}\nEmail: ${email}\nService: ${service}\nVehicle Info: ${vehicleInfo}\nDate: ${preferredDate}\nNotes: ${notes}`,
      attachments: req.file ? [{ path: imagePath }] : []
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true });
  } catch (err) {
    console.error('Error handling form submission:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
