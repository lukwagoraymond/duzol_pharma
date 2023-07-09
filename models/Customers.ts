import mongoose, { Schema } from "mongoose";
import { generateSalt, hashPassword, validatePassword } from "../utils";
import { OrderDoc } from "./index";

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
  cart: [any];
  orders: [OrderDoc]
}

// interface representing model methods connected to above document
interface CustomerModel extends mongoose.Model<CustomerDoc, mongoose.Document> {
  authLogin(email: string, password: string): mongoose.HydratedDocument<CustomerDoc, mongoose.Document>;
}

// Create model Schema corresponding to the document interface.
const customerSchema: mongoose.Schema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  address: { type: String },
  phone: { type: String, required: true },
  verified: { type: Boolean },
  otp: { type: Number },
  otp_expiry: { type: Date },
  lat: { type: Number },
  lng: { type: Number },
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'product', require: true },
      unit: { type: Number, require: true }
    }
  ],
  orders: [
    {
      type: Schema.Types.ObjectId, ref: 'order'
    }
  ]
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
  timestamps: true,
});

// Pre-Hook Middleware function run before document is saved in DB
customerSchema.pre('save', async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await generateSalt();
    this.salt = salt;
    const password = await hashPassword(this.password, salt);
    this.password = password;
    next();
  } else {
    return next();
  }
});

// Model Static Method to support Login Authentication of this Vendor
customerSchema.statics.authLogin = async function (email: string, password: string, salt) {
  const existingCustomer = await this.findOne({ email });
  if (existingCustomer) {
    console.log(password, existingCustomer.password);
    const auth = await validatePassword(password, existingCustomer.password);
    console.log(auth);
    if (auth) {
      return existingCustomer;
    } throw Error('incorrect password');
  } throw Error('incorrect Email input');
};

// Create Model while incorporating for customerDoc interface
const Customer = mongoose.model<CustomerDoc, CustomerModel>('customer', customerSchema);
export { Customer };
