import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, AuthError } from '../lib/auth.js';
import { JWTUserPayload } from '../lib/types.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTUserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resource'
      });
    }

    next();
  };
};
