import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { vendorLogin, getVendorProfile, updateVendorProfile, updateVendorService, addProducts, getProducts, updateVendorCoverImage } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

// Configuration for DiskStorage of Image Multi-part Form Data
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'images');
  },
  filename: function(req, file, cb) {
    cb(null, `${new Date().toISOString()}_${file.originalname}`)
  }
});
const images = multer({ storage: storage }).array('images', 20)

router.post('/login', vendorLogin);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello from Vendor" });
});

router.use(authenticate);
router.get('/profile', getVendorProfile);
router.patch('/profile', updateVendorProfile);
router.patch('/coverImage', images, updateVendorCoverImage);
router.patch('/service', updateVendorService);

router.get('/products', getProducts);
router.post('/products', images, addProducts);

export { router as VendorRoute };