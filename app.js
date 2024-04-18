const express = require("express");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');

const app = express();
const port = 5000;

dotenv.config({path:"./config/config.env"});


// Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
})


app.use(cors()); // Use cors middleware
app.use(express.json()); // Parse JSON bodies
app.use("/api/users", userRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// unhandled Promise Rejection
process.on("unhandledRejection",err=>{
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled Promise Rejection`);
server.close(()=>{
  process.exit(1);
})
})