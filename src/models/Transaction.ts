import mongoose from "mongoose";

export interface TransactionDoc extends mongoose.Document {
  customerId: string;
  vendorId: string;
  orderId: string;
  orderValue: number;
  offerUsed: string;
  status: string;
  paymentMode: string;
  paymentResponse: string;
}

const transactionSchema: mongoose.Schema = new mongoose.Schema({
  customerId: { type: String },
  vendorId: { type: String },
  orderId: { type: String },
  orderValue: { type: Number },
  offerUsed: { type: String },
  status: { type: String }, // OPEN / FAILED / CONFIRMED
  paymentMode: { type: String }, //Mobile-Money, Credit-Card, Debit-Card
  paymentResponse: { type: String }
}, 
{
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
    }
  },
  timestamps: true,
});

const Transaction = mongoose.model<TransactionDoc>('transaction', transactionSchema);
export { Transaction };
