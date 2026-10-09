import jwt from "jsonwebtoken";
import { validateSessionPayload, SESSION_ERROR_CODES, sessionErrorBody } from "../services/sessionService.js";

const JWT_SECRET = process.env.JWT_SECRET || "panda_motors_secret_key_2026";

export const authenticateToken = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token) return res.status(401).json(sessionErrorBody(SESSION_ERROR_CODES.required, "Authentication is required."));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = await validateSessionPayload(decoded);
    if (!session.valid) return res.status(401).json(sessionErrorBody(session.code, "Session is no longer valid."));
    req.user = { ...decoded, name: session.user.name, email: session.user.email, role: session.user.role, tokenVersion: session.user.token_version };
    return next();
  } catch (error) {
    const code = error?.name === "TokenExpiredError" ? SESSION_ERROR_CODES.expired : SESSION_ERROR_CODES.invalid;
    const message = code === SESSION_ERROR_CODES.expired ? "Session has expired. Please sign in again." : "Session is invalid. Please sign in again.";
    return res.status(401).json(sessionErrorBody(code, message));
  }
};

export const checkRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json(sessionErrorBody(SESSION_ERROR_CODES.required, "Authentication is required."));
  if (!roles.includes(req.user.role || "user")) return res.status(403).json({ success:false, error:{ code:"ADMIN_ACCESS_REQUIRED", message:"Access denied. Insufficient permissions.", status:403, details:null } });
  return next();
};

export const optionalAuth = async (req, _res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  req.user = null;
  if (!token) return next();
  try { const decoded=jwt.verify(token,JWT_SECRET); const session=await validateSessionPayload(decoded); if(session.valid) req.user={...decoded,name:session.user.name,email:session.user.email,role:session.user.role,tokenVersion:session.user.token_version}; } catch { req.user=null; }
  return next();
};
export const protect = authenticateToken;
export const adminOnly = checkRole(["admin"]);
export default { authenticateToken, protect, checkRole, adminOnly, optionalAuth };
