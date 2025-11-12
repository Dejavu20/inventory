import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export const getProducts = async (req, res) =>{
    try {
        let response;
        if(req.role && req.role.toLowerCase() === "admin"){
            response = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','createdAt','updatedAt'],
                include:[{
                    model: User,
                    attributes:['name','email']
                }],
                order: [['createdAt', 'DESC']]
            });
        }else{
            response = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','createdAt','updatedAt'],
                where:{
                    userId: req.userId
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }],
                order: [['createdAt', 'DESC']]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getProductById = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        let response;
        if(req.role && req.role.toLowerCase() === "admin"){
            response = await Product.findOne({
                attributes:['uuid','name','merek','serialNumber'],
                where:{
                    id: product.id
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }else{
            response = await Product.findOne({
                attributes:['uuid','name','merek','serialNumber'],
                where:{
                    [Op.and]:[{id: product.id}, {userId: req.userId}]
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

// Function to generate unique serial number
const generateSerialNumber = () => {
    // Format: PROD-YYYYMMDD-HHMMSS-XXXX (last 4 chars from UUID)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const uuidPart = uuidv4().replace(/-/g, '').substring(0, 4).toUpperCase();
    
    return `PROD-${year}${month}${day}-${hours}${minutes}${seconds}-${uuidPart}`;
};

export const createProduct = async(req, res) =>{
    // Mendapatkan name dan merek dari request body (serialNumber auto-generated)
    const {name, merek} = req.body;
    
    // Validasi input
    if(!name || !merek) {
        return res.status(400).json({msg: "Nama dan Merek harus diisi"});
    }
    
    if(name.trim().length < 3) {
        return res.status(400).json({msg: "Nama produk minimal 3 karakter"});
    }
    
    if(name.trim().length > 100) {
        return res.status(400).json({msg: "Nama produk maksimal 100 karakter"});
    }
    
    try {
        // Generate serial number otomatis
        let serialNumber = generateSerialNumber();
        
        // Ensure uniqueness (retry if duplicate, though unlikely)
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
            const existing = await Product.findOne({
                where: { serialNumber: serialNumber }
            });
            if (!existing) {
                isUnique = true;
            } else {
                serialNumber = generateSerialNumber();
                attempts++;
            }
        }
        
        if (!isUnique) {
            return res.status(500).json({msg: "Gagal menghasilkan serial number unik"});
        }
        
        const product = await Product.create({
            name: name.trim(),
            merek: merek.trim(),
            serialNumber: serialNumber, 
            userId: req.userId
        });
        
        res.status(201).json({
            msg: "Produk berhasil ditambahkan",
            product: {
                uuid: product.uuid,
                name: product.name,
                merek: product.merek,
                serialNumber: product.serialNumber
            }
        });
    } catch (error) {
        // Handle validation errors
        if(error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => {
                if(err.path === 'name' && err.validatorKey === 'len') {
                    return "Nama produk harus antara 3 hingga 100 karakter";
                }
                if(err.path === 'name' && err.validatorKey === 'notEmpty') {
                    return "Nama produk harus diisi";
                }
                if(err.path === 'merek' && err.validatorKey === 'notEmpty') {
                    return "Merek produk harus diisi";
                }
                if(err.path === 'serialNumber' && err.validatorKey === 'unique') {
                    return "Serial number sudah terdaftar";
                }
                return err.message;
            });
            return res.status(400).json({msg: messages.join(', ')});
        }
        // Handle other errors
        res.status(500).json({msg: error.message || "Gagal menambahkan produk"});
    }
}

export const updateProduct = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        
        const {name, merek} = req.body;
        
        // Validasi input
        if(!name || !merek) {
            return res.status(400).json({msg: "Nama dan Merek harus diisi"});
        }
        
        if(name.trim().length < 3) {
            return res.status(400).json({msg: "Nama produk minimal 3 karakter"});
        }
        
        if(name.trim().length > 100) {
            return res.status(400).json({msg: "Nama produk maksimal 100 karakter"});
        }
        
        if(req.role && req.role.toLowerCase() === "admin"){
            await Product.update({
                name: name.trim(),
                merek: merek.trim()
            },{
                where:{
                    id: product.id
                }
            });
        }else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses terlarang"});
            await Product.update({
                name: name.trim(),
                merek: merek.trim()
            },{
                where:{
                    [Op.and]:[{id: product.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Produk berhasil diupdate"});
    } catch (error) {
        // Handle validation errors
        if(error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => {
                if(err.path === 'name' && err.validatorKey === 'len') {
                    return "Nama produk harus antara 3 hingga 100 karakter";
                }
                if(err.path === 'name' && err.validatorKey === 'notEmpty') {
                    return "Nama produk harus diisi";
                }
                if(err.path === 'merek' && err.validatorKey === 'notEmpty') {
                    return "Merek produk harus diisi";
                }
                return err.message;
            });
            return res.status(400).json({msg: messages.join(', ')});
        }
        res.status(500).json({msg: error.message || "Gagal mengupdate produk"});
    }
}

export const deleteProduct = async(req, res) => {
    try {
        const productUuid = req.params.id;
        
        const product = await Product.findOne({
            where:{
                uuid: productUuid
            },
            attributes: ['id', 'userId']
        });

        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});

        let deletionCondition;

        if(req.role && req.role.toLowerCase() === "admin"){
            deletionCondition = { id: product.id };
        } else {
            if(req.userId !== product.userId) {
                return res.status(403).json({msg: "Akses terlarang"});
            }
            deletionCondition = { 
                [Op.and]: [{ id: product.id }, { userId: req.userId }] 
            };
        }
        
        await Product.destroy({
            where: deletionCondition
        });
        
        res.status(200).json({msg: "Product deleted successfully"});

    } catch (error) {
        res.status(500).json({msg: error.message || "Internal server error"});
    }
}

// Get QR Code for product
export const getProductQRCode = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['id', 'uuid', 'name', 'merek', 'serialNumber', 'userId']
        });
        
        if(!product) {
            return res.status(404).json({msg: "Produk tidak ditemukan"});
        }
        
        // Check access permission
        if(req.role && req.role.toLowerCase() !== "admin") {
            if(req.userId !== product.userId) {
                return res.status(403).json({msg: "Akses terlarang"});
            }
        }
        
        // Create QR code URL (public URL untuk melihat detail produk)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrDataUrl = `${frontendUrl}/products/detail/${product.uuid}`;
        
        // Generate QR code as data URL (PNG)
        const qrCodeDataUrl = await QRCode.toDataURL(qrDataUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1
        });
        
        res.status(200).json({
            qrCode: qrCodeDataUrl,
            qrUrl: qrDataUrl,
            product: {
                uuid: product.uuid,
                name: product.name,
                merek: product.merek,
                serialNumber: product.serialNumber
            }
        });
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal generate QR code"});
    }
}

