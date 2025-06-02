const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ✅ MongoDB setup (hardcoded URI)
mongoose.connect('mongodb+srv://mpst31:1234@cluster0.cxjrtav.mongodb.net/creativeautogarage?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define schema
const Booking = mongoose.model('Booking', new mongoose.Schema({
  fullName: String,
  email: String,
  service: String,
  vehicleInfo: String,
  preferredDate: String,
  notes: String,
  imagePath: String
}));

// ✅ Multer setup for file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage }).single('vehicleImage'); // field must match HTML form

// ✅ POST route
app.post('/submit-booking', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Upload error: ' + err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Server error: ' + err.message });
    }

    const { fullName, email, service, vehicleInfo, preferredDate, notes } = req.body;
    const imagePath = req.file ? req.file.path : '';

    try {
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
      res.json({ success: true, message: 'Booking submitted!' });
    } catch (error) {
      res.status(500).json({ error: 'DB error: ' + error.message });
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
