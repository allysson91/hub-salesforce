import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  clientId: process.env.HUB_OAUTH_CLIENT_ID,
  clientSecret: process.env.HUB_OAUTH_CLIENT_SECRET,
  jwtSecret: process.env.HUB_JWT_SECRET,
  accessTokenExpiresIn: process.env.HUB_ACCESS_TOKEN_EXPIRES_IN
    ? parseInt(process.env.HUB_ACCESS_TOKEN_EXPIRES_IN, 10)
    : 3600,
}));
