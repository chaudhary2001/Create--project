console.log("THIS db.js FILE IS RUNNING ");

const mongoose = require("mongoose");

async function connectDB() {
    const mongoUri = "mongodb://127.0.0.1:27017/todoDB";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected (from correct db.js)");
}

module.exports = connectDB;



