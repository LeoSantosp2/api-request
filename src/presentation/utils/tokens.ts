import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';

import env from '../../infrastructure/config/env';

export const generateAccessToken = (id: string, email: string) =>
  jwt.sign({ id: id, email: email }, env.TOKEN_SECRET, {
    expiresIn: env.TOKEN_EXPIRATION as SignOptions['expiresIn'],
  });

export const generateRefreshToken = () =>
  crypto.randomBytes(64).toString('hex');

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const expiresRefreshToken = () =>
  new Date(
    Date.now() + Number(env.REFRESH_TOKEN_EXPIRATION) * 24 * 60 * 60 * 1000,
  );
