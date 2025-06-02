const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

// Init app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://mpst31:1234@cluster0.cxjrtav.mongodb.net/creativeautogarage?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema
const Booking = mongoose.model('Booking', new mongoose.Schema({
  fullName: String,
  email: String,
  service: String,
  vehicleInfo: String,
  preferredDate: String,
  notes: String,
  imagePath: String
}));

// Multer setup (to memory for now)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Nodemailer setup (hardcoded dummy — won't send without correct login)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password'
  }
});

// POST route
app.post('/submit-booking', upload.single('vehicleImage'), async (req, res) => {
  try {
    const { fullName, email, service, vehicleInfo, preferredDate, notes } = req.body;
    const imagePath = req.file ? req.file.originalname : '';

    const booking = new Booking({
      fullName,
      email,
      service,
      vehicleInfo,
      preferredDate,
      notes,
      imagePath
    });
    await booking.save();

    // optional email
    await transporter.sendMail({
      from: 'your_email@gmail.com',
      to: 'your_email@gmail.com',
      subject: 'New Booking',
      text: `Booking details:\n${JSON.stringify(req.body, null, 2)}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error submitting booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
