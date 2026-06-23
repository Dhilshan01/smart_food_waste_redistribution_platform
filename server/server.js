import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import './utils/cronJobs.js';
import claimRoutes from './routes/claimRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';



dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('Smart Food Waste API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));