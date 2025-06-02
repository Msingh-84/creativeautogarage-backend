const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛠️ Hardcoded connection string (test only)
const mongoURI = 'mongodb+srv://mpst31:1234@cluster0.cxjrtav.mongodb.net/creativeautogarage?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Booking = mongoose.model('Booking', new mongoose.Schema({
  fullName: String,
  email: String,
  service: String,
  vehicleInfo: String,
  preferredDate: String,
  notes: String,
  imagePath: String
}));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Nodemailer (use placeholder to avoid errors if you don’t want to use it yet)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'placeholder@gmail.com',
    pass: 'placeholderpassword'
  }
});

app.post('/submit-booking', upload.single('vehicleImage'), async (req, res) => {
  try {
    const { fullName, email, service, vehicleInfo, preferredDate, notes } = req.body;
    const imagePath = req.file ? req.file.path : '';

    const newBooking = new Booking({
      fullName, email, service, vehicleInfo, preferredDate, notes, imagePath
    });
    await newBooking.save();

    const mailOptions = {
      from: 'placeholder@gmail.com',
      to: 'placeholder@gmail.com',
      subject: 'New Booking Received',
      text: `Name: ${fullName}\nEmail: ${email}\nService: ${service}\nVehicle Info: ${vehicleInfo}\nDate: ${preferredDate}\nNotes: ${notes}`,
      attachments: req.file ? [{ path: imagePath }] : []
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
