import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional if we just do mock login without password check for simplicity, but let's add it.
    vehicleType: 'car' | 'heavy' | 'emergency';
    role: 'user' | 'admin';
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    vehicleType: { type: String, enum: ['car', 'heavy', 'emergency'], default: 'car' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

export default mongoose.model<IUser>('User', UserSchema);
