import { Request, Response, NextFunction } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { validateSignature } from "../utils";

// Add user type to Global Express internal Module
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = async (req:Request, res:Response, next:NextFunction ) => {
  const validate = await validateSignature(req);
  if (validate) {
    next();
  } else {
    return res.status(400).json({ error: 'User not Authorized' });
  }
}