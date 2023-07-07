import mongoose from "mongoose";
import { generateSalt, hashPassword } from "../utils";

//Interface representing a document in MongoDB
interface CustomerDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lng: number;
  //cart: [any];
  //orders: [OrderDoc]
}

// Create model Schema corresponding to the document interface.
const customerSchema: mongoose.Schema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  address: { type: String },
  phone: { type: String, required: true },
  verified: { type: Boolean },
  otp: { type: Number },
  otp_expiry: { type: Date },
  lat: { type: Number },
  lng: { type: Number }
}, 
{
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
customerSchema.pre('save', async function (next) {
  const salt = await generateSalt();
  this.salt = salt;
  this.password = await hashPassword(this.password, salt);
  next();
});

// Create Model while incorporating for customerDoc interface
const Customer = mongoose.model<CustomerDoc>('customer', customerSchema);
export { Customer };
