import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  blockUser,
  getAllUsers,
  deleteUser,
  getAllProperties,
  getPendingSellers,
  getAllInquiries,
  approveSeller,
  deleteProperty,
  getDashboardStats,
} from "../controllers/admin.controller.js";

const adminRoutes = express.Router();

// Tất cả các route dưới đây đều yêu cầu đăng nhập và quyền admin
adminRoutes.use(protect, authorize("admin"));

// Quản lý User
adminRoutes.get("/users", getAllUsers);
adminRoutes.patch("/users/block/:id", blockUser);
adminRoutes.delete("/users/:id", deleteUser);

// Quản lý Bất động sản
adminRoutes.get("/properties", getAllProperties);
adminRoutes.delete("/properties/:id", deleteProperty);

// Quản lý Yêu cầu tư vấn
adminRoutes.get("/inquiries", getAllInquiries);

adminRoutes.get("/stats", getDashboardStats);

// Quản lý Duyệt Seller
adminRoutes.get("/pending-sellers", getPendingSellers);
adminRoutes.patch("/approve-seller/:id", approveSeller);


export default adminRoutes;
