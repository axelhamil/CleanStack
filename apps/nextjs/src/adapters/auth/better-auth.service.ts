import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  IAuthProvider,
  Session,
} from "@/application/ports/auth.service.port";
import type { auth } from "@/common/auth";
import { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import type { Password } from "@/domain/user/value-objects/password.vo";

type BetterAuth = typeof auth;

export class BetterAuthService implements IAuthProvider {
  constructor(private readonly auth: BetterAuth) {}

  async signUp(
    user: User,
    password: Password,
  ): Promise<Result<{ user: User; session: Session }>> {
    try {
      const result = await this.auth.api.signUpEmail({
        body: {
          email: user.get("email").value,
          password: password.value,
          name: user.get("name").value,
          image: user.get("image").toNull() ?? undefined,
        },
      });

      if (!result.user || !result.token) {
        return Result.fail("Sign up failed");
      }

      const createdUser = this.mapUserToDomain(result.user);
      const session: Session = {
        id: crypto.randomUUID(),
        userId: result.user.id,
        token: result.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      return Result.ok({ user: createdUser, session });
    } catch (error) {
      return Result.fail(`Sign up failed: ${error}`);
    }
  }

  async signIn(
    user: User,
    password: Password,
    rememberMe?: boolean,
  ): Promise<Result<Session>> {
    try {
      const result = await this.auth.api.signInEmail({
        body: {
          email: user.get("email").value,
          password: password.value,
          rememberMe: rememberMe ?? false,
        },
      });

      if (!result.token) {
        return Result.fail("Invalid credentials");
      }

      const session: Session = {
        id: crypto.randomUUID(),
        userId: result.user.id,
        token: result.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      return Result.ok(session);
    } catch (error) {
      return Result.fail(`Sign in failed: ${error}`);
    }
  }

  async signOut(sessionToken: string): Promise<Result<void>> {
    try {
      await this.auth.api.signOut({
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(`Sign out failed: ${error}`);
    }
  }

  async getSession(
    sessionToken: string,
  ): Promise<Result<Option<{ user: User; session: Session }>>> {
    try {
      const result = await this.auth.api.getSession({
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!result || !result.user || !result.session) {
        return Result.ok(Option.none());
      }

      const user = this.mapUserToDomain(result.user);
      const session: Session = {
        id: result.session.id,
        userId: result.session.userId,
        token: result.session.token,
        expiresAt: result.session.expiresAt,
      };

      return Result.ok(Option.some({ user, session }));
    } catch (error) {
      return Result.fail(`Get session failed: ${error}`);
    }
  }

  async verifyEmail(userId: string): Promise<Result<void>> {
    try {
      return Result.ok();
    } catch (error) {
      return Result.fail(`Verify email failed: ${error}`);
    }
  }

  private mapUserToDomain(betterAuthUser: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const emailResult = Email.create(betterAuthUser.email);
    if (emailResult.isFailure) {
      throw new Error(`Invalid email: ${emailResult.getError()}`);
    }

    const nameResult = Name.create(betterAuthUser.name);
    if (nameResult.isFailure) {
      throw new Error(`Invalid name: ${nameResult.getError()}`);
    }

    return User.reconstitute(
      {
        email: emailResult.getValue(),
        name: nameResult.getValue(),
        emailVerified: betterAuthUser.emailVerified,
        image: Option.fromNullable(betterAuthUser.image),
        createdAt: betterAuthUser.createdAt,
        updatedAt: betterAuthUser.updatedAt,
      },
      UserId.create(new UUID(betterAuthUser.id)),
    );
  }
}
