const mongoose = require("mongoose");


const connectDB = async () => {
      const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "MONGO_URI is missing. Check that your backend/.env file exists and contains MONGO_URI."
    );
    process.exit(1);
  }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    
    }
};
module.exports = connectDB;