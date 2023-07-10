import mongoose, { Schema } from "mongoose";

//Interface representing a document in MongoDB
export interface OrderDoc extends mongoose.Document {
  orderId: string; //5948764
  vendorId: string; 
  items: [any]; //[{ product, unit: 1 }]
  totalAmount: number; //50000
  paidThrough: string; //Mobile-Money, Credit-Card, Debit-Card
  orderDate: Date;
  orderStatus: string; //WAITING
  remarks: string;
  paymentResponse: string; // { status: true, response: Bank Response }
  deliveryId: string;
  deliveryTime: number;
}

// interface representing model methods connected to above document
const orderSchema: mongoose.Schema = new mongoose.Schema({
  orderId: { type: String, required: true },
  vendorId: { type: String, required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'product', require: true },
      unit: { type: Number, require: true }
    }
  ],
  totalAmount: { type: Number, require: true },
  paidThrough: { type: String },
  orderDate: { type: Date },
  orderStatus: { type: String },
  remarks: { type: String },
  paymentResponse: { type: String },
  deliveryId: { type: String },
  deliveryTime: { type: Number }
},
{
  toJSON: {
    transform(doc, ret){
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
  },
  timestamps: true,
});

const Order = mongoose.model<OrderDoc>('order', orderSchema);

export { Order };
