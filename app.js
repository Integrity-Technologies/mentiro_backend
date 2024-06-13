const express = require("express");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRouter");
const testRoutes = require("./routes/testRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const questionRoutes = require("./routes/questionRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const resultRoutes = require("./routes/resultRoutes");
const answerRoutes = require('./routes/answerRoutes');
const workArrangementRoutes = require('./routes/workArrangement');
const jobLocationRoutes = require('./routes/jobLocation');
const jobRoleRoutes = require('./routes/jobRole');
const errorMiddleware = require('./middleware/error');

const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

dotenv.config({path:"./config/config.env"});


// Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
})


app.use(cors()); // Use cors middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Use cookie-parser middleware to parse cookies
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/test", testRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/Assessments",assessmentRoutes);
app.use("/api/candidate", candidateRoutes);
app.use('/api/answers', answerRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/workArrangement",workArrangementRoutes);
app.use("/api/jobRole",jobRoleRoutes);
app.use("/api/jobLocation",jobLocationRoutes);
// app.use(errorMiddleware); // Error handling middleware 

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// unhandled Promise Rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled Promise Rejection`);
  server.close(()=>{
      process.exit(1);
    })
    })