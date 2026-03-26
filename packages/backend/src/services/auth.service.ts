import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { jwtConfig } from '../config/jwt';

function generateToken(user: User): string {
  const options: SignOptions = { expiresIn: jwtConfig.expiresIn as any };
  return jwt.sign({ userId: user.id, email: user.email }, jwtConfig.secret, options);
}

export async function register(email: string, name: string, password: string) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.name = 'ConflictError';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, password: hashedPassword });

  const token = generateToken(user);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.name = 'UnauthorizedError';
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.name = 'UnauthorizedError';
    throw error;
  }

  const token = generateToken(user);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}
