import { Request, Response } from "express";
import { ProductDoc, Vendor } from "../models";

/**
 * Business Logic: Get list of vendors in particular locality
 *                  if vendor service is available
 * @req {string} contains incoming pincode tagged to pharmacy vendor
 * @res {string} product catalog of vendor if they available
 * @return {List} Status code 200 and product vendor's catalog
 */
export const getProductAvailability = async (req: Request, res: Response) => {
  const pincode = req.params.pincode;
  const vendorsArr = await Vendor.find({ pincode: pincode, serviceAvailable: true }).
  sort({ rating: 'desc' }).
  populate('products');
  if(vendorsArr.length > 0) {
    return res.status(200).json(vendorsArr);
  }
  return res.status(404).json({ error: 'Data Not Found' });
}

/**
 * Business Logic: Allows Users to access Top 20 Pharmacies
 * @req {string} contains incoming pincode tagged to pharmacy vendor
 * @res {string} List of top 20 Pharmacies in Location
 * @return {List} Status code 200 and List of Pharmacies.
 */
export const getTopPharmacies = async (req: Request, res: Response) => {
  const pincode = req.params.pincode;
  const topPharmacies = await Vendor.find({ pincode: pincode, serviceAvailable:true }).
  sort({ rating: 'desc' }).
  limit(20);
  if(topPharmacies.length > 0) {
    return res.status(200).json(topPharmacies);
  }
  return res.status(404).json({ error: 'Data Not Found' });
}

/**
 * Business Logic: Get products can be delivered in 30 minutes or less
 * @req {string} contains incoming pincode tagged to pharmacy vendor
 * @res {string} List of products with deliveryTime less than 30 minutes
 * @return {List} Status code 200 and List of products
 */
export const getProductIn30min = async (req: Request, res: Response) => {
  const pincode = req.params.pincode;
  const vendorsArr =  await Vendor.find({ pincode: pincode, serviceAvailable: true }).
  sort({ rating: 'desc' }).
  populate('products');
  if(vendorsArr.length > 0) {
    let productsIn30: any = [];
    vendorsArr.map(vendor => {
      const products = vendor.products as [ProductDoc];
      productsIn30.push(products.filter(product => product.deliveryTime <= 30));
    });
    return res.status(200).json(productsIn30);
  }
  return res.status(404).json({ error: 'Data Not Found' });
}

/**
 * Business Logic: Get products from various pharmacies in particular area code
 * @req {string} contains incoming pincode tagged to pharmacy vendor
 * @res {string} List of products in particular locality
 * @return {List} Status code 200 and List of products
 */
export const searchProducts = async (req: Request, res: Response) => {
  const pincode = req.params.pincode;
  const vendorsArr = await Vendor.find({ pincode: pincode, serviceAvailable: true }).
  populate('products');
  if(vendorsArr.length > 0) {
    let products: any = [];
    vendorsArr.map(item => {
      products.push(...item.products);
    });
    return res.status(200).json(products);
  }
  return res.status(404).json({ error: 'Data Not Found' });
}

/**
 * Business Logic: Get specific pharmacy store in
 * @req {string} contains incoming pincode tagged to vendor id
 * @res {string} Pharmacy identified vendor
 * @return {ObjectId} Status code 200 and Pharmacy Details
 */
export const getPharmacyById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const vendorArr = await Vendor.findById(id).populate('products');
  if(vendorArr) {
    return res.status(200).json(vendorArr);
  }
  return res.status(404).json({ error: 'Data Not Found' });
}