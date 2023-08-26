import { Request } from 'express';
import bcrypt from 'bcrypt';
import jwt, { sign } from 'jsonwebtoken';
import { AuthPayload } from '../dto';
//import { APP_SECRET } from '../config';
import 'dotenv/config';

// Generate Salt for hashing password
export const generateSalt = async () => {
  return await bcrypt.genSalt();
}

// Hash incoming password with Salt
export const hashPassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
}

// Validate incoming Password to DB Password Stored
export const validatePassword = async (enteredPassword: string, savedPassword: string) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
}

// Validate incoming Password to DB Password Stored 2nd Option
export const validatePassword2 = async (enteredPassword: string, savedPassword: string, salt: string) => {
  return await hashPassword(enteredPassword, salt) === savedPassword;
}

// Utility function to generate signature to be used for JWT
export const generateSignature = (payload: AuthPayload) => {
  // Measured in seconds: days*hours*minutes*seconds
  const maxAge = 3 * 24 * 60 * 60;
  const signature = sign(payload, `${process.env.APP_SECRET}`, {expiresIn: maxAge});
  return signature;
}

// Utility Function to validate token jwt signature of incoming requests
export const validateSignature = async (req: Request) => {
  const signature = req.get('Authorization');
  if (signature) {
    const payload = await jwt.verify(signature.split(' ')[1], `${process.env.APP_SECRET}`) as AuthPayload;
    req.user = payload;
    return true;
  }
  return false;
}
