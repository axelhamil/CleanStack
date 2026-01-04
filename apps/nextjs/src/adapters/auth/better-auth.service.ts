import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  AuthResponse,
  AuthSession,
  IAuthProvider,
  Session,
} from "@/application/ports/auth.service.port";
import {
  auth,
  type BetterAuthSessionData,
  type BetterAuthUser,
} from "@/common/auth";
import { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import type { Password } from "@/domain/user/value-objects/password.vo";

export class BetterAuthService implements IAuthProvider {
  async signUp(user: User, password: Password): Promise<Result<AuthResponse>> {
    try {
      const response = await auth.api.signUpEmail({
        body: {
          email: user.get("email").value,
          password: password.value,
          name: user.get("name").value,
          image: user.get("image").toNull() ?? undefined,
        },
      });

      if (!response.user || !response.token) {
        return Result.fail("Sign up failed: No user or token returned");
      }

      const userResult = this.mapUserToDomain(response.user);
      if (userResult.isFailure) {
        return Result.fail(userResult.getError());
      }

      return Result.ok({ user: userResult.getValue(), token: response.token });
    } catch (error) {
      return Result.fail(`Sign up failed: ${error}`);
    }
  }

  async signIn(
    user: User,
    password: Password,
    rememberMe?: boolean,
  ): Promise<Result<AuthResponse>> {
    try {
      const response = await auth.api.signInEmail({
        body: {
          email: user.get("email").value,
          password: password.value,
          rememberMe: rememberMe ?? true,
        },
      });

      if (!response.user || !response.token) {
        return Result.fail("Invalid credentials");
      }

      const userResult = this.mapUserToDomain(response.user);
      if (userResult.isFailure) {
        return Result.fail(userResult.getError());
      }

      return Result.ok({ user: userResult.getValue(), token: response.token });
    } catch (error) {
      return Result.fail(`Sign in failed: ${error}`);
    }
  }

  async signOut(headers: Headers): Promise<Result<void>> {
    try {
      await auth.api.signOut({ headers });
      return Result.ok();
    } catch (error) {
      return Result.fail(`Sign out failed: ${error}`);
    }
  }

  async getSession(headers: Headers): Promise<Result<Option<AuthSession>>> {
    try {
      const response = await auth.api.getSession({ headers });

      if (!response || !response.user || !response.session) {
        return Result.ok(Option.none());
      }

      const userResult = this.mapUserToDomain(response.user);
      if (userResult.isFailure) {
        return Result.fail(userResult.getError());
      }

      const session = this.mapSession(response.session);

      return Result.ok(Option.some({ user: userResult.getValue(), session }));
    } catch (error) {
      return Result.fail(`Get session failed: ${error}`);
    }
  }

  async verifyEmail(_userId: string): Promise<Result<void>> {
    try {
      return Result.ok();
    } catch (error) {
      return Result.fail(`Verify email failed: ${error}`);
    }
  }

  private mapUserToDomain(betterAuthUser: BetterAuthUser): Result<User> {
    const emailResult = Email.create(betterAuthUser.email);
    const nameResult = Name.create(betterAuthUser.name);

    const combined = Result.combine([emailResult, nameResult]);
    if (combined.isFailure) {
      return Result.fail(`Invalid user data: ${combined.getError()}`);
    }

    return Result.ok(
      User.reconstitute(
        {
          email: emailResult.getValue(),
          name: nameResult.getValue(),
          emailVerified: betterAuthUser.emailVerified,
          image: Option.fromNullable(betterAuthUser.image),
          createdAt: betterAuthUser.createdAt,
          updatedAt: betterAuthUser.updatedAt,
        },
        UserId.create(new UUID(betterAuthUser.id)),
      ),
    );
  }

  private mapSession(betterAuthSession: BetterAuthSessionData): Session {
    return {
      id: betterAuthSession.id,
      token: betterAuthSession.token,
      expiresAt: betterAuthSession.expiresAt,
    };
  }
}
