import { Request, Response } from "express";
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateDeliveryUserInput, EditCustomerProfileInput, UserLoginInput } from "../dto";
import { DeliveryUser } from "../models";
import { generateSignature, validatePassword } from "../utils";

/* ------------------- Delivery User Mgt Section --------------------- */
/**
 * Business Logic: Creates a new Delivery User Account
 * @req {string} DTO of all neccessary data to create a delivery user
 * @res {string} customer user._id & verify_key: false
 * @return {Object} Status code 201 and customer id + verfiy_key
 */
export const DeliverySignUp = async (req:Request, res:Response) => {
  const deliveryUserInputs = plainToClass(CreateDeliveryUserInput, req.body);
  const validationErrors = await validate(deliveryUserInputs, {validationError: {target: true}});
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors });
  }
  const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;
  // Check for existing Delivery User Account in System DB
  const existingDeliveryUser = await DeliveryUser.findOne({ email });
  if (existingDeliveryUser) {
    return res.status(400).json({ error: 'Delivery User Account Email ID Already Exists!' });
  }
  try {
    const createdDeliveryUser = await DeliveryUser.create({
      email: email,
      password: password,
      phone: phone,
      firstName: firstName,
      lastName: lastName,
      address: address,
      pincode: pincode,
      verified: false,
      lat: 0,
      lng: 0
    });
    // Generate a JWT token Signature
    const signature = await generateSignature({
      _id: createdDeliveryUser._id,
      email: createdDeliveryUser.email,
      verified: createdDeliveryUser.verified
    });
    return res.status(201).json({ signature,
      verified: createdDeliveryUser.verified,
      email: createdDeliveryUser.email });
  } catch (err) {
    return res.status(400).json({ error: `Failed to create Delivery User: ${err}` });
  }
}

/**
 * Business Logic: Logs a Delivery user into system
 * @req {string} Email and Password of the Delivery user
 * @res {string} customer user._id & verify_key: false
 * @return {Object} Status code 200 and signature + verfiy_key
 */
export const DeliveryLogin = async (req:Request, res:Response) => {
  const loginInputs = plainToClass(UserLoginInput, req.body);
  const validationErrors = await validate(loginInputs, {validationError: {target: true}});
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors });
  }
  const { email, password } = loginInputs;
  const deliveryUser = await DeliveryUser.findOne({ email });
  if (deliveryUser) {
    const user = await validatePassword(password, deliveryUser.password);
    if (user) {
      const signature = generateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified
      });
      return res.status(200).json({
        signature,
        email: deliveryUser.email,
        verified: deliveryUser.verified
      });
    }
  }
  return res.status(404).json({ error: 'Error with Signin!' });
}

/**
 * Business Logic: Authenticated user gets thier Delivery User Account details
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of customer user details
 * @return {Object} Status code 200 and customer user details
 */
export const GetDeliveryProfile = async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    const deliveryUser = await DeliveryUser.findById(user._id);
    if (deliveryUser) {
      return res.status(200).json(deliveryUser);
    } else { 
      return res.status(404).json({ error: 'Delivery User Info Not Found!' });
    }
  }
  return res.status(400).json({ error: 'User Not Authorised to Access Delivery User Profile Details!' })
}

/**
 * Business Logic: Authenticated user gets thier Delivery User Account details
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of customer user details
 * @return {Object} Status code 200 and customer user details
 */
export const EditDeliveryProfile = async (req:Request, res:Response) => {
  const user = req.user;
  const deliveryUserInputs = plainToClass(EditCustomerProfileInput, req.body);
  const validationErrors = await validate(deliveryUserInputs, {validationError: {target: true}});
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors });
  }
  const { firstName, lastName, address } = deliveryUserInputs;
  if (user) {
    const deliveryUser = await DeliveryUser.findById(user._id);
    if (deliveryUser) {
      deliveryUser.firstName = firstName;
      deliveryUser.lastName = lastName;
      deliveryUser.address = address;
      const updatedDelUserProfile = await deliveryUser.save();
      return res.status(201).json(updatedDelUserProfile);
    }
  }
  return res.status(400).json({ error: 'User Not Authorised to Update Profile!' });
}

/* ------------------- Delivery Notification --------------------- */
export const UpdateDeliveryUserStatus = async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    // Use 3rd party API to get this location coordinates
    const { lat, lng } = req.body;
    const deliveryUser = await DeliveryUser.findById(user._id);
    if (deliveryUser) {
      if (lat && lng) {
        deliveryUser.lat = lat;
        deliveryUser.lng = lng;
      }
      deliveryUser.isAvailable = !deliveryUser.isAvailable;
      const updatedDelUserProfile = await deliveryUser.save();
      return res.status(201).json(updatedDelUserProfile);
    }
  }
  return res.status(400).json({ error: 'Not Authorised to Updated Del User Profile!' });
}