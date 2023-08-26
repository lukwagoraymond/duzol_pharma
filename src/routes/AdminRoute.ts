import { Router, Request, Response, NextFunction } from "express";
import { createVendor, getVendors, getVendorByID, getTransactions, getTransactionById, verifyDeliveryUser, getDeliveryUsers } from '../controllers';


const router = Router();

/* ----------------------- Vendor Mgt Features ---------------------------- */
router.post('/vendor', createVendor);
router.get('/vendors', getVendors);
router.get('/vendor/:id', getVendorByID);
/* ----------------------- Transaction Features ---------------------------- */
router.get('/transactions', getTransactions);
router.get('/transaction/:id', getTransactionById);
/* ----------------------- Delivery User Mgt Feature ---------------------------- */
router.put('/delivery/verify', verifyDeliveryUser);
router.get('/delivery/users', getDeliveryUsers);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello from Admin" });
})

export { router as AdminRoute };