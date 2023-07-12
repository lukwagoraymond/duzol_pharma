import { Request, Response } from "express";
import { CreateOfferInputs, EditVendorInputs, UpdateOrderStatus, VendorLoginInputs } from "../dto";
import { Product, Order, Offer, Vendor } from "../models";
import { generateSignature } from "../utils";
import { findVendor } from "./AdminController";

/* ----------------------- Vendor Profile Section ---------------------------- */
/**
 * Business Logic: Authenticate and Log Vendor into System
 * @req {string} contains incoming registered email and password
 * @res {string} authenticated vendor id else error
 * @return {ObjectId} Status code 200 and the vendor generated ID
 */
export const vendorLogin = async (req:Request, res:Response) => {
  const { email, password } = <VendorLoginInputs>req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing Email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing Password' });
  }
  try {
    const user = await Vendor.authLogin(email, password);
    const signature = generateSignature({
      _id: user._id,
      email: user.email,
      productType: user.productType,
      name: user.name
    });

    return res.status(200).json(signature);
  } catch (err) {
    return res.status(404).json({ error: err });
  }
}

/**
 * Business Logic: Lets authorised users access the Vendor Profile
 * @req {Object} contains authenticated user payload from vendorPayload interface
 * @res {Object} a JSON object containing vendor information
 * @return {Object} Status code 200 and Vendor Profile JSON Object
 */
export const getVendorProfile = async (req: Request, res: Response) => {
  const user = req.user;
  if(user) {
    const existingVendor = await findVendor(user._id);
    return res.json(existingVendor);
  }
  return res.status(400).json({ error: 'Vendor Information Not Found'});
}

/**
 * Business Logic: Authorised Users can change particulars of profile information
 * @req {string} contains items to change
 * @res {Object} a JSON object containing updatedvendor profile information
 * @return {Object} Status code 200 and Vendor updated Profile JSON Object
 */
export const updateVendorProfile = async (req: Request, res: Response) => {
  const { productType, name, address, phone } = <EditVendorInputs>req.body;
  const user = req.user;
  if(user) {
    const existingVendor = await findVendor(user._id);
    if(existingVendor) {
      existingVendor.name = name;
      existingVendor.productType = productType;
      existingVendor.address = address;
      existingVendor.phone = phone;
      const updatedResults = await existingVendor.save();
      return res.status(204).json(updatedResults);
    }
    return res.status(404).json({ error: `User: ${user._id} information not updated!` });
  }
  return res.status(400).json({ error: 'Vendor Information Not Found' });
}

/**
 * Business Logic: Authorised Users can update vendor Profile Photo.
 * @req {string} contains File Photo
 * @res {Object} a JSON object updated to contain coverImage
 * @return {Object} Status code 201 and Vendor updated Profile JSON Object
 */
export const updateVendorCoverImage = async (req:Request, res:Response) => {
  const user = req.user;
  if(user) {
    const vendor = await findVendor(user._id);
    if(vendor) {
      const files = req.files as [Express.Multer.File];
      const images = files.map((file: Express.Multer.File) => file.filename);
      vendor.coverImages.push(...images);
      const updateCoverImage = await vendor.save();
      return res.status(201).json(updateCoverImage);
    }
  }
  return res.status(404).json({ error: 'Can\'t add Cover Image to Profile' });
}

/**
 * Business Logic: Authorised Vendors turn their Service Availability on/off
 * @req {Object} contains authenticated user payload from vendorPayload interface
 * @res {Object} a JSON object containing updatedvendor profile information
 * @return {Object} Status code 200 and Vendor updated Profile JSON Object
 */
export const updateVendorService = async (req: Request, res: Response) => {
  const user = req.user;
  if(user) {
    const existingVendor = await findVendor(user._id);
    if(existingVendor) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
      const updatedResults = await existingVendor.save();
      return res.status(200).json(updatedResults);
    }
    return res.status(404).json({ error: `User: ${user._id} serviceAvailablity not updated!` });
  }
  return res.status(400).json({ error: 'Vendor Information Not Found' });
}

/* ----------------------- Vendor Product Section ---------------------------- */
/**
 * Business Logic: Authorised Vendors add pharmacy products to their catalog
 * @req {Object} contains authenticated user payload from CreateProductInputs interface
 * @res {Object} a JSON object containing product add to vendor catalog
 * @return {Object} Status code 201 and list of products added.
 */
export const addProducts = async (req:Request, res:Response) => {
  const user = req.user;
  if(user) {
    const { name, description, category, productType, deliveryTime, price } = req.body;
    const vendor = await findVendor(user._id);
    if(vendor) {
      const files = req.files as [Express.Multer.File];
      const images = files.map((file: Express.Multer.File) => file.filename);

      // Implement check for it product name exists return error here b4 creation later
      const createdProduct = await Product.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        productType: productType,
        deliveryTime: deliveryTime,
        price: price,
        images: images,
        rating: 1
      });
      vendor.products.push(createdProduct);
      const updatedProductArr = await vendor.save();
      return res.status(201).json(updatedProductArr);
    }
  }
  return res.status(404).json({ error: 'Can\'t add product to catalog' });
}

/**
 * Business Logic: Authorised users get list of pharmacy products from vendor catalog
 * @req {Object} contains authenticated user payload from vendorPayload interface
 * @res {Object} a JSON object containing List of vendor's products
 * @return {Object} Status code 200 List of particular Vendor Products
 */
export const getProducts = async (req:Request, res:Response) => {
  const user = req.user;
  if(user) {
    const pharmaProducts = await Product.find({ vendorId: user._id });
    if(pharmaProducts) {
      res.status(200).json(pharmaProducts);
      return;
    }
    return res.status(404).json({ error: 'Product Information Not Found' });
  }
  return res.status(404).json({ error: 'Vendor Informaton Not Found' });
}
/* ----------------------- Vendor Product Section ---------------------------- */

