// backend/server.js
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

// Setup MongoDB
mongoose.connect('mongodb://localhost:27017/autoGarage', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Booking = mongoose.model('Booking', new mongoose.Schema({
  fullName: String,
  email: String,
  service: String,
  vehicleInfo: String,
  preferredDate: String,
  notes: String,
  imagePath: String
}));

// Setup Multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., Gmail
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_email_password'
  }
});

// Handle POST request
app.post('/submit-booking', upload.single('vehicleImage'), async (req, res) => {
  const { fullName, email, service, vehicleInfo, preferredDate, notes } = req.body;
  const imagePath = req.file ? req.file.path : '';

  // Save to DB
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

  // Send email
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: 'your_email@gmail.com',
    subject: 'New Booking Received',
    text: `Name: ${fullName}\nEmail: ${email}\nService: ${service}\nVehicle Info: ${vehicleInfo}\nDate: ${preferredDate}\nNotes: ${notes}`,
    attachments: req.file ? [{ path: imagePath }] : []
  };
  await transporter.sendMail(mailOptions);

  // Respond with confirmation
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
