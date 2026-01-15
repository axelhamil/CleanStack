import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const validProviders = ["openai", "anthropic", "google"] as const;
export type ProviderType = (typeof validProviders)[number];

const providerSchema = z.enum(validProviders);

export class ProviderIdentifier extends ValueObject<ProviderType> {
  static readonly VALID_PROVIDERS = validProviders;

  protected validate(value: ProviderType): Result<ProviderType> {
    const result = providerSchema.safeParse(value);

    if (!result.success) {
      return Result.fail(
        "Invalid provider. Must be one of: openai, anthropic, google",
      );
    }

    return Result.ok(result.data);
  }

  isOpenAI(): boolean {
    return this.value === "openai";
  }

  isAnthropic(): boolean {
    return this.value === "anthropic";
  }

  isGoogle(): boolean {
    return this.value === "google";
  }
}
