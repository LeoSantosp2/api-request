export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export type CreateRefreshToken = Omit<
  RefreshToken,
  'revoked_at' | 'created_at'
>;

export interface RefreshTokenRepository {
  listByHash: (hashToken: string) => Promise<RefreshToken | null>;
  create: (refreshToken: CreateRefreshToken) => Promise<void>;
  revoke: (hashToken: string) => Promise<void>;
}
