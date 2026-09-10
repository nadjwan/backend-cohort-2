const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { signAccessToken } = require("../config/auth");

exports.registerUser = async (req, res, next) => {
  try {
    const { name = null, email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "password must be at least 8 characters" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    if (existing.rows[0]) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [name, normalizedEmail, passwordHash],
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.trim().toLowerCase()],
    );

    const user = result.rows[0];
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
    const token = signAccessToken({
      sub: String(safeUser.id),
      email: safeUser.email,
    });
    res.json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};
