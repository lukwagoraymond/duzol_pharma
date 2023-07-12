import { Router } from "express";
import { getOffersAvailable, getPharmacyById, getProductAvailability, getProductIn30min, getTopPharmacies, searchProducts } from "../controllers";

const router = Router();

/** -------------------- Medi Product Availability ---------------------- */
router.get('/:pincode', getProductAvailability);
/** -------------------- Top Pharmacies ---------------------- */
router.get('/top-pharmacies/:pincode', getTopPharmacies);
/** -------------------- Medi Products Available before 30min ---------------------- */
router.get('/products-in-30-min/:pincode', getProductIn30min);
/** -------------------- Search Medi Products ---------------------- */
router.get('/search/:pincode', searchProducts);
/** -------------------- Find Pharmacies By ID ---------------------- */
router.get('/pharmacy/:id', getPharmacyById);
/** -------------------- Search Offers ---------------------- */
router.get('/offers/:pincode', getOffersAvailable);

export { router as ShoppingRoute }