import User from "../models/UserModel.js";
import argon2 from "argon2";

export const getUser = async(req, res) => {
    try {
        const response = await User.findAll({
            attributes: ['uuid', 'name', 'email', 'role'],
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getUserById = async(req, res) => {
    try {
        const response = await User.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: {
                uuid: req.params.id
            }
        });
        if (!response) return res.status(404).json({msg: "User tidak ditemukan"});
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createUser = async(req, res) => {
    const { name, email, password, confPassword, role } = req.body;
    if(!name || !email || !password || !confPassword || !role) {
        return res.status(400).json({msg: "Semua field harus diisi"});
    }
    if(password !== confPassword) return res.status(400).json({msg: "Password and Confirm Password do not match"});
    
    // Check if email already exists
    const existingUser = await User.findOne({
        where: {
            email: email
        }
    });
    if (existingUser) return res.status(400).json({msg: "Email sudah terdaftar"});
    
    // Validate role
    const validRoles = ['Admin', 'User'];
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({msg: "Role tidak valid. Gunakan Admin atau User"});
    }
    
    const hashPassword = await argon2.hash(password);
    try {
        await User.create({
            name: name,
            email : email,
            password: hashPassword,
            role: normalizedRole
        });
        res.status(201).json({msg: "User berhasil dibuat"});
    } catch (error) { 
        res.status(400).json({msg: error.message});
    }
}

export const updateUser = async(req, res) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!user) return res.status(404).json({msg: "User tidak ditemukan"});
        
        const { name, email, password, confPassword, role } = req.body;
        
        if(!name || !email || !role) {
            return res.status(400).json({msg: "Name, Email, dan Role harus diisi"});
        }
        
        // Validate role
        const validRoles = ['Admin', 'User'];
        const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({msg: "Role tidak valid. Gunakan Admin atau User"});
        }
        
        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({
                where: {
                    email: email
                }
            });
            if (existingUser) return res.status(400).json({msg: "Email sudah digunakan oleh user lain"});
        }
        
        let hashPassword = user.password;
        if(password && password !== "") {
            if(password !== confPassword) {
                return res.status(400).json({msg: "Password and Confirm Password do not match"});
            }
            hashPassword = await argon2.hash(password);
        }
        
        await User.update({
            name: name,
            email: email,
            password: hashPassword,
            role: normalizedRole
        }, {
            where: {
                id: user.id
            }
        });
        res.status(200).json({msg: "User berhasil diupdate"});
    } catch (error) { 
        res.status(400).json({msg: error.message});
    }
}

export const deleteUser = async(req, res) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!user) return res.status(404).json({msg: "User tidak ditemukan"});
        
        await User.destroy({
            where: {
                id: user.id
            }
        });
        res.status(200).json({msg: "User berhasil dihapus"});
    } catch (error) { 
        res.status(400).json({msg: error.message});
    }
}