
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const bookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    service: String,
    vehicle: String,
    notes: String,
    photoPath: String
});

const Booking = mongoose.model('Booking', bookingSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.post('/submit-booking', upload.single('vehiclePhoto'), async (req, res) => {
    const { name, email, phone, service, vehicle, notes } = req.body;
    const photoPath = req.file ? req.file.path : "";

    const booking = new Booking({ name, email, phone, service, vehicle, notes, photoPath });
    await booking.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject: 'New Booking Received',
        text: `Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}
Vehicle: ${vehicle}
Notes: ${notes}`
    });

    res.status(200).send("Booking submitted successfully!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
