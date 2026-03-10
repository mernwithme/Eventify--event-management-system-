const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://eventify-event-management-system-ory749w2c-mernwithmes-projects.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/authRoutes');
const personalEventRoutes = require('./routes/personalEventRoutes');
const concertRoutes = require('./routes/concertRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/personal-events', personalEventRoutes);
app.use('/api/concert-events', concertRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.send('Eventify API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
