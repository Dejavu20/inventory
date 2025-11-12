import User from "../models/UserModel.js";

export const verifyUser = async (req, res, next) => {
    if(!req.session.userId){
        return res.status(401).json({msg: "Mohon login ke akun Anda"});
    }
    
    const user = await User.findOne({
        where: {
            uuid: req.session.userId
        }
    });
    
    if (!user) return res.status(404).json({msg: "User tidak ditemukan"});
    
    // PERBAIKAN: Mengganti 'res' menjadi 'req' agar data dapat diakses oleh controller
    req.userId = user.id;    
    req.role = user.role;    
    
    next();
}

export const adminOnly = async (req, res, next) => {
    // OPTIMASI: Cek langsung req.role yang sudah di-injeksi oleh verifyUser.
    // Asumsi: adminOnly dijalankan SETELAH verifyUser.
    
    // PENTING: Perhatikan kapitalisasi ('Admin') - case-insensitive check
    if (!req.role || req.role.toLowerCase() !== "admin") {
        return res.status(403).json({msg: "Akses terlarang. Hanya admin yang dapat mengakses"});
    }
    
    next();
}
