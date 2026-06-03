export interface AuthenticatedUser {
  iss: string;
  aud: string;
  sub: string;
  clientId: string;
  grantType: string;
  jti: string;
  iat: number;
  exp: number;
}
