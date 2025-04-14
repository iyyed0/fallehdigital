const { dbPool } = require('../config/db');
const { upload } = require('../config/multer');

exports.getAllProducts = async (req, res) => {
  let connection;
  try {
    connection = await dbPool.getConnection();
    
    // Enhanced query with proper error handling
    const [products] = await connection.query(`
      SELECT 
        p.*, 
        c.name AS category_name,
        sc.name AS subcategory_name,
        CONCAT('http://localhost:5000/uploads/', p.image) AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (err) {
    console.error("Database error:", {
      message: err.message,
      sql: err.sql,
      stack: err.stack
    });
    res.status(500).json({ 
      success: false,
      error: "Database operation failed",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  } finally {
    if (connection) await connection.release();
  }
};

exports.createProduct = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false,
        error: err.message 
      });
    }

    let connection;
    try {
      connection = await dbPool.getConnection();
      const { name, price, description, category_id, subcategory_id, stock } = req.body;
      const image = req.file ? req.file.filename : null;

      // Validation
      if (!name || !price) {
        return res.status(400).json({ 
          success: false,
          error: 'Product name and price are required' 
        });
      }

      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Price must be a positive number' 
        });
      }

      // Start transaction
      await connection.query('START TRANSACTION');

      const [result] = await connection.query(
        `INSERT INTO products 
         (name, price, description, category_id, subcategory_id, stock, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, parseFloat(price), description, category_id, subcategory_id, parseInt(stock), image]
      );

      const [newProduct] = await connection.query(`
        SELECT p.*, 
          c.name AS category_name,
          sc.name AS subcategory_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
        WHERE p.id = ?
      `, [result.insertId]);

      await connection.query('COMMIT');
      
      res.status(201).json({
        success: true,
        product: newProduct[0]
      });
    } catch (err) {
      await connection.query('ROLLBACK');
      console.error("Product creation error:", err);
      res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: err.message 
      });
    } finally {
      if (connection) await connection.release();
    }
  });
};