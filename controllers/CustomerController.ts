import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCustomerInputs, EditCustomerProfileInput, UserLoginInput, CartItem, OrderInputs } from '../dto';
import { generateOtp, generateSignature, onRequestOtp, validatePassword } from '../utils';
import { Customer, DeliveryUser, Offer, Order, Product, Transaction, Vendor } from '../models';

/* ---------------------------- Customer Mgt Section ---------------------------------- */

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
      lng: 0,
      cart: [],
      orders: []
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
  return res.status(404).json({ error: 'Error with Signin!' });
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
/* ---------------------------- Cart Section ---------------------------------- */

/**
 * Business Logic: Authenticated user adds product item to Cart
 * @req {Object} Authenticated Customer Payload Id, email, verified + 
 *                { Product._id, unit number }
 * @res {Object} JSON Customer Oject with Cart key Populated
 * @return {Object} Status code 201 + Cart key populated with product items
 */
export const addToCart = async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findById(user._id).populate('cart.product');
    let cartItems = Array();
    //console.log(`First CartArray: ${cartItems}`);
    const requestCartItems = <CartItem>req.body;
    //console.log(`Requested CartItems: ${requestCartItems._id, requestCartItems.unit}`);
    const product = await Product.findById(requestCartItems._id);
    //console.log(`Product: ${product}`);
    if (product) {
      if (customer) {
        // Check for Cart items
        cartItems = customer.cart;
        //console.log(`First CartArray: ${cartItems}`);
        if (cartItems.length > 0) {
          // check cart and update unit number
          let existProductItem = cartItems.filter((item) => 
          item.product._id.toString() === requestCartItems._id);
          //console.log(`Existing Products: ${existProductItem}`);
          if (existProductItem.length > 0) {
            const index = cartItems.indexOf(existProductItem[0]);
            //console.log(`Print Index: ${index}`);
            if (requestCartItems.unit > 0) {
              cartItems[index] = { product, unit: requestCartItems.unit };
              //console.log(`Update 1: CartArray: ${cartItems}`);
            } else {
              // if product unit == 0 then remove from cart array
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ product, unit: requestCartItems.unit });
          }
        } else {
          // add new item product to cart
          cartItems.push({ product, unit: requestCartItems.unit });
        }
        if (cartItems) {
          //console.log(`Update 2: CartArray: ${cartItems}`);
          customer.cart = cartItems as any;
          const updatedCustomerCart = await customer.save();
          return res.status(201).json(updatedCustomerCart.cart);
        }
      }
    }
  }
  return res.status(400).json({ error: "Can't Add Order to Cart!" });
}

/**
 * Business Logic: Authenticated user gets current product items in cart
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of product items in cart currently
 * @return {Object} Status code 200 + products in cart.
 */
export const getCart =async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findById(user._id);
    if (customer) {
      return res.status(200).json(customer.cart);
    } else {
      return res.status(404).json({ error: 'Cart is Empty!' });
    }
  }
  return res.status(400).json({ error: 'User Not Authorised to see Cart!' });
}

/**
 * Business Logic: Authenticated user empties items in their cart
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of Empty Customer Cart
 * @return {Object} Status code 200 + Customer Profile with Empty Cart
 */
export const deleteCart = async (req:Request, res:Response) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findById(user._id).populate('cart.product').exec();
    if (customer) {
      customer.cart = [] as any;
      const updatedCustomerCart = await customer.save();
      return res.status(200).json(updatedCustomerCart);
    }
  }
  res.status(400).json({ error: 'Not Authorised to Delete Cart!'});
}

/* ---------------------------- Payment Section ---------------------------------- */

/**
 * Business Logic: Authenticated user Initiates a Payment for an Order
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of validated offer
 * @return {Object} Status code 200 + Validated Offer
 */
export const createPayment = async (req:Request, res:Response) => {
  const user = req.user;
  const { amount, paymentMode, offerId } = req.body;
  let payableAmount = Number(amount);
  if (user) {
    const applied4Offer = await Offer.findById(offerId);
    if (applied4Offer!.isActive) {
      payableAmount = (payableAmount - applied4Offer!.offerAmount);
    }
    // continue to perform Payment Gateway with DusuPay / PayU || ? API - For Later
    // is status key after payment gateway is failed then dont create transaction record. for OPEN
    // works when its cash on delivery.
    // Create a record of the transaction from the above Payment Gateway
    const transaction = await Transaction.create({
      customerId: user._id,
      vendorId: '',
      orderId: '',
      orderValue: payableAmount,
      offerUsed: offerId || 'NA',
      status: 'OPEN',
      paymentMode: paymentMode,
      paymentResponse: 'Payment is cash on Delivery'
    });
    if (transaction) {
      return res.status(201).json(transaction);
    } else {
      return res.status(400).json({ error: 'Transaction was not Created!' });
    }
  }
  return res.status(400).json({ error: 'Customer Not Authorised to Make Payment!' });
}

/* ---------------------------- Delivery Notification Section ------------------- */

