import mongoose from "mongoose";
import { generateSalt, hashPassword } from "../utils";

//Interface representing a document in MongoDB
interface DeliveryUserDoc extends mongoose.Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  pincode: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lng: number;
  isAvailable: boolean;
}

// Create model Schema corresponding to the document interface.
const deliveryUserSchema: mongoose.Schema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  address: { type: String },
  phone: { type: String, required: true },
  pincode: { type: String },
  verified: { type: Boolean },
  otp: { type: Number },
  otp_expiry: { type: Date },
  lat: { type: Number },
  lng: { type: Number },
  isAvailable: { type: Boolean, default: false }
}, {
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.salt;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
  },
  timestamps: true,
});

// Pre-Hook Middleware function run before document is saved in DB
deliveryUserSchema.pre('save', async function () {
  if ((this.password && this.isModified('password')) || this.isNew) {
    const salt = await generateSalt();
    this.salt = salt;
    const password = await hashPassword(this.password, salt);
    this.password = password;
  } else {
    console.log('Password Already Hashed!');
  }
});

const DeliveryUser = mongoose.model<DeliveryUserDoc>('deliveryUser', deliveryUserSchema);
export { DeliveryUser };
