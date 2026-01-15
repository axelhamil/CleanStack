---
name: eventstorming
description: Run an EventStorming session to discover domain events and model your feature
---

# EventStorming Skill

You are facilitating an EventStorming session for Domain-Driven Design. Guide the user through a structured discovery process to understand their feature's domain model.

## How to Start

Begin with: "Let's discover your domain! What feature are you building?"

## Phase 1: Domain Events (Orange Sticky Notes)

After the user describes their feature, ask:

"What business events happen in this feature? Think in past tense, like:
- UserRegistered
- OrderPlaced
- PaymentFailed
- SubscriptionCancelled

List all the significant things that happen in your feature."

Collect all events and confirm understanding before proceeding.

## Phase 2: Commands (Blue Sticky Notes)

For each event identified, ask: "What action triggers [EventName]?"

Commands are the actions users or systems take that cause events. Examples:
- RegisterUser -> UserRegistered
- PlaceOrder -> OrderPlaced
- ProcessPayment -> PaymentProcessed (or PaymentFailed)

## Phase 3: Aggregates (Yellow Sticky Notes)

Group related events by the entity they affect. Ask:

"Let's organize these events. Which entity or concept owns each event? For example:
- User aggregate might own: UserRegistered, UserVerified, UserDeleted
- Order aggregate might own: OrderPlaced, OrderShipped, OrderDelivered"

Identify the main aggregates and their bounded context.

## Phase 4: Policies (Purple Sticky Notes)

Ask: "When [EventName] happens, should anything else happen automatically?"

Policies are reactions to events. Examples:
- When PaymentFailed -> SendPaymentReminderEmail
- When OrderPlaced -> ReserveInventory
- When UserRegistered -> SendWelcomeEmail

## Phase 5: Read Models (Green Sticky Notes)

Ask: "What information do users need to see? What queries or views are required?"

Examples:
- OrderHistory view for users
- SubscriptionDashboard for admins
- PaymentReport for finance

## Output Format

When complete, generate a structured summary in this format:

```yaml
feature: [Feature Name]
description: [Brief description]

aggregates:
  - name: [AggregateName]
    description: [What this aggregate represents]
    events:
      - name: [EventName]
        command: [CommandName]
        fields:
          - [fieldName]: [type]
          - [fieldName]: [type]
    policies:
      - when: [EventName]
        then: [Action/Command]

read_models:
  - name: [ViewName]
    description: [What data this shows]

external_systems:
  - name: [SystemName]
    integration: [How it integrates]
```

## Guidelines

1. Keep asking clarifying questions if the domain is unclear
2. Encourage the user to think about edge cases and failure scenarios
3. Identify bounded contexts if the feature spans multiple domains
4. Note any external system integrations
5. The output should be usable as input for `/feature-prd`

## Example Session

```
User: /eventstorming

Claude: Let's discover your domain! What feature are you building?

User: User subscription management with Stripe

Claude: Great! Let's map out the subscription domain. What business events
happen when managing subscriptions? Think in past tense...

User: SubscriptionCreated, SubscriptionCancelled, PaymentSucceeded,
PaymentFailed, SubscriptionRenewed, SubscriptionUpgraded

Claude: Excellent events! Now let's identify the commands. What action
triggers SubscriptionCreated?

User: When a user selects a plan and provides payment info

Claude: So the command would be "CreateSubscription". What about
SubscriptionCancelled?

...

[After completing all phases]

Claude: Here's your EventStorming output:

```yaml
feature: Subscription Management
description: Handle user subscriptions with Stripe payment integration

aggregates:
  - name: Subscription
    description: Manages user subscription lifecycle
    events:
      - name: SubscriptionCreated
        command: CreateSubscription
        fields:
          - userId: UUID
          - planId: string
          - paymentMethodId: string
      - name: SubscriptionCancelled
        command: CancelSubscription
        fields:
          - reason: string
          - cancelAtPeriodEnd: boolean
      - name: SubscriptionRenewed
        command: RenewSubscription
        fields:
          - nextBillingDate: Date
    policies:
      - when: PaymentFailed
        then: SendPaymentFailedEmail
      - when: SubscriptionCancelled
        then: ScheduleCancellationReminder

external_systems:
  - name: Stripe
    integration: Payment processing via webhooks
```
```

You can now use this output with `/feature-prd` to generate a detailed PRD.
