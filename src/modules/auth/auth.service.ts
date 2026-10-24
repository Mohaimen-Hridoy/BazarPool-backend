import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { config } from '../../config/index.js';
import { UserRole } from '@prisma/client';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const error: any = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Atomically create user and initialize their virtual wallet account
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          role: data.role || 'CONSUMER',
        },
      });

      const wallet = await tx.walletAccount.create({
        data: {
          userId: user.id,
          availableBalance: 1000.0, // Initial bonus/simulation balance for testing
          reservedBalance: 0.0,
        },
      });

      // Create initial top-up ledger entry for transparency
      await tx.walletLedgerEntry.create({
        data: {
          walletAccountId: wallet.id,
          type: 'TOP_UP',
          amount: 1000.0,
          balanceAfter: 1000.0,
          notes: 'Initial community signup credit for simulation',
        },
      });

      return { user, wallet };
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        fullName: result.user.fullName,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        phone: result.user.phone,
        role: result.user.role,
        createdAt: result.user.createdAt,
      },
      wallet: {
        availableBalance: result.wallet.availableBalance,
        reservedBalance: result.wallet.reservedBalance,
      },
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { walletAccount: true },
    });

    if (!user || !user.isActive) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      wallet: user.walletAccount
        ? {
            availableBalance: user.walletAccount.availableBalance,
            reservedBalance: user.walletAccount.reservedBalance,
          }
        : null,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        walletAccount: true,
      },
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      wallet: user.walletAccount
        ? {
            id: user.walletAccount.id,
            availableBalance: user.walletAccount.availableBalance,
            reservedBalance: user.walletAccount.reservedBalance,
          }
        : null,
    };
  }
}
