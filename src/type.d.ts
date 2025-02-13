export interface JwtUserData {
  userId: number;
  username: string;
  permissions?: [];
  roles?: [];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}