import express from "express";
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getProductQRCode,
    getProductDetail,
    getProductHistory,
    exportProductsToCSV } 
    from "../controllers/Products.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/products',verifyUser, getProducts);
router.get('/products/history',verifyUser, getProductHistory);
router.get('/products/export/csv',verifyUser, exportProductsToCSV);
router.get('/products/:id',verifyUser, getProductById);
router.get('/products/:id/qrcode',verifyUser, getProductQRCode);
router.get('/products/:id/detail', getProductDetail); // Public route untuk QR code scan
router.post('/products',verifyUser, createProduct);
router.patch('/products/:id',verifyUser, updateProduct);
router.delete('/products/:id',verifyUser, deleteProduct);

export default router;