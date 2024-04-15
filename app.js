const express = require("express");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
const port = 5000;

dotenv.config({path:"MENTIRO_BACKEND/config/config.env"});

// Handling Uncaught Exception
// process.on("uncaughtException",(err)=>{
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`);
//   process.exit(1);
// })


app.use(cors()); // Use cors middleware
app.use(express.json()); // Parse JSON bodies
app.use("/api/users", userRoutes);

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

// async function connect() {
//   // Your existing connection code
// }
// connect();


// Signup endpoint
// app.post('/signup', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if the email is already registered
//     const emailExists = await client.query('SELECT * FROM signup WHERE email = $1', [email]);
//     if (emailExists.rows.length > 0) {
//       return res.status(400).json({ error: 'Email already exists' });
//     }

//     // Insert the new user into the database
//     const newUser = await client.query('INSERT INTO signup (email, password) VALUES ($1, $2) RETURNING *', [email, password]);

//     res.status(201).json(newUser.rows[0]); // Return the created user
//   } catch (error) {
//     console.error('Error occurred:', error);
//     res.status(500).json({ error: 'An internal server error occurred' });
//   }
// });
