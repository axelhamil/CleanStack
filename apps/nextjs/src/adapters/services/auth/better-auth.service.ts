import { Option, Result } from "@packages/ddd-kit";
import { userToDomain } from "@/adapters/mappers/user.mapper";
import type {
  AuthResponse,
  AuthSession,
  IAuthProvider,
  Session,
} from "@/application/ports/auth.service.port";
import { auth, type BetterAuthSessionData } from "@/common/auth";
import type { User } from "@/domain/user/user.aggregate";
import type { Password } from "@/domain/user/value-objects/password.vo";

interface AuthApiResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  token?: string | null;
}

export class BetterAuthService implements IAuthProvider {
  private mapAuthResponse(
    response: AuthApiResponse,
    errorMsg: string,
  ): Result<AuthResponse> {
    if (!response.user || !response.token) {
      return Result.fail(errorMsg);
    }
    const userResult = userToDomain(response.user);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError());
    }
    return Result.ok({ user: userResult.getValue(), token: response.token });
  }

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
      return this.mapAuthResponse(
        response,
        "Sign up failed: No user or token returned",
      );
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
      return this.mapAuthResponse(response, "Invalid credentials");
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

      const userResult = userToDomain(response.user);
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

  private mapSession(betterAuthSession: BetterAuthSessionData): Session {
    return {
      id: betterAuthSession.id,
      token: betterAuthSession.token,
      expiresAt: betterAuthSession.expiresAt,
    };
  }
}
