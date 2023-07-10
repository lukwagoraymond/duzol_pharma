import { Router, Request, Response } from "express";
import multer from "multer";
import { vendorLogin, getVendorProfile, updateVendorProfile, updateVendorService, addProducts, getProducts, updateVendorCoverImage, getCurrentOrders, processOrder, getOrderDetails } from "../controllers";
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
/* ----------------------- Vendor Profile Feature ---------------------------- */
router.get('/profile', getVendorProfile);
router.patch('/profile', updateVendorProfile);
router.patch('/coverImage', images, updateVendorCoverImage);
router.patch('/service', updateVendorService);
/* ----------------------- Vendor Products Feature ---------------------------- */
router.get('/products', getProducts);
router.post('/products', images, addProducts);
/* ----------------------- Order Processing Feature ---------------------------- */
router.get('/orders', getCurrentOrders);
router.put('/order/:id/process', processOrder);
router.get('/order/:id', getOrderDetails);
export { router as VendorRoute };