module.exports = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - Please login' 
      });
    }
    
    // Attach user to request
    req.user = { 
      id: req.session.user.id,
      email: req.session.user.email,
      firstName: req.session.user.firstName
    };
    next();
  };