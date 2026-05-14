import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();
chatRouter.use(protect);

//to create a chat
chatRouter.post("/start", async (req, res) => {
  try {
    const { propertyID, sellerId, buyerId: providerBuyerId } = req.body;
    let buyerId, finalSellerId;
    if (req.user.role === "seller") {
      buyerId = providerBuyerId;
      finalSellerId = req.user._id;
    } else {
      buyerId = req.user._id;
      finalSellerId = sellerId;
    }
    if (!buyerId || !finalSellerId) {
      return res.status(400).json({
        message: "Missing buyer or seller ID",
      });
    }
    //check for an existing chat btw this buyer and seller
    let chat = await Chat.findOne({
      buyer: buyerId,
      seller: finalSellerId,
    });

    if (!chat) {
      chat = await Chat.create({
        property: propertyID,
        buyer: buyerId,
        seller: finalSellerId,
        messages: [],
      });
    }

    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images");
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

//to send message
chatRouter.post("/send", async (req, res) => {
  try {
    const { chatId, text, image } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    //ensure sender is part of the chat
    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not a participant of this chat" });
    }

    const newMessage = {
      sender: userId,
      text,
      image,
      createdAt: new Date(),
    };
    chat.messages.push(newMessage);
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

//to get chats for user
chatRouter.get("/user", async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images")
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching chats",
      error: error.message,
    });
  }
});

//to get chat message
chatRouter.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "messages.sender",
      "name profilePic",
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const userId = req.user._id.toString();
    if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching chat messages",
      error: error.message,
    });
  }
});

//to delete an entire chat
chatRouter.delete("/:chatId", async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    //now we ensure the user is part of the chat
    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Chat.findByIdAndDelete(req.params.chatId);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting chat",
      error: error.message,
    });
  }
});

//to delete specific message
chatRouter.delete("/:chatId/message/:messageId", async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    //only sender can delete their message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    chat.messages.pull(req.params.messageId);
    await chat.save();
    res.status(200).json({ message: "Message deleted successfully", chat });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
    });
  }
});

export default chatRouter;
