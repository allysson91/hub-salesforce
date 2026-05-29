export interface AuthenticatedUser {
  sub: string;
  clientId: string;
  grantType: string;
  iat: number;
  exp: number;
}
