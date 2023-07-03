import mongoose, { Document, Schema } from "mongoose";

// interface representing a document in MongoDB
interface ProductDoc extends Document {
  vendorId: string;
  name: string;
  description: string;
  category: string;
  productType: string;
  deliveryTime: number;
  price: number;
  rating: number;
  images: [string];
}

// Create model Schema corresponding to the document interface.
const productSchema: mongoose.Schema = new Schema({
  vendorId: { type: String },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  productType: { type: String, required: true },
  deliveryTime: { type: Number },
  price: { type: Number, required: true },
  rating: { type: Number },
  images: { type: [String] }
},{ 
  toJSON: {
    transform(doc, ret){
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
  },
  timestamps: true 
});

// Create Model while incorporating for Product dto
const Product = mongoose.model<ProductDoc>('product', productSchema);

export { Product };
