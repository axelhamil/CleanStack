import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { Subscription } from "@/domain/billing/subscription.aggregate";
import type { SubscriptionId } from "@/domain/billing/subscription-id";

export interface ISubscriptionRepository extends BaseRepository<Subscription> {
  findById(id: SubscriptionId): Promise<Result<Option<Subscription>>>;
  findByUserId(userId: string): Promise<Result<Option<Subscription>>>;
  findByStripeSubscriptionId(id: string): Promise<Result<Option<Subscription>>>;
  findByStripeCustomerId(id: string): Promise<Result<Option<Subscription>>>;
}
