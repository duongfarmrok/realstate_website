import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

//protect
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization 
            &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            if(req.user && req.user.isBlocked) {
                return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
            }
            next();
        } 
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};


//role based authentication
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }
        next();
    };
};