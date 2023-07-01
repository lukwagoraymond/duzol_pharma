import { Router, Request, Response, NextFunction } from "express";
import { CreateVendor, GetVendors, GetVendorByID } from '../controllers';


const router = Router();

router.post('/vendor', CreateVendor);
router.get('/vendors', GetVendors);
router.get('/vendor/:id', GetVendorByID);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello from Admin" });
})

export { router as AdminRoute };