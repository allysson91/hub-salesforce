import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  clientId: process.env.HUB_OAUTH_CLIENT_ID,
  clientSecret: process.env.HUB_OAUTH_CLIENT_SECRET,
  jwtSecret: process.env.HUB_JWT_SECRET,
  issuer: process.env.HUB_JWT_ISSUER ?? 'hub-salesforce',
  audience: process.env.HUB_JWT_AUDIENCE ?? 'salesforce',
  accessTokenExpiresIn: process.env.HUB_ACCESS_TOKEN_EXPIRES_IN
    ? parseInt(process.env.HUB_ACCESS_TOKEN_EXPIRES_IN, 10)
    : 3600,
}));
