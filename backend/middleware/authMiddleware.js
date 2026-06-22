import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

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

};