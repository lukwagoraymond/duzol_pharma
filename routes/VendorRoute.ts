import { Router, Request, Response, NextFunction } from "express";
import { vendorLogin, getVendorProfile, updateVendorProfile, updateVendorService, addProducts, getProducts } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.post('/login', vendorLogin);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello from Vendor" });
});

router.use(authenticate);
router.get('/profile', getVendorProfile);
router.patch('/profile', updateVendorProfile);
router.patch('/service', updateVendorService);

router.get('/products', getProducts);
router.post('/products', addProducts);

export { router as VendorRoute };