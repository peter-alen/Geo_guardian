import mongoose, { Schema, Document } from 'mongoose';

export interface IHazard extends Document {
    name: string;
    type: 'school_zone' | 'hospital_zone' | 'speed_breaker' | 'sharp_turn';
    location: {
        type: 'Point';
        coordinates: number[]; // [lng, lat]
    };
    radiusMeters?: number;
    allowedVehicles?: string[];
}

const HazardSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['school_zone', 'hospital_zone', 'speed_breaker', 'sharp_turn'], required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    radiusMeters: { type: Number, default: 0 },
    allowedVehicles: { type: [String], default: [] }
});

HazardSchema.index({ location: '2dsphere' });

export default mongoose.model<IHazard>('Hazard', HazardSchema);
