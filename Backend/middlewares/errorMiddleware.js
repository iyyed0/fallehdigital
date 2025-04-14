module.exports = (err, req, res, next) => {
    console.error(err.stack);
    
    // Handle Multer errors specifically
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Maximum file size is 5MB'
      });
    }
  
    if (err.message.includes('image')) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only images are allowed (jpeg, jpg, png, gif)'
      });
    }
  
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  };