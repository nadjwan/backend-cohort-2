const express = require("express");
const productRoutes = require("./src/routes/productRoutes");
const userRoutes = require("./src/routes/userRoutes");
const app = express();
const cors = require("cors");
const PORT = 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

// In-memory data store (a mock database)
let users = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
];

// 1. GET Route: Fetch all users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
});

// 2. POST Route: Add a new user
app.post("/users", (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    age: req.body.age,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 3. PUT Route: Update a user's information by their ID
app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name; // update the name
  user.age = req.body.age; // update the age
  res.status(200).json(user);
});

// 4. DELETE Route: Remove a user by their ID
app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(userIndex, 1); // remove 1 item from the array
  res.status(200).json({ message: `User ${userId} deleted successfully` });
});

// Start listening for client requests
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
