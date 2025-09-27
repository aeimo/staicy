import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { User } from '../../types';

const prisma = new PrismaClient();

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('User already exists with this email.', 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'CONTRIBUTOR'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        user,
        token,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          teams: {
            include: {
              team: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('Invalid credentials.', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials.', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a more sophisticated setup, you might want to blacklist the token
      // For now, we'll just return a success message
      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required.', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string };
      
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
        throw new AppError('Invalid refresh token.', 401);
      }

      // Generate new access token
      const newToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        token: newToken,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect.', 400);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated.', 401);
      }

      const { password: _, ...userWithoutPassword } = req.user;

      res.json({
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Check if email is already taken by another user
      if (email && email !== req.user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          throw new AppError('Email already taken by another user.', 409);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email })
        },
        include: {
          teams: {
            include: {
              team: true
            }
          }
        }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        user: userWithoutPassword,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
