import express, { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCustomerInputs, EditCustomerProfileInput, UserLoginInput } from '../dto';
import { generateOtp, generateSignature, hashPassword, onRequestOtp, validatePassword } from '../utils';
import { Customer } from '../models';

/**
 * Business Logic: Creates a new Customer User
 * @req {string} DTO of all neccessary data to create a user
 * @res {string} customer user._id & verify_key: false
 * @return {Object} Status code 201 and customer id + verfiy_key
 */
export const customerSignUp = async (req: Request, res: Response) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);
  const validationErrors = await validate(customerInputs, {validationError: {target: true}});
  if(validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors });
  }
  const { email, phone, password } = customerInputs;
  const { otp, expiry } = generateOtp();
  //check for existing customer user based on email info
  const existingCustomer = await Customer.findOne({ email });
  if(existingCustomer) {
    return res.status(400).json({ error: 'Customer already exists with this EmailID' });
  }
  try {
    const createdUser = await Customer.create({
      email: email,
      password: password,
      phone: phone,
      otp: otp,
      otp_expiry: expiry,
      firstName: '',
      lastName: '',
      address: '',
      verified: false,
      lat: 0,
      lng: 0
    });
    await onRequestOtp(otp, phone);
    // Generate a JWT token Signature
    const signature = await generateSignature({
      _id: createdUser._id.toString(),
      email: createdUser.email,
      verified: createdUser.verified
    });
    return res.status(201).json({ signature, verified: createdUser.verified, email: createdUser.email });
  } catch (err) {
    return res.status(400).json({ error: `Failed to create Customer User: ${err}` });
  }
}

/**
 * Business Logic: Logs a Customer user into system
 * @req {string} Email and Password of the customer user
 * @res {string} customer user._id & verify_key: false
 * @return {Object} Status code 200 and signature + verfiy_key
 */
export const customerLogin = async (req: Request, res: Response) => {
  const customerInputs = plainToClass(UserLoginInput, req.body);
  const validationErrors = await validate(customerInputs, {validationError: {target: true}});
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors });
  }
  const { email, password } = customerInputs;
  const customer = await Customer.findOne({ email });
  if (customer) {
    const user = await validatePassword(password, customer.password);
    if (user) {
      const signature = generateSignature({
        _id: customer._id.toString(),
        email: customer.email,
        verified: customer.verified
      });
      return res.status(200).json({
        signature,
        email: customer.email,
        verified: customer.verified
      });
    }
  }
  return res.status(404).json({ error: 'Error with Signup' });
}

/**
 * Business Logic: Aids 2nd Factor Authentication of Logged in User
 * @req {string} Authenticated user details + OTP token number
 * @res {string} signature, customer user.email & verify_key: true
 * @return {Object} Status code 200 and signature + verfiy_key
 */
export const customerVerify = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const user = req.user;
  if (user) {
    const customer = await Customer.findById(user._id);
    if (customer) {
      if (customer.otp === parseInt(otp) && customer.otp_expiry >= new Date()) {
        customer.verified = true;
        const updatedCustomerProfile = await customer.save();
        const signature = generateSignature({
          _id: updatedCustomerProfile._id.toString(),
          email: updatedCustomerProfile.email,
          verified: updatedCustomerProfile.verified
        });
        return res.status(200).json({ 
          signature, 
          email: updatedCustomerProfile.email,
          verified: updatedCustomerProfile.verified,
        });
      }
    }
  }
  return res.status(400).json({ error: 'User Not Authorized to verify Profile' });
}

/**
 * Business Logic: Aids 2nd Factor Authentication to request OTP token
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {string} SMS with OTP Token
 * @return {Object} Status code 200 and OTP Token to SMS
 */
export const requestOtp = async (req: Request, res: Response) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findById(user._id);
    if (customer) {
      const { otp, expiry } = generateOtp();
      customer.otp = otp;
      customer.otp_expiry = expiry;
      await customer.save();
      const sendOTPToken = await onRequestOtp(otp, customer.phone);
      if (!sendOTPToken) {
        return res.status(400).json({ error: 'Failed to verify your phone Number' });
      }
      return res.status(200).json({ message: 'OTP sent to your registered Mobile Number' });
    }
  }
  return res.status(400).json({ error: 'Error with Requesting OTP Token' });
}

/**
 * Business Logic: Authenticated user gets their Customer details
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of customer user details
 * @return {Object} Status code 200 and customer user details
 */
export const getCustomerProfile = async (req: Request, res: Response) => {
  const user = req.user;
  if (user) {
    const customerProfile = await Customer.findById(user._id);
    if (customerProfile) {
      return res.status(200).json(customerProfile);
    }
  }
  return res.status(400).json({ error: 'User Not Authorized to Fetch Profile' })
}

/**
 * Business Logic: Authenticated user edit their customer details
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of customer user details edited
 * @return {Object} Status code 201 and edited customer user details
 */
export const editCustomerProfile = async (req: Request, res: Response) => {
  const user = req.user;
  const customerInputs = plainToClass(EditCustomerProfileInput, req.body);
  const validationErrors = await validate(customerInputs, {validationError: {target: true}});
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors });
  }
  const { firstName, lastName, address } = customerInputs;
  if(user) {
    const customer = await Customer.findById(user._id);
    if (customer) {
      customer.firstName = firstName;
      customer.lastName = lastName;
      customer.address = address;
      const updatedCustomer = await customer.save();
      return res.status(201).json(updatedCustomer);
    }
  }
  return res.status(400).json({ error: 'User Not Authorized to Update Profile' })
}