// Get product detail (public, untuk QR code scan)
export const getProductDetail = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['uuid', 'name', 'merek', 'serialNumber'],
            include:[{
                model: User,
                attributes:['name','email']
            }]
        });
        
        if(!product) {
            return res.status(404).json({msg: "Produk tidak ditemukan"});
        }
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal memuat data produk"});
    }
}

// Get product history (siapa yang input barang)
export const getProductHistory = async(req, res) => {
    try {
        let response;
        if(req.role && req.role.toLowerCase() === "admin"){
            // Admin bisa lihat semua history
            response = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','createdAt','updatedAt'],
                include:[{
                    model: User,
                    attributes:['name','email','role']
                }],
                order: [['createdAt', 'DESC']],
                limit: 50 // Limit 50 terakhir
            });
        }else{
            // User hanya bisa lihat history mereka sendiri
            response = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','createdAt','updatedAt'],
                where:{
                    userId: req.userId
                },
                include:[{
                    model: User,
                    attributes:['name','email','role']
                }],
                order: [['createdAt', 'DESC']],
                limit: 50
            });
        }
        
        // Format response untuk history
        const history = response.map(product => ({
            productName: product.name,
            merek: product.merek,
            serialNumber: product.serialNumber,
            createdBy: product.user.name,
            createdByEmail: product.user.email,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));
        
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({msg: error.message || "Gagal memuat history produk"});
    }
}

// Export products to CSV
export const exportProductsToCSV = async(req, res) => {
    try {
        let products;
        if(req.role && req.role.toLowerCase() === "admin"){
            // Admin bisa export semua produk
            products = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','createdAt','updatedAt'],
                include:[{
                    model: User,
                    attributes:['name','email']
                }],
                order: [['createdAt', 'DESC']]
            });
        }else{
            // User hanya bisa export produk mereka sendiri
            products = await Product.findAll({
                attributes:['uuid','name','merek','serialNumber','createdAt','updatedAt'],
                where:{
                    userId: req.userId
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }],
                order: [['createdAt', 'DESC']]
            });
        }
        
        // Helper function to escape CSV fields
        const escapeCSV = (field) => {
            if (field === null || field === undefined) return '""';
            const stringField = String(field);
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };
        
        // Helper function to format date
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };
        
        // Convert to CSV format
        const csvHeader = 'No,Nama Produk,Merek,Serial Number,Dibuat Oleh,Email,Dibuat Pada,Diupdate Pada\n';
        const csvRows = products.map((product, index) => {
            const row = [
                index + 1,
                product.name,
                product.merek,
                product.serialNumber,
                product.user ? product.user.name : '-',
                product.user ? product.user.email : '-',
                formatDate(product.createdAt),
                formatDate(product.updatedAt)
            ];
            return row.map(escapeCSV).join(',');
        }).join('\n');
        
        const csvContent = csvHeader + csvRows;
        const fileName = `products-${new Date().toISOString().split('T')[0]}.csv`;
        
        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Add BOM for UTF-8 to ensure proper Excel encoding
        const bom = '\ufeff';
        res.status(200).send(Buffer.from(bom + csvContent, 'utf-8'));
    } catch (error) {
        console.error('Error exporting CSV:', error);
        // If headers already sent, can't send JSON error
        if (!res.headersSent) {
            res.status(500).json({msg: error.message || "Gagal export produk ke CSV"});
        }
    }
}