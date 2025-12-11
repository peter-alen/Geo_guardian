import express from 'express';
import User from '../models/User';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, vehicleType, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password, vehicleType, role });
        await user.save();

        res.status(201).json({ user, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (user.password !== password) { // Simple check, no hashing for prototype as requested
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
