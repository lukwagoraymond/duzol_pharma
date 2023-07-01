import { Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";

/**
 * Business Logic to create a new Vendor in the system
 * @req {string} contains vendor profile information
 * @res {string} ObjectId of vendor object created and stored
 * @return {number} Status code 200 and the vendor generated ID
 */
export const CreateVendor = async (req: Request, res: Response) => {
  const { name, ownerName, productType, pincode, address, phone, email, password } = <CreateVendorInput>req.body;

  const vendorExists = await Vendor.findOne({ email });
  if (vendorExists !== null) {
    return res.json({ error: 'Vendor already exists with this EmailID' });
  }

  try {
    const vendorCreated = await Vendor.create({
      name: name,
      ownerName: ownerName,
      productType: productType,
      pincode: pincode,
      address: address,
      phone: phone,
      email: email,
      password: password,
      serviceAvailable: false,
      coverImages: [],
      rating: 0
      /*products: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'product'
      }],
      lat: { type: Number },
      lng: { type: Number } */
    });
    return res.status(201).json( { vendor: vendorCreated._id });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create new vendor' });
  }
}

export const GetVendors =async (req: Request, res: Response) => {
  //
}

export const GetVendorByID =async (req: Request, res: Response) => {
  //
}