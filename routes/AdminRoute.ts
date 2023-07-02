import { Router, Request, Response, NextFunction } from "express";
import { createVendor, getVendors, getVendorByID } from '../controllers';


const router = Router();

router.post('/vendor', createVendor);
router.get('/vendors', getVendors);
router.get('/vendor/:id', getVendorByID);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello from Admin" });
})

export { router as AdminRoute };