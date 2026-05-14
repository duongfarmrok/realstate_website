import Wishlist from "../models/wishlist.model.js";
//to add property to wishlist

export const addWishlist = async (req, res) => {
    try {
        const propertyId =req.params.propertyId;

        const existing = await Wishlist.findOne({ 
            user: req.user._id, 
            property: propertyId 
        });
        if (existing) {
            return res.status(200).json({ message: "Bất động sản đã có trong danh sách yêu thích" });
        }

        await Wishlist.create({
            user: req.user._id,
            property: propertyId
        });
        res.status(201).json({ message: "Bất động sản đã được thêm vào danh sách yêu thích" });             
    }
    catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message });
    }
}

//to get the property that is in wishlist
export const getWishlist = async (req, res) => {
    try {
        const data = await Wishlist.find({
            user: req.user._id }).populate("property");
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message });
    }
}

//to remove property from wishlist
export const removeWishlist = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const result = await Wishlist.findOneAndDelete({
            user: req.user._id,
            property: propertyId
        });
        if (!result) {
            return res.status(404).json({ message: "Bất động sản không tồn tại trong danh sách yêu thích" });
        }
        res.status(200).json({ message: "Bất động sản đã được xóa khỏi danh sách yêu thích" });
    }
    catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message });
    }
}