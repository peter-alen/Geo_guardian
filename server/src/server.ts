import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import hazardRoutes from './routes/hazards';
import restrictionRoutes from './routes/restrictions';
import routingRoutes from './routes/routing';
import aqiRoutes from './routes/aqi';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hazards', hazardRoutes);
app.use('/api/restrictions', restrictionRoutes);
app.use('/api/route', routingRoutes);
app.use('/api/air-quality', aqiRoutes);

app.get('/', (req, res) => {
    res.send('GeoGuardian API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
