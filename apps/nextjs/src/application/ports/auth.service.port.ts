import type { Option, Result } from "@packages/ddd-kit";
import type { User } from "@/domain/user/user.aggregate";
import type { Password } from "@/domain/user/value-objects/password.vo";

export interface Session {
  id: string;
  token: string;
  expiresAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthSession {
  user: User;
  session: Session;
}

export interface IAuthProvider {
  signUp(user: User, password: Password): Promise<Result<AuthResponse>>;

  signIn(
    user: User,
    password: Password,
    rememberMe?: boolean,
  ): Promise<Result<AuthResponse>>;

  signOut(headers: Headers): Promise<Result<void>>;

  getSession(headers: Headers): Promise<Result<Option<AuthSession>>>;

  verifyEmail(userId: string): Promise<Result<void>>;
}
