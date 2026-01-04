import type { Option, Result } from "@packages/ddd-kit";
import type { User } from "@/domain/user/user.aggregate";
import type { Password } from "@/domain/user/value-objects/password.vo";

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface IAuthProvider {
  signUp(
    user: User,
    password: Password,
  ): Promise<Result<{ user: User; session: Session }>>;

  signIn(
    user: User,
    password: Password,
    rememberMe?: boolean,
  ): Promise<Result<Session>>;

  signOut(sessionToken: string): Promise<Result<void>>;

  getSession(
    sessionToken: string,
  ): Promise<Result<Option<{ user: User; session: Session }>>>;

  verifyEmail(userId: string): Promise<Result<void>>;
}
