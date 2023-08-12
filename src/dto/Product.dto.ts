export interface CreateProductInputs {
  name: string;
  description: string;
  category: string;
  productType: string;
  deliveryTime: number;
  price: number;
  images: [string];
}
