import express, { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCustomerInputs } from '../dto';
import { generateOtp, generateSignature, onRequestOtp } from '../utils';
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
  const existingCustomer = await Customer.find({ email });
  console.log(existingCustomer);
  if(existingCustomer !== null) {
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
 * Business Logic: Authenticates a Customer user into system
 * @req {string} Email and Password of the customer user
 * @res {string} customer user._id & verify_key: false
 * @return {Object} Status code 200 and signature + verfiy_key
 */
export const customerLogin = async (req: Request, res: Response) => {
  //
}

/**
 * Business Logic: Aids 2nd Factor Authentication of Logged in User
 * @req {string} Authenticated user details + OTP token number
 * @res {string} customer user._id & verify_key: true
 * @return {Object} Status code 200 and customer id + verfiy_key
 */
export const customerVerify = async (req: Request, res: Response) => {
  //
}

/**
 * Business Logic: Aids 2nd Factor Authentication to request OTP token
 * @req {string} Authenticated user details like Telephone number
 * @res {string} SMS with OTP Token
 * @return {Object} Status code 200 and OTP Token to SMS
 */
export const requestOtp = async (req: Request, res: Response) => {
  //
}

/**
 * Business Logic: Authenticated user gets their Customer details
 * @req {string} None
 * @res {string} JSON Object of customer user details
 * @return {Object} Status code 200 and customer user details
 */
export const getCustomerProfile = async (req: Request, res: Response) => {
  //
}

/**
 * Business Logic: Authenticated user edit their customer details
 * @req {string} None
 * @res {string} JSON Object of customer user details edited
 * @return {Object} Status code 201 and edited customer user details
 */
export const editCustomerProfile = async (req: Request, res: Response) => {
  //
}
