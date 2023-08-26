import { Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";

export const findVendor = async(id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email });
  } else {
    return await Vendor.findById(id);
  }
}

/**
 * Business Logic to create a new Vendor in the system
 * @req {string} contains vendor profile information
 * @res {string} ObjectId of vendor object created and stored
 * @return {number} Status code 200 and the vendor generated ID
 */
export const createVendor = async (req: Request, res: Response) => {
  const { name, ownerName, productType, pincode, address, phone, email, password, rating } = <CreateVendorInput>req.body;

  const vendorExists = await findVendor('', email);
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
      rating: rating,
      products: [],
      lat: 0,
      lng: 0
    });
    return res.status(201).json( { vendor: vendorCreated._id });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create new vendor' });
  }
}

/**
 * Business Logic to get list of vendors from system
 * @res {List} List containing vendor JSON objects in system
 * @return {List} Status code 200 and List of Vendors
 */
export const getVendors = async (req: Request, res: Response) => {
  // Add pagination later in the 
  const vendorList = await Vendor.find();
  if (vendorList) {
    return res.status(200).json(vendorList);
  } else {
    return res.status(404).json({ error: 'No Vendors Found' });
  }
}

/**
 * Business Logic to retrieve 
 * @req {string} contains vendor profile information
 * @res {string} ObjectId of vendor object created and stored
 * @return {number} Status code 200 and the vendor generated ID
 */
export const getVendorByID = async (req: Request, res: Response) => {
  const vendorId = req.params.id;
  if (!vendorId) return res.status(404).json({ error: 'Insert Vendor ID'});
  const vendor = await findVendor(vendorId);
  if(vendor) {
    return res.status(200).json(vendor);
  } else {
    return res.status(404).json({ error: 'Vendor Data not available' });
  }
}

/* ----------------------- Transactions Section ---------------------------- */

/**
 * Business Logic to Aid get the list of transactions in the system
 * @res {List} List of Transaction Objects in DB
 * @return {List} Status code 200 + List of Transactions
 */
export const getTransactions = async (req:Request, res:Response) => {
  const transactions = await Transaction.find();
  if (transactions) {
    return res.status(200).json(transactions);
  }
  return res.json({ error: 'Transactions Data Not Available' });
}

/**
 * Business Logic to Aid get details of a particular Transaction in System
 * @req {object} Transaction Id
 * @res {Object} Transaction Object in System
 * @return {Object} Status code 200 + Transaction Object
 */
export const getTransactionById = async (req:Request, res:Response) => {
  const transactionId = req.params.id;
  if (transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (transaction) {
      return res.status(200).json(transaction);
    } else {
      return res.status(404).json({ error: 'Transaction Data Not Found!' });
    }
  }
  return res.status(404).json({ error: 'Transaction ID Not Found!' });
}

/* ----------------------- Delivery User Mgt Section ---------------------------- */

/**
 * Business Logic to Aid get details of a particular Transaction in System
 * @req {object} Transaction Id + verification status
 * @res {Object} Updated Delivery User Profile with verify status changed
 * @return {List} Status code 200 + Updated Delivery User Account Profile
 */
export const verifyDeliveryUser = async (req:Request, res: Response) => {
  const { _id, status } = req.body;
  if (_id) {
    const deliveryUser = await DeliveryUser.findById(_id);
    if (deliveryUser) {
      deliveryUser.verified = status;
      const updatedDelUserProfile = await deliveryUser.save();
      return res.status(200).json(updatedDelUserProfile);
    }
  }
  return res.status(400).json({ error: 'Unable to verify Delivery User Account!' });
}

/**
 * Business Logic to get List of Delivery Users in the system
 * @res {List} List of Delivery Users in the System
 * @return {List} Status code 200 + List of Delivery Users in the System
 */
export const getDeliveryUsers = async (req:Request, res: Response) => {
  const deliveryUsers = await DeliveryUser.find();
  if (deliveryUsers) {
    return res.status(200).json(deliveryUsers);
  }
  return res.status(400).json({ error: 'No information on Delivery Users Found!' });
}
