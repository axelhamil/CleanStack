import { Option, type PaginatedResult, Result } from "@packages/ddd-kit";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import type { Subscription } from "@/domain/billing/subscription.aggregate";
import type { SubscriptionId } from "@/domain/billing/subscription-id";

export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  async create(entity: Subscription): Promise<Result<Subscription>> {
    this.subscriptions.set(String(entity.id.value), entity);
    return Result.ok(entity);
  }

  async update(entity: Subscription): Promise<Result<Subscription>> {
    this.subscriptions.set(String(entity.id.value), entity);
    return Result.ok(entity);
  }

  async delete(id: SubscriptionId): Promise<Result<SubscriptionId>> {
    this.subscriptions.delete(String(id.value));
    return Result.ok(id);
  }

  async findById(id: SubscriptionId): Promise<Result<Option<Subscription>>> {
    const subscription = this.subscriptions.get(String(id.value));
    return Result.ok(subscription ? Option.some(subscription) : Option.none());
  }

  async findByUserId(userId: string): Promise<Result<Option<Subscription>>> {
    const subscription = [...this.subscriptions.values()].find(
      (s) => String(s.get("userId").value) === userId,
    );
    return Result.ok(subscription ? Option.some(subscription) : Option.none());
  }

  async findByStripeSubscriptionId(
    id: string,
  ): Promise<Result<Option<Subscription>>> {
    const subscription = [...this.subscriptions.values()].find(
      (s) => s.get("stripeSubscriptionId") === id,
    );
    return Result.ok(subscription ? Option.some(subscription) : Option.none());
  }

  async findByStripeCustomerId(
    id: string,
  ): Promise<Result<Option<Subscription>>> {
    const subscription = [...this.subscriptions.values()].find(
      (s) => s.get("stripeCustomerId") === id,
    );
    return Result.ok(subscription ? Option.some(subscription) : Option.none());
  }

  async findAll(): Promise<Result<PaginatedResult<Subscription>>> {
    const data = [...this.subscriptions.values()];
    return Result.ok({
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }

  async findMany(): Promise<Result<PaginatedResult<Subscription>>> {
    return this.findAll();
  }

  async findBy(): Promise<Result<Option<Subscription>>> {
    return Result.ok(Option.none());
  }

  async exists(id: SubscriptionId): Promise<Result<boolean>> {
    return Result.ok(this.subscriptions.has(String(id.value)));
  }

  async count(): Promise<Result<number>> {
    return Result.ok(this.subscriptions.size);
  }
}
