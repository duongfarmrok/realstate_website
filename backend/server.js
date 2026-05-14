import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import propertyRoutes from './routes/property.routes.js'
import inquiryRoutes from './routes/inquiry.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import chatRouter from './routes/chat.routes.js'
import contactRoutes from './routes/contact.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()
const PORT = process.env.PORT || 5000
//DB
connectDB();
//Middleware
const allowedOrigins =[
  "http://localhost:5173",
].filter(Boolean);
app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json())


//Routes
app.use('/api/auth',authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

const server = http.createServer(app)

//socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });
  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("newMessage", data);
});
  socket.on("disconnect", () => {
    
  });
})
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})