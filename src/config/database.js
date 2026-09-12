const mongoose = require("mongoose")

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to database")
    } catch (err) {
        console.error("Database connection failed:", err.message)
        process.exit(1) // Gracefully terminate process if database link fails
    }
}

module.exports = connectToDB
