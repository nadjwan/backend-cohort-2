const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllProducts,
  getProductById,
  insertProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", authMiddleware, getAllProducts);
router.get("/:id", getProductById);
router.post("/", insertProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
