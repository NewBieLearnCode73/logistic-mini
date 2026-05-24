export const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET || 'super-secret-key-12345',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
});
