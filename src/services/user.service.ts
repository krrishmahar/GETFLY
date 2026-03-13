import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/auth.js';
import { RegisterRequest, UserRole } from '../lib/types.js';

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async createUser(data: RegisterRequest) {
    const passwordHash = await hashPassword(data.password);
    
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone || null,
        role: (data.role || 'WORKER') as UserRole,
      },
    });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
