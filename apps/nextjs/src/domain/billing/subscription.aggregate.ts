import { Aggregate, Result, UUID } from "@packages/ddd-kit";
import type { UserId } from "../user/user-id";
import { PaymentFailedEvent } from "./events/payment-failed.event";
import { PlanChangedEvent } from "./events/plan-changed.event";
import { SubscriptionCancelledEvent } from "./events/subscription-cancelled.event";
import { SubscriptionCreatedEvent } from "./events/subscription-created.event";
import { SubscriptionRenewedEvent } from "./events/subscription-renewed.event";
import { SubscriptionId } from "./subscription-id";
import type { PlanId } from "./value-objects/plan-id.vo";
import type { SubscriptionStatus } from "./value-objects/subscription-status.vo";

export interface ISubscriptionProps {
  userId: UserId;
  planId: PlanId;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

type CreateSubscriptionProps = Omit<
  ISubscriptionProps,
  "createdAt" | "updatedAt" | "cancelledAt"
>;

export class Subscription extends Aggregate<ISubscriptionProps> {
  private constructor(props: ISubscriptionProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): SubscriptionId {
    return SubscriptionId.create(this._id);
  }

  static create(
    props: CreateSubscriptionProps,
    id?: UUID<string | number>,
  ): Subscription {
    const newId = id ?? new UUID<string>();
    const subscription = new Subscription(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      newId,
    );

    if (!id) {
      subscription.addEvent(
        new SubscriptionCreatedEvent(
          newId.value.toString(),
          props.userId.value.toString(),
          props.planId.value,
          props.stripeCustomerId,
          props.stripeSubscriptionId,
        ),
      );
    }

    return subscription;
  }

  static reconstitute(
    props: ISubscriptionProps,
    id: SubscriptionId,
  ): Subscription {
    return new Subscription(props, id);
  }

  cancel(reason: string): Result<void> {
    if (this.get("status").isCancelled) {
      return Result.fail("Subscription is already cancelled");
    }

    const cancelledAt = new Date();
    this._props.cancelledAt = cancelledAt;
    this._props.updatedAt = new Date();

    this.addEvent(
      new SubscriptionCancelledEvent(
        this.id.value.toString(),
        this.get("userId").value.toString(),
        reason,
        cancelledAt,
      ),
    );

    return Result.ok();
  }

  markPastDue(): Result<void> {
    if (this.get("status").isPastDue) {
      return Result.fail("Subscription is already past due");
    }

    if (this.get("status").isCancelled) {
      return Result.fail("Cannot mark cancelled subscription as past due");
    }

    this._props.updatedAt = new Date();

    this.addEvent(
      new PaymentFailedEvent(
        this.id.value.toString(),
        this.get("userId").value.toString(),
        this.get("stripeCustomerId"),
        new Date(),
      ),
    );

    return Result.ok();
  }

  renew(newPeriodEnd: Date): Result<void> {
    if (this.get("status").isCancelled) {
      return Result.fail("Cannot renew cancelled subscription");
    }

    const newPeriodStart = this.get("currentPeriodEnd");
    this._props.currentPeriodStart = newPeriodStart;
    this._props.currentPeriodEnd = newPeriodEnd;
    this._props.updatedAt = new Date();

    this.addEvent(
      new SubscriptionRenewedEvent(
        this.id.value.toString(),
        this.get("userId").value.toString(),
        this.get("planId").value,
        newPeriodStart,
        newPeriodEnd,
      ),
    );

    return Result.ok();
  }

  changePlan(newPlanId: PlanId): Result<void> {
    if (this.get("status").isCancelled) {
      return Result.fail("Cannot change plan of cancelled subscription");
    }

    const previousPlanId = this.get("planId").value;

    if (previousPlanId === newPlanId.value) {
      return Result.fail("New plan is the same as current plan");
    }

    this._props.planId = newPlanId;
    this._props.updatedAt = new Date();

    this.addEvent(
      new PlanChangedEvent(
        this.id.value.toString(),
        this.get("userId").value.toString(),
        previousPlanId,
        newPlanId.value,
        new Date(),
      ),
    );

    return Result.ok();
  }
}
