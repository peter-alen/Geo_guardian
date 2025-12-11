import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadRestriction extends Document {
    name: string;
    geometry: {
        type: 'LineString';
        coordinates: number[][]; // [[lng, lat], ...]
    };
    noHeavyVehicles?: boolean;
    maxHeightMeters?: number;
    maxWeightTons?: number;
}

const RoadRestrictionSchema: Schema = new Schema({
    name: { type: String, required: true },
    geometry: {
        type: { type: String, default: 'LineString' },
        coordinates: { type: [[Number]], required: true }
    },
    noHeavyVehicles: { type: Boolean, default: false },
    maxHeightMeters: { type: Number },
    maxWeightTons: { type: Number }
});

RoadRestrictionSchema.index({ geometry: '2dsphere' });

export default mongoose.model<IRoadRestriction>('RoadRestriction', RoadRestrictionSchema);
