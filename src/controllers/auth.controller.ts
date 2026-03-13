import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { verifyPassword, generateToken } from '../lib/auth.js';
import { RegisterRequest, LoginRequest, ApiResponse, AuthResponse, UserRole } from '../lib/types.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const body: RegisterRequest = req.body;

      if (!body.name || !body.email || !body.password) {
        return res.status(400).json({
          success: false,
          error: "Name, email, and password are required",
        });
      }

      const existingUser = await UserService.findByEmail(body.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      const user = await UserService.createUser(body);
      const token = generateToken(user.id, user.email, user.role as UserRole);

      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: userWithoutPassword,
        },
        message: "User registered successfully",
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const body: LoginRequest = req.body;

      if (!body.email || !body.password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const user = await UserService.findByEmail(body.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      const isValidPassword = await verifyPassword(body.password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      const token = generateToken(user.id, user.email, user.role as UserRole);
      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        data: {
          token,
          user: userWithoutPassword,
        },
        message: "Login successful",
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}
