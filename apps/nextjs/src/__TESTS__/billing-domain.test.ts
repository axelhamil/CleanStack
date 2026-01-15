import { UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { PaymentFailedEvent } from "@/domain/billing/events/payment-failed.event";
import { PlanChangedEvent } from "@/domain/billing/events/plan-changed.event";
import { SubscriptionCancelledEvent } from "@/domain/billing/events/subscription-cancelled.event";
import { SubscriptionCreatedEvent } from "@/domain/billing/events/subscription-created.event";
import { SubscriptionRenewedEvent } from "@/domain/billing/events/subscription-renewed.event";
import { Subscription } from "@/domain/billing/subscription.aggregate";
import { SubscriptionId } from "@/domain/billing/subscription-id";
import { PlanId } from "@/domain/billing/value-objects/plan-id.vo";
import { SubscriptionStatus } from "@/domain/billing/value-objects/subscription-status.vo";
import { UserId } from "@/domain/user/user-id";

describe("PlanId Value Object", () => {
  describe("create()", () => {
    it("should create valid plan ID", () => {
      const result = PlanId.create("pro_monthly" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("pro_monthly");
    });

    it("should accept plan ID with surrounding whitespace", () => {
      const result = PlanId.create("  pro_monthly  " as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("  pro_monthly  ");
    });

    it("should fail for empty plan ID", () => {
      const result = PlanId.create("" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Plan ID is required");
    });

    it("should accept whitespace-only plan ID (valid length)", () => {
      const result = PlanId.create("   " as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should fail for plan ID too long", () => {
      const longPlanId = "a".repeat(101);
      const result = PlanId.create(longPlanId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "Plan ID must be less than 100 characters",
      );
    });

    it("should be equal by value", () => {
      const planId1 = PlanId.create("pro_monthly" as string).getValue();
      const planId2 = PlanId.create("pro_monthly" as string).getValue();

      expect(planId1.equals(planId2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const planId1 = PlanId.create("pro_monthly" as string).getValue();
      const planId2 = PlanId.create("enterprise_yearly" as string).getValue();

      expect(planId1.equals(planId2)).toBe(false);
    });
  });
});

describe("SubscriptionStatus Value Object", () => {
  describe("create()", () => {
    it("should create valid active status", () => {
      const result = SubscriptionStatus.create("active" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("active");
    });

    it("should create valid cancelled status", () => {
      const result = SubscriptionStatus.create("cancelled" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("cancelled");
    });

    it("should create valid past_due status", () => {
      const result = SubscriptionStatus.create("past_due" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("past_due");
    });

    it("should create valid trialing status", () => {
      const result = SubscriptionStatus.create("trialing" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("trialing");
    });

    it("should create valid incomplete status", () => {
      const result = SubscriptionStatus.create("incomplete" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("incomplete");
    });

    it("should create valid paused status", () => {
      const result = SubscriptionStatus.create("paused" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("paused");
    });

    it("should fail for invalid status", () => {
      const result = SubscriptionStatus.create("invalid" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Status must be one of:");
    });

    it("should fail for empty status", () => {
      const result = SubscriptionStatus.create("" as string);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("status helpers", () => {
    it("isActive should return true for active status", () => {
      const status = SubscriptionStatus.create("active" as string).getValue();

      expect(status.isActive).toBe(true);
      expect(status.isCancelled).toBe(false);
    });

    it("isCancelled should return true for cancelled status", () => {
      const status = SubscriptionStatus.create(
        "cancelled" as string,
      ).getValue();

      expect(status.isCancelled).toBe(true);
      expect(status.isActive).toBe(false);
    });

    it("isPastDue should return true for past_due status", () => {
      const status = SubscriptionStatus.create("past_due" as string).getValue();

      expect(status.isPastDue).toBe(true);
    });

    it("isTrialing should return true for trialing status", () => {
      const status = SubscriptionStatus.create("trialing" as string).getValue();

      expect(status.isTrialing).toBe(true);
    });

    it("isIncomplete should return true for incomplete status", () => {
      const status = SubscriptionStatus.create(
        "incomplete" as string,
      ).getValue();

      expect(status.isIncomplete).toBe(true);
    });

    it("isPaused should return true for paused status", () => {
      const status = SubscriptionStatus.create("paused" as string).getValue();

      expect(status.isPaused).toBe(true);
    });

    it("canAccess should return true for active status", () => {
      const status = SubscriptionStatus.create("active" as string).getValue();

      expect(status.canAccess).toBe(true);
    });

    it("canAccess should return true for trialing status", () => {
      const status = SubscriptionStatus.create("trialing" as string).getValue();

      expect(status.canAccess).toBe(true);
    });

    it("canAccess should return false for cancelled status", () => {
      const status = SubscriptionStatus.create(
        "cancelled" as string,
      ).getValue();

      expect(status.canAccess).toBe(false);
    });

    it("canAccess should return false for past_due status", () => {
      const status = SubscriptionStatus.create("past_due" as string).getValue();

      expect(status.canAccess).toBe(false);
    });
  });
});

describe("SubscriptionId", () => {
  it("should create subscription ID from UUID", () => {
    const uuid = new UUID<string>();
    const subscriptionId = SubscriptionId.create(uuid);

    expect(subscriptionId.value).toBe(uuid.value);
  });

  it("should have correct string tag", () => {
    const uuid = new UUID<string>();
    const subscriptionId = SubscriptionId.create(uuid);

    expect(Object.prototype.toString.call(subscriptionId)).toBe(
      "[object SubscriptionId]",
    );
  });
});

describe("Subscription Aggregate", () => {
  let validUserId: UserId;
  let validPlanId: PlanId;
  let validStatus: SubscriptionStatus;
  let validProps: {
    userId: UserId;
    planId: PlanId;
    status: SubscriptionStatus;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };

  beforeEach(() => {
    validUserId = UserId.create(new UUID<string>());
    validPlanId = PlanId.create("pro_monthly" as string).getValue();
    validStatus = SubscriptionStatus.create("active" as string).getValue();
    validProps = {
      userId: validUserId,
      planId: validPlanId,
      status: validStatus,
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      currentPeriodStart: new Date("2024-01-01"),
      currentPeriodEnd: new Date("2024-02-01"),
    };
  });

  describe("create()", () => {
    it("should create subscription with valid props", () => {
      const subscription = Subscription.create(validProps);

      expect(subscription).toBeInstanceOf(Subscription);
      expect(subscription.get("planId").value).toBe("pro_monthly");
      expect(subscription.get("status").value).toBe("active");
      expect(subscription.get("stripeCustomerId")).toBe("cus_123");
      expect(subscription.get("stripeSubscriptionId")).toBe("sub_123");
    });

    it("should set createdAt and updatedAt", () => {
      const subscription = Subscription.create(validProps);

      expect(subscription.get("createdAt")).toBeInstanceOf(Date);
      expect(subscription.get("updatedAt")).toBeInstanceOf(Date);
    });

    it("should generate new ID when not provided", () => {
      const subscription = Subscription.create(validProps);

      expect(subscription.id).toBeInstanceOf(SubscriptionId);
      expect(subscription.id.value).toBeTruthy();
    });

    it("should use provided ID", () => {
      const customId = new UUID<string>();
      const subscription = Subscription.create(validProps, customId);

      expect(subscription.id.value).toBe(customId.value);
    });

    it("should emit SubscriptionCreatedEvent for new subscription", () => {
      const subscription = Subscription.create(validProps);
      const events = subscription.domainEvents;

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(SubscriptionCreatedEvent);

      const event = events[0] as SubscriptionCreatedEvent;
      expect(event.payload.planId).toBe("pro_monthly");
      expect(event.payload.stripeCustomerId).toBe("cus_123");
    });

    it("should not emit event when ID is provided (reconstitution)", () => {
      const existingId = new UUID<string>();
      const subscription = Subscription.create(validProps, existingId);

      expect(subscription.domainEvents).toHaveLength(0);
    });
  });

  describe("reconstitute()", () => {
    it("should reconstitute subscription from existing data", () => {
      const existingId = SubscriptionId.create(new UUID<string>());
      const props = {
        ...validProps,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
      };

      const subscription = Subscription.reconstitute(props, existingId);

      expect(subscription.id.value).toBe(existingId.value);
      expect(subscription.get("createdAt")).toEqual(new Date("2024-01-01"));
      expect(subscription.domainEvents).toHaveLength(0);
    });
  });

  describe("cancel()", () => {
    it("should cancel active subscription", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();

      const result = subscription.cancel("User requested cancellation");

      expect(result.isSuccess).toBe(true);
      expect(subscription.get("cancelledAt")).toBeInstanceOf(Date);
    });

    it("should emit SubscriptionCancelledEvent", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();

      subscription.cancel("User requested cancellation");

      const events = subscription.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(SubscriptionCancelledEvent);

      const event = events[0] as SubscriptionCancelledEvent;
      expect(event.payload.reason).toBe("User requested cancellation");
    });

    it("should fail when subscription is already cancelled", () => {
      const cancelledStatus = SubscriptionStatus.create(
        "cancelled" as string,
      ).getValue();
      const subscription = Subscription.create({
        ...validProps,
        status: cancelledStatus,
      });
      subscription.clearEvents();

      const result = subscription.cancel("Another cancellation");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Subscription is already cancelled");
    });

    it("should update updatedAt on cancellation", () => {
      const subscription = Subscription.create(validProps);
      subscription.cancel("User requested cancellation");

      expect(subscription.get("updatedAt")).toBeInstanceOf(Date);
    });
  });

  describe("markPastDue()", () => {
    it("should mark subscription as past due", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();

      const result = subscription.markPastDue();

      expect(result.isSuccess).toBe(true);
    });

    it("should emit PaymentFailedEvent", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();

      subscription.markPastDue();

      const events = subscription.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentFailedEvent);

      const event = events[0] as PaymentFailedEvent;
      expect(event.payload.stripeCustomerId).toBe("cus_123");
    });

    it("should fail when already past due", () => {
      const pastDueStatus = SubscriptionStatus.create(
        "past_due" as string,
      ).getValue();
      const subscription = Subscription.create({
        ...validProps,
        status: pastDueStatus,
      });
      subscription.clearEvents();

      const result = subscription.markPastDue();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Subscription is already past due");
    });

    it("should fail when subscription is cancelled", () => {
      const cancelledStatus = SubscriptionStatus.create(
        "cancelled" as string,
      ).getValue();
      const subscription = Subscription.create({
        ...validProps,
        status: cancelledStatus,
      });
      subscription.clearEvents();

      const result = subscription.markPastDue();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "Cannot mark cancelled subscription as past due",
      );
    });
  });

  describe("renew()", () => {
    it("should renew subscription with new period end", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();
      const newPeriodEnd = new Date("2024-03-01");

      const result = subscription.renew(newPeriodEnd);

      expect(result.isSuccess).toBe(true);
      expect(subscription.get("currentPeriodEnd")).toEqual(newPeriodEnd);
    });

    it("should update currentPeriodStart to previous periodEnd", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();
      const originalPeriodEnd = subscription.get("currentPeriodEnd");
      const newPeriodEnd = new Date("2024-03-01");

      subscription.renew(newPeriodEnd);

      expect(subscription.get("currentPeriodStart")).toEqual(originalPeriodEnd);
    });

    it("should emit SubscriptionRenewedEvent", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();
      const newPeriodEnd = new Date("2024-03-01");

      subscription.renew(newPeriodEnd);

      const events = subscription.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(SubscriptionRenewedEvent);

      const event = events[0] as SubscriptionRenewedEvent;
      expect(event.payload.newPeriodEnd).toEqual(newPeriodEnd);
    });

    it("should fail when subscription is cancelled", () => {
      const cancelledStatus = SubscriptionStatus.create(
        "cancelled" as string,
      ).getValue();
      const subscription = Subscription.create({
        ...validProps,
        status: cancelledStatus,
      });
      subscription.clearEvents();

      const result = subscription.renew(new Date("2024-03-01"));

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Cannot renew cancelled subscription");
    });
  });

  describe("changePlan()", () => {
    it("should change to new plan", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();
      const newPlanId = PlanId.create("enterprise_yearly" as string).getValue();

      const result = subscription.changePlan(newPlanId);

      expect(result.isSuccess).toBe(true);
      expect(subscription.get("planId").value).toBe("enterprise_yearly");
    });

    it("should emit PlanChangedEvent", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();
      const newPlanId = PlanId.create("enterprise_yearly" as string).getValue();

      subscription.changePlan(newPlanId);

      const events = subscription.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PlanChangedEvent);

      const event = events[0] as PlanChangedEvent;
      expect(event.payload.previousPlanId).toBe("pro_monthly");
      expect(event.payload.newPlanId).toBe("enterprise_yearly");
    });

    it("should fail when new plan is same as current", () => {
      const subscription = Subscription.create(validProps);
      subscription.clearEvents();
      const samePlanId = PlanId.create("pro_monthly" as string).getValue();

      const result = subscription.changePlan(samePlanId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("New plan is the same as current plan");
    });

    it("should fail when subscription is cancelled", () => {
      const cancelledStatus = SubscriptionStatus.create(
        "cancelled" as string,
      ).getValue();
      const subscription = Subscription.create({
        ...validProps,
        status: cancelledStatus,
      });
      subscription.clearEvents();
      const newPlanId = PlanId.create("enterprise_yearly" as string).getValue();

      const result = subscription.changePlan(newPlanId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "Cannot change plan of cancelled subscription",
      );
    });
  });
});

describe("Billing Domain Events", () => {
  describe("SubscriptionCreatedEvent", () => {
    it("should have correct eventType", () => {
      const event = new SubscriptionCreatedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        "cus_123",
        "sub_123",
      );

      expect(event.eventType).toBe("subscription.created");
    });

    it("should contain correct payload", () => {
      const event = new SubscriptionCreatedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        "cus_123",
        "sub_123",
      );

      expect(event.payload).toEqual({
        subscriptionId: "sub-1",
        userId: "user-1",
        planId: "pro_monthly",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
      });
    });

    it("should set aggregateId", () => {
      const event = new SubscriptionCreatedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        "cus_123",
        "sub_123",
      );

      expect(event.aggregateId).toBe("sub-1");
    });
  });

  describe("SubscriptionCancelledEvent", () => {
    it("should have correct eventType", () => {
      const event = new SubscriptionCancelledEvent(
        "sub-1",
        "user-1",
        "User requested",
        new Date(),
      );

      expect(event.eventType).toBe("subscription.cancelled");
    });

    it("should contain reason in payload", () => {
      const cancelledAt = new Date("2024-01-15");
      const event = new SubscriptionCancelledEvent(
        "sub-1",
        "user-1",
        "User requested",
        cancelledAt,
      );

      expect(event.payload.reason).toBe("User requested");
      expect(event.payload.cancelledAt).toEqual(cancelledAt);
    });
  });

  describe("SubscriptionRenewedEvent", () => {
    it("should have correct eventType", () => {
      const event = new SubscriptionRenewedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        new Date(),
        new Date(),
      );

      expect(event.eventType).toBe("subscription.renewed");
    });

    it("should contain period dates in payload", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-02-01");
      const event = new SubscriptionRenewedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        start,
        end,
      );

      expect(event.payload.newPeriodStart).toEqual(start);
      expect(event.payload.newPeriodEnd).toEqual(end);
    });
  });

  describe("PaymentFailedEvent", () => {
    it("should have correct eventType", () => {
      const event = new PaymentFailedEvent(
        "sub-1",
        "user-1",
        "cus_123",
        new Date(),
      );

      expect(event.eventType).toBe("subscription.payment_failed");
    });

    it("should contain stripe customer ID in payload", () => {
      const failedAt = new Date("2024-01-15");
      const event = new PaymentFailedEvent(
        "sub-1",
        "user-1",
        "cus_123",
        failedAt,
      );

      expect(event.payload.stripeCustomerId).toBe("cus_123");
      expect(event.payload.failedAt).toEqual(failedAt);
    });
  });

  describe("PlanChangedEvent", () => {
    it("should have correct eventType", () => {
      const event = new PlanChangedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        "enterprise_yearly",
        new Date(),
      );

      expect(event.eventType).toBe("subscription.plan_changed");
    });

    it("should contain previous and new plan IDs", () => {
      const changedAt = new Date("2024-01-15");
      const event = new PlanChangedEvent(
        "sub-1",
        "user-1",
        "pro_monthly",
        "enterprise_yearly",
        changedAt,
      );

      expect(event.payload.previousPlanId).toBe("pro_monthly");
      expect(event.payload.newPlanId).toBe("enterprise_yearly");
      expect(event.payload.changedAt).toEqual(changedAt);
    });
  });
});
