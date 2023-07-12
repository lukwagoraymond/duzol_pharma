import mongoose from "mongoose";

//Interface representing a document in MongoDB
export interface OfferDoc extends mongoose.Document {
  offerType: string; //VENDOR / GENERIC
  vendors: [any]; // ['64ad5318600d27fc7b0c7b6e']
  title: string; // UGX 30,000 off Friday Buys
  description: string; // any description with Terms and Conditions
  minValue: number; // minimum order amount should be UGX 100,000
  offerAmount: number; // 30,000
  startValidity: Date;
  endValidity: Date;
  promoCode: string; //WEEK200
  promoType: string; // USER / ALL / BANK / CARD
  bank: [any];
  bins: [any]; //Bank Identification Number of payment cards
  pincode: string;
  isActive: boolean;
}

// interface representing model methods connected to above document
const offerSchema: mongoose.Schema = new mongoose.Schema({
  offerType: { type: String, required: true },
  vendors: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'vendor'},
  ],
  title: { type: String, required: true },
  description: { type: String },
  minValue: { type: Number, required: true },
  offerAmount: { type: Number, required: true },
  startValidity: { type: Date },
  endValidity: { type: Date },
  promoCode: { type: String, required: true },
  promoType: { type: String, required: true },
  bank: [{ type: String }],
  bins: [{ type: Number }],
  pincode: { type: String, required: true },
  isActive: { type: Boolean }
},
{
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
    }
  },
  timestamps: true,
});

const Offer = mongoose.model<OfferDoc>('offer', offerSchema);

export { Offer };
