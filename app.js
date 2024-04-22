const express = require("express");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRouter");
const testRoutes = require("./routes/testRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = 5000;

dotenv.config({path:"./config/config.env"});


// Handling Uncaught Exception
// process.on("uncaughtException",(err)=>{
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`);
//   process.exit(1);
// })


app.use(cors()); // Use cors middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Use cookie-parser middleware to parse cookies
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/test", testRoutes);
app.use("/api/category", categoryRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// unhandled Promise Rejection
// process.on("unhandledRejection",err=>{
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to unhandled Promise Rejection`);
// server.close(()=>{
//   process.exit(1);
// })
// })