/** Util Function to Support Notify Delivery User when order is created */
const assignOrder4Delivery = async (orderId: string, vendorId: string) => {
  // find the vendor
  const vendor = await Vendor.findById(vendorId);
  if (vendor) {
    const areaPostalCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;
    // find available delivery person **Challenge for places outside Kampala & Wakiso**
    const deliveryPerson = await DeliveryUser.find({ pincode: areaPostalCode, verified: true, isAvailable: true });
    if (deliveryPerson) {
      // Check for the nearest delivery person using Google Map API & Assign the Order
      const currentOrder = await Order.findById(orderId);
      if (currentOrder) {
        //update Delivery ID under Order model
        if (deliveryPerson.length > 0) {
          // Using deliveryPerson Array 1st index since not nearest neighbour Algorithm used for now
          currentOrder.deliveryId = deliveryPerson[0]._id;
        } else {
          currentOrder.deliveryId = 'SELF_DELIVERY';
        }
        await currentOrder.save();
        // Notify the vendor for received order by Delivery User in FireBase Push Notification
      }
    }
  }
}

/* ---------------------------- Order Section ---------------------------------- */

/** Util Function to Support Verification of Transaction before Order is Created */
const validateTransaction = async(transactionId: string) => {
  const currentTransaction = await Transaction.findById(transactionId);
  if (currentTransaction) {
    if (currentTransaction.status.toLowerCase() !== 'failed') {
      return { status: true, currentTransaction };
    }
  }
  return { status: false, currentTransaction };
}

/**
 * Business Logic: Authenticated user creates an Order based on Products
 * @req {Object} Authenticated Customer Payload Id, email, verified + 
 *                { Product._id, unit }
 * @res {Object} JSON Object of customer profile with product items ordered
 * @return {Object} Status code 201 + customer profile with cart items ordered
 */
export const createOrder = async (req: Request, res: Response) => {
  const user = req.user;
  // amount - tansaction.orderAmount
  const { transactionId, amount, items } = <OrderInputs>req.body
  if (user) {
    // Validate Transaction Payment of earlier placed Cart Products
    const { status, currentTransaction } = await validateTransaction(transactionId);
    if (!status) {
      return res.status(404).json({ error: "Order not Created Pending Payment!" });
    }
    const customer = await Customer.findById(user._id);
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
    let cartItems = Array();
    let netAmount = 0.0;
    let vendorId: any;
    const products = await Product.find().where('_id').in(items.map(item => item._id)).exec();
    products.map(product => {
      items.map(({_id, unit}) => {
        if(product._id == _id) {
          vendorId = product.vendorId;
          netAmount += (product.price * unit);
          cartItems.push({ product, unit });
        }
      });
    });
    if (cartItems) {
      // Create an Order
      const orderCreated = await Order.create({
        orderId: orderId,
        vendorId: vendorId,
        items: cartItems,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: 'Waiting',
        paymentResponse: 'I want it Top',
        deliveryId: '',
        deliveryTime: 33
      });
      // Add created Order to customer profile
      if (orderCreated) {
        if (customer != undefined) {
          customer.cart = [] as any;
        }
        customer?.orders.push(orderCreated);
        // Update Current Customer Transaction object
        currentTransaction!.vendorId = vendorId;
        currentTransaction!.orderId = orderId;
        currentTransaction!.status = 'CONFIRMED';
        await currentTransaction?.save();
        await assignOrder4Delivery(orderCreated._id, vendorId);
        const updatedCustomerProfile = await customer?.save();
        return res.status(200).json(updatedCustomerProfile);
      }
    }
  }
  return res.status(400).json({ error: 'Error with Created Order!' });
}

/**
 * Business Logic: Authenticated user's orders placed
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of customer product orders
 * @return {Object} Status code 200 + orders tagged to a user
 */
export const getOrders = async (req: Request, res: Response) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findById(user._id).populate('orders');
    if (customer) {
      return res.status(200).json(customer.orders);
    }
  }
  return res.status(400).json({ error: 'User Not Authorised to Access Orders' });
}

/**
 * Business Logic: Authenticated user gets particular order details
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of particular order details
 * @return {Object} Status code 200 + particular order details
 */
export const getOrdersById = async (req: Request, res: Response) => {
  const orderId = req.params.id;
  if (orderId) {
    const order = await Order.findById(orderId).populate('items.product');
    if (order) {
      return res.status(200).json(order);
    }
  }
  return res.status(404).json({ error: 'Order Not Found' });
}
/* ---------------------------- Apply Offers Section ---------------------------------- */

/**
 * Business Logic: Authenticated user verifies validity of said offer
 * @req {Object} Authenticated Customer Payload Id, email, verified
 * @res {Object} JSON Object of validated offer
 * @return {Object} Status code 200 + Validated Offer
 */
export const verifyOffer = async (req:Request, res:Response) => {
  const offerId = req.params.id;
  const user = req.user;
  if (user) {
    const applied4Offer = await Offer.findById(offerId);
    if (applied4Offer) {
      if (applied4Offer.isActive) {
        return res.status(200).json({ message: 'Offer is Valid', offer: applied4Offer });
      }
    } else {
      return res.status(404).json({ error: 'Applied for Offer Not Found!' });
    }
  }
  return res.status(400).json({ error: 'User Not Authorised to Access Offer!' });
}
