import mongoose from "mongoose";
import { generateSalt, hashPassword } from "../utils";

// interface representing a document in MongoDB
interface VendorDoc extends mongoose.Document {
  name: string;
  ownerName: string;
  productType: string;
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  coverImages: [string];
  rating: number;
  products: any;
  lat: number;
  lng: number;
}

// Create model Schema corresponding to the document interface.
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  productType: { type: [String] },
  pincode: { type: String, required: true },
  address: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // Fails when required: true due to salt being still empty by-time this runs
  salt: { type: String, required: false }, 
  serviceAvailable: { type: Boolean },
  coverImages: { type: [String] },
  rating: { type: Number },
  /*products: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'product'
  }],
  lat: { type: Number },
  lng: { type: Number } */
},
{ 
  toJSON: {
    transform(doc, ret){
      delete ret.password;
      delete ret.salt;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
  },
  timestamps: true 
});

// Pre-Hook Middleware function run before document is saved in DB
vendorSchema.pre('save', async function (next) {
  const salt = await generateSalt();
  this.salt = salt;
  this.password = await hashPassword(this.password, salt);
  next();
});


// Create Model while incorporating for vendor dto
const Vendor = mongoose.model<VendorDoc>('vendor', vendorSchema);

export { Vendor };
