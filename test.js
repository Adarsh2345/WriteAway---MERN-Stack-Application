
const mongoose = require('mongoose')

mongoose
  .connect('mongodb+srv://Adarsh3:root@adarsh1.xzfbaub.mongodb.net/Blog_github?retryWrites=true&w=majority&appName=Adarsh1')
  .then(() => {
    console.log("Database connected...");
    
  })
  .catch((error) => {
    console.log("Database connection failed:", error.message);
  });