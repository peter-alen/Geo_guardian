import express from 'express';
import Hazard from '../models/Hazard';

const router = express.Router();

// Get all hazards
router.get('/', async (req, res) => {
    try {
        const hazards = await Hazard.find();
        res.json(hazards);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add hazard (Admin only essentially, but no middleware enforced for prototype simplicity if not requested)
router.post('/', async (req, res) => {
    try {
        const hazard = new Hazard(req.body);
        await hazard.save();
        res.status(201).json(hazard);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete hazard
router.delete('/:id', async (req, res) => {
    try {
        await Hazard.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hazard deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
