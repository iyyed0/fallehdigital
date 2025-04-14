const { dbPool } = require('../config/db');

exports.getAllJobOffers = async (req, res) => {
  let connection;
  try {
    connection = await dbPool.getConnection();
    
    let query = `
      SELECT 
        jo.*, 
        u.first_name, 
        u.last_name,
        EXISTS(
          SELECT 1 FROM job_applications ja 
          WHERE ja.job_offer_id = jo.id AND ja.applicant_id = ?
        ) AS has_applied
      FROM job_offers jo
      JOIN users u ON jo.user_id = u.id
    `;
    
    const params = [req.user?.id || null];
    
    if (req.query.filter === 'my' && req.user?.id) {
      query += ' WHERE jo.user_id = ?';
      params.push(req.user.id);
    }
    
    const [offers] = await connection.query(query, params);
    res.json(offers);
    
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

exports.createJobOffer = async (req, res) => {
  let connection;
  try {
    connection = await dbPool.getConnection();
    const { title, description, location, salary, start_date, end_date } = req.body;
    
    if (!title || !description || !location || !start_date || !end_date) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields'
      });
    }

    const [result] = await connection.query(
      `INSERT INTO job_offers 
       (title, description, location, salary, start_date, end_date, user_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`,
      [title, description, location, salary || null, start_date, end_date, req.user.id]
    );

    const [newOffer] = await connection.query(
      `SELECT jo.*, u.first_name, u.last_name 
       FROM job_offers jo 
       JOIN users u ON jo.user_id = u.id 
       WHERE jo.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      offer: newOffer[0]
    });
  } catch (err) {
    console.error('Error creating job offer:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create job offer'
    });
  } finally {
    if (connection) await connection.release();
  }
};

// Similar connection handling for other methods...
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Verify job exists and is available
    const [job] = await pool.query(
      'SELECT * FROM job_offers WHERE id = ?',
      [jobId]
    );
    
    if (job.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    if (job[0].status !== 'available') {
      return res.status(400).json({ 
        success: false,
        error: 'Job is no longer available',
        currentStatus: job[0].status
      });
    }
    
    // Check for existing application
    const [existing] = await pool.query(
      'SELECT * FROM job_applications WHERE job_offer_id = ? AND applicant_id = ?',
      [jobId, userId]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'Already applied',
        application: existing[0]
      });
    }
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Create application
      await pool.query(
        'INSERT INTO job_applications (job_offer_id, applicant_id, status) VALUES (?, ?, "pending")',
        [jobId, userId]
      );
      
      // Update job status if it's the first application
      await pool.query(
        'UPDATE job_offers SET status = "pending" WHERE id = ? AND status = "available"',
        [jobId]
      );
      
      await pool.query('COMMIT');
      
      res.json({ 
        success: true,
        message: 'Application submitted successfully' 
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error applying to job:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to apply to job',
      message: err.message 
    });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const [applications] = await pool.query(
      `SELECT ja.*, u.first_name, u.last_name, u.email
       FROM job_applications ja
       JOIN users u ON ja.applicant_id = u.id
       WHERE ja.job_offer_id = ?`,
      [req.params.id]
    );
    
    res.json({ 
      success: true,
      applications 
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch applications',
      message: err.message 
    });
  }
};