
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const app = express();

mongoose.connect('mongodb+srv://mpst31:1234@cluster0.cxjrtav.mongodb.net/creativeautogarage?retryWrites=true&w=majority');

const Booking = mongoose.model('Booking', new mongoose.Schema({
  fullName: String,
  email: String,
  service: String,
  vehicleInfo: String,
  preferredDate: String,
  notes: String,
  imagePath: String,
  status: { type: String, default: 'pending' }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage }).single('vehicleImage');

// Email sender setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

function sendMail(to, subject, html) {
  return transporter.sendMail({ from: 'Creative Auto Garage <youremail@gmail.com>', to, subject, html });
}

// Booking form route
app.post('/submit-booking', (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const { fullName, email, service, vehicleInfo, preferredDate, notes } = req.body;
    const imagePath = req.file ? req.file.path : '';
    const newBooking = new Booking({ fullName, email, service, vehicleInfo, preferredDate, notes, imagePath });
    await newBooking.save();

    await sendMail(email, 'Appointment Request Received', `<p>Hi ${fullName}, your request for ${service} on ${preferredDate} has been received. We'll confirm soon.</p>`);
    res.json({ success: true, message: "Booking submitted!" });
  });
});

app.get('/bookings', async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

app.post('/bookings/:id/approved', async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  await sendMail(booking.email, 'Appointment Confirmed', `<p>Hi ${booking.fullName}, your appointment for ${booking.service} on ${booking.preferredDate} has been confirmed.</p>`);
  res.json({ message: 'Booking approved and email sent.' });
});

app.post('/bookings/:id/denied', async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'denied' }, { new: true });
  res.json({ message: 'Booking denied.' });
});

app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin1' && password === '123456') {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(10000, () => console.log('Server running on port 10000'));
