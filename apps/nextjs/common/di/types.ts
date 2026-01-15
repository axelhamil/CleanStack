import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { GetSessionUseCase } from "@/application/use-cases/auth/get-session.use-case";
import type { SignInUseCase } from "@/application/use-cases/auth/sign-in.use-case";
import type { SignOutUseCase } from "@/application/use-cases/auth/sign-out.use-case";
import type { SignUpUseCase } from "@/application/use-cases/auth/sign-up.use-case";
import type { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import type { CreateCheckoutSessionUseCase } from "@/application/use-cases/billing/create-checkout-session.use-case";

export const DI_SYMBOLS = {
  IUserRepository: Symbol.for("IUserRepository"),
  IAuthProvider: Symbol.for("IAuthProvider"),
  IPaymentProvider: Symbol.for("IPaymentProvider"),
  IEventDispatcher: Symbol.for("IEventDispatcher"),
  SignInUseCase: Symbol.for("SignInUseCase"),
  SignUpUseCase: Symbol.for("SignUpUseCase"),
  SignOutUseCase: Symbol.for("SignOutUseCase"),
  GetSessionUseCase: Symbol.for("GetSessionUseCase"),
  VerifyEmailUseCase: Symbol.for("VerifyEmailUseCase"),
  CreateCheckoutSessionUseCase: Symbol.for("CreateCheckoutSessionUseCase"),
};

export interface DI_RETURN_TYPES {
  IUserRepository: IUserRepository;
  IAuthProvider: IAuthProvider;
  IPaymentProvider: IPaymentProvider;
  IEventDispatcher: IEventDispatcher;
  SignInUseCase: SignInUseCase;
  SignUpUseCase: SignUpUseCase;
  SignOutUseCase: SignOutUseCase;
  GetSessionUseCase: GetSessionUseCase;
  VerifyEmailUseCase: VerifyEmailUseCase;
  CreateCheckoutSessionUseCase: CreateCheckoutSessionUseCase;
}
