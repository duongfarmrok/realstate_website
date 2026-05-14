import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

//Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      user
    });
}
catch (error) {res.status(500).json({success: false, message: error.message });
  }
};


//to get public profile of user
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name profilePic role createdAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//update profile
export const updateProfile = async (req, res) => {
  try {
    const { name,phone , address, removeProfilePic } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    } 
    
    //image handling
    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, "profiles");
        user.profilePic = result.secure_url;
    }else if (removeProfilePic === "true") {
        user.profilePic = null;
    }

    if(name!==undefined) user.name = name;
    if(phone!==undefined) user.phone = phone;
    if(address!==undefined) user.address = address;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      user: updatedUser
    });
   
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};