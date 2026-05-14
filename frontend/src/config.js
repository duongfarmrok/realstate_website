// const API_URL='http://localhost:5000/';
// const API_URL = "https://realstate-website-5jpt.onrender.com/";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
//live or hosted url for backend
export default API_URL;