/**
 * Business Logic: Authorised Vendor can create a Promo Offer for their Products
 * @req {Object} contains authenticated user payload from vendorPayload interface
 * @res {Object} a JSON object containing Offer Object
 * @return {Object} Status code 200 + Offer JSON Object
 */
export const createOffer = async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    const { offerType, title, description, minValue, offerAmount, startValidity, endValidity, promoCode, promoType, bank, bins, pincode, isActive } = <CreateOfferInputs>req.body;
    const vendor = await findVendor(user._id);
    if (vendor) {
      const offer = await Offer.create({
        offerType,
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        promoCode,
        promoType,
        bank,
        bins,
        pincode,
        isActive,
        vendors: [vendor]
      });
      if (offer) {
        return res.status(201).json(offer);
      } else {
        return res.status(400).json({ error: 'Unable to add Vendor Offer!' });
      }
    }
  }
  res.status(400).json({ error: 'Vendor Not Authorised to Create Offer!' });
}

/**
 * Business Logic: Authorised Vendors get a list of offers tagged to their id
 * @req {Object} contains authenticated user payload from vendorPayload interface
 * @res {Object} a JSON object containing List of vendor's offers
 * @return {Object} Status code 200 + List of vendor's offers
 */
export const getOffers = async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    let vendorsOffers = Array();
    const offers = await Offer.find().populate('vendors');
    if (offers) {
      offers.map(item => {
        if (item.vendors) {
          item.vendors.map(vendor => {
            if (vendor._id.toString() === user._id) {
              vendorsOffers.push(item);
            }
          });
        }
        if (item.offerType === 'GENERIC') {
          vendorsOffers.push(item);
        }
      });
      return res.status(200).json(vendorsOffers);
    } else {
      return res.status(404).json({ error: 'No Offers Found!' });
    }
  }
  return res.status(400).json({ error: 'User Not Authorised to See Offers' })
}

/**
 * Business Logic: Authorised users get list of pharmacy products from vendor catalog
 * @req {Object} contains authenticated user payload from vendorPayload interface
 * @res {Object} a JSON object containing List of vendor's products
 * @return {Object} Status code 200 List of particular Vendor Products
 */
export const editOffer = async (req:Request, res:Response) => {
  const user = req.user;
  const offerId = req.params.id;
  if (user) {
    const { offerType, title, description, minValue, offerAmount, startValidity, endValidity, promoCode, promoType, bank, bins, pincode, isActive } = <CreateOfferInputs>req.body;
    const currentOffer = await Offer.findById(offerId);
    if (currentOffer) {
      const vendor = await findVendor(user._id);
      if (vendor) {
        currentOffer.offerType = offerType,
        currentOffer.title = title,
        currentOffer.description = description,
        currentOffer.minValue = minValue,
        currentOffer.offerAmount = offerAmount,
        currentOffer.startValidity = startValidity,
        currentOffer.endValidity = endValidity,
        currentOffer.promoType = promoType,
        currentOffer.bank = bank,
        currentOffer.pincode = pincode,
        currentOffer.isActive = isActive

        const updatedOffer = await currentOffer.save();
        return res.status(200).json(updatedOffer);
      }
    }
  }
  return res.status(400).json({ error: "Unable to Edit Offer!" });
}
/* ----------------------- Order Processing Section ---------------------------- */

/**
 * Business Logic: Authorised Vendors can get list of orders to be processed by them
 * @req {Object} contains authenticated Vendor payload from vendorPayload interface
 * @res {Object} a JSON object containing List of Customer Orders
 * @return {Object} Status code 200 + List of Customer Orders
 */
export const getCurrentOrders =async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate('items.product');
    if (orders) {
      return res.status(200).json(orders);
    }
    return res.status(404).json({ error: 'Orders Not Found!' });
  }
  return res.status(400).json({ error: 'Vendor Not Authorised to View Orders!' });
}

/**
 * Business Logic: Authorised Vendors get details on particular order
 * @req {Object} contains authenticated Vendor payload from vendorPayload interface
 *                + order _id
 * @res {Object} a JSON object containing details of particular order
 * @return {Object} Status code 200 + Details of particular Order
 */
export const getOrderDetails = async (req:Request, res:Response) => {
  const orderId = req.params.id;
  const user = req.user;
  if (user) {
    const orderDetails = await Order.findById(orderId).
    populate('items.product').
    where('vendorId').
    equals(`${user._id}`).
    exec();
    if (orderDetails) {
      return res.status(200).json(orderDetails);
    }
    return res.status(404).json({ error: 'Order Details Not Found!' });
  }
  return res.status(400).json({ error: 'Vendor Not Authorised to View Order!' });
}

/**
 * Business Logic: Authorised Vendors get to process particular order ready for delivery
 * @req {Object} contains authenticated payload + orderStatus, remarks, deliveryTime
 * @res {Object} a JSON object containing Updated Order Status
 * @return {Object} Status code 200 + Updated Order Status.
 */
export const processOrder = async (req:Request, res:Response) => {
  const orderId = req.params.id;
  const { orderStatus, remarks, deliveryTime } = <UpdateOrderStatus>req.body; //ACCEPT / REJECT / UNDER-PROCESS / READY
  if (orderId) {
    const order = await Order.findById(orderId).populate('items.product');
    if (order) {
      order.orderStatus = orderStatus;
      order.remarks = remarks;
      if (deliveryTime) order.deliveryTime = deliveryTime;
      const updatedOrder = await order.save();
      return res.status(200).json(updatedOrder);
    }
  }
  return res.status(400).json({ error: 'Not Authorised to Process Order!'});
}
