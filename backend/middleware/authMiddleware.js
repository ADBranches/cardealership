// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [decoded.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

<<<<<<< HEAD
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
=======
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const adminOnly = (req,res,next)=>{


  if(!req.user){

    return res.status(401).json({
      message:"Not authenticated"
    });

  }


  if(req.user.role !== "admin"){

    return res.status(403).json({
      message:"Admin access required"
    });

  }


  next();

>>>>>>> a32549b8176a45ef98887f247a6345ce7ee89844
};