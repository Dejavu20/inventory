import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize";

export const getProducts = async (req, res) =>{
    try {
        let response;
        if(req.role === "admin"){
            response = await Product.findAll({
                attributes:['uuid','name','merek'],
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }else{
            response = await Product.findAll({
                attributes:['uuid','name','merek'],
                where:{
                    userId: req.userId
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

export const getProductById = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        let response;
        if(req.role === "admin"){
            response = await Product.findOne({
                attributes:['uuid','name','merek'],
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
                attributes:['uuid','name','merek'],
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

export const createProduct = async(req, res) =>{
    // Mendapatkan name, merek, dan serialNumber dari request body
    const {name, merek, serialNumber} = req.body;
    
    try {
        await Product.create({
            name: name,
            merek: merek,
            serialNumber: serialNumber, 
            userId: req.userId
        });
        res.status(201).json({msg: "Product Created Successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
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
        if(req.role === "admin"){
            await Product.update({name, merek},{
                where:{
                    id: product.id
                }
            });
        }else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses terlarang"});
            await Product.update({name, merek},{
                where:{
                    [Op.and]:[{id: product.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Product updated successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
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

        if(req.role === "admin"){
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