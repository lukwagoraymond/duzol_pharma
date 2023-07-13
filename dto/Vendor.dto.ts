export interface CreateVendorInput{
  name: string;
  ownerName: string;
  productType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface VendorLoginInputs{
  email: string;
  password: string; 
}

export interface EditVendorInputs{
  name: string;
  address: string;
  phone: string;
  productType: [string];
}

export interface VendorPayload{
  _id: string;
  email: string;
  name: string;
  productType: [string];
}

export interface UpdateOrderStatus{
  orderStatus: string;
  deliveryTime: number;
  remarks: string;
}

export interface CreateOfferInputs {
  offerType: string;
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promoCode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}
