import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';
import { User } from '../types';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid token. User not found.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired.', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions.', 403));
    }

    next();
  };
};

export const requireTeamAccess = (teamId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    // Check if user is admin or has access to the team
    const hasAccess = req.user.role === 'ADMIN' || 
      req.user.teams.some(member => member.teamId === teamId);

    if (!hasAccess) {
      return next(new AppError('Access denied to this team.', 403));
    }

    next();
  };
};

export const requireDocumentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const documentId = req.params.id || req.params.documentId;
    if (!documentId) {
      return next(new AppError('Document ID required.', 400));
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { team: true }
    });

    if (!document) {
      return next(new AppError('Document not found.', 404));
    }

    // Check if user has access to the document's team
    const hasAccess = req.user.role === 'ADMIN' || 
      req.user.teams.some(member => member.teamId === document.teamId);

    if (!hasAccess) {
      return next(new AppError('Access denied to this document.', 403));
    }

    req.document = document;
    next();
  } catch (error) {
    next(error);
  }
};
