import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";

//view all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//block a particular user

export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      success: true,
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//to delete a particular user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//view all properties

export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("seller", "name email");
    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//to delete a particular property
// export const deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }
//     await property.remove();
//     res.json({ message: "Property deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
// to delete a particular property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete Property Error:", error); // ← Quan trọng
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
//to view all inquiries

export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("property", "title")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Server error",
    });
  }
};

//Dashboard analytics

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();

    const activeListings = await Property.countDocuments({
      status: "sale",
    });

    const soldProperties = await Property.countDocuments({
      status: "sold",
    });
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        activeListings,
        soldProperties,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//to get pending seller account

export const getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: "seller",
      isApproved: false,
    }).select("-password");
    //if you are a seller and you want to view your pending status
    res.json({
      success: true,
      count: pendingSellers.length,
      pendingSellers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//now to approve or reject a seller account

export const approveSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }
    seller.isApproved = true;
    await seller.save();
    res.json({ success: true, message: "Seller approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
