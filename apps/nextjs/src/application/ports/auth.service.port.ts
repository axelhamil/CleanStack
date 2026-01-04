import type { Option, Result } from "@packages/ddd-kit";
import type { User } from "@/domain/user";

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  image?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthSession {
  user: User;
  session: Session;
}

export interface IAuthService {
  signUp(input: SignUpInput): Promise<Result<AuthSession>>;
  signIn(input: SignInInput): Promise<Result<AuthSession>>;
  signOut(sessionToken: string): Promise<Result<void>>;
  getSession(sessionToken: string): Promise<Result<Option<AuthSession>>>;
  verifyEmail(userId: string): Promise<Result<void>>;
}
