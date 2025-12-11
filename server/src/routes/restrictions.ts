import express from 'express';
import RoadRestriction from '../models/RoadRestriction';

const router = express.Router();

// Get all restrictions
router.get('/', async (req, res) => {
    try {
        const restrictions = await RoadRestriction.find();
        res.json(restrictions);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add restriction
router.post('/', async (req, res) => {
    try {
        const restriction = new RoadRestriction(req.body);
        await restriction.save();
        res.status(201).json(restriction);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
