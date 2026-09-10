const pool = require("../config/db");

const normalizeProduct = (product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  rating: product.rating,
  description: product.description,
  category: product.category,
  brand: product.brand,
});

// GET all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.status(200).json(result.rows.map(normalizeProduct));
  } catch (error) {
    next(error);
  }
};

// 1. GET a single product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(normalizeProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
};

// 2. INSERT a new product
exports.insertProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;

    // Optional: basic validation
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price],
    );

    res.status(201).json(normalizeProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE an existing product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const result = await pool.query(
      "UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(normalizeProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
};

// 4. DELETE a product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: `Product ${id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};
