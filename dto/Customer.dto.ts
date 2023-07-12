import { IsEmail, Length } from "class-validator";

export class CreateCustomerInputs {
  @IsEmail()
  email: string;

  @Length(7, 13)
  phone: string;

  @Length(6, 24)
  password: string
}

// Add validation to phone to make sure its in form of +256787592891 <countrycode><number>

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}

export class UserLoginInput {
  @IsEmail()
  email: string;

  @Length(6, 24)
  password: string;
}

export class EditCustomerProfileInput {
  @Length(2, 20)
  firstName: string;

  @Length(2, 20)
  lastName: string;

  @Length(3, 57)
  address: string;
}

export class CartItem {
  _id: string;
  unit: number;
}

export class OrderInputs {
  transactionId: string;
  amount: string;
  items: [CartItem];
}