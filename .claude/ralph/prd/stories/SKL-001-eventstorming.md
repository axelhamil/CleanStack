# SKL-001: /eventstorming Skill

## Story

**As a** developer
**I want** an EventStorming simulation skill
**So that** I can discover domain events interactively with Claude

## Acceptance Criteria

- [ ] Skill file: `.claude/skills/eventstorming.md`
- [ ] Interactive Q&A flow
- [ ] Outputs: Events, Commands, Aggregates, Policies
- [ ] Structured output format (YAML or Markdown)
- [ ] Can be used as input for `/feature-prd`

## Technical Notes

### Skill File

```markdown
---
name: eventstorming
description: Run an EventStorming session to discover domain events and model your feature
---

# EventStorming Skill

You are facilitating an EventStorming session. Guide the user through discovering:

## Phase 1: Domain Events (Orange)
Ask: "What business events happen in this feature? Think in past tense: UserRegistered, OrderPlaced, PaymentFailed..."

Collect all events mentioned.

## Phase 2: Commands (Blue)
For each event, ask: "What action triggers [Event]?"

## Phase 3: Aggregates (Yellow)
Group events by the entity they affect. Ask: "Which entity owns this event?"

## Phase 4: Policies (Purple)
Ask: "When [Event] happens, should anything else happen automatically?"

## Output Format

When complete, output structured summary:

\`\`\`yaml
feature: [Feature Name]
aggregates:
  - name: [AggregateName]
    events:
      - name: [EventName]
        command: [CommandName]
        fields:
          - [field]: [type]
    policies:
      - when: [EventName]
        then: [Action]
\`\`\`

## Usage

User invokes: `/eventstorming`
You start with: "Let's discover your domain! What feature are you building?"
```

### Example Session

```
User: /eventstorming

Claude: Let's discover your domain! What feature are you building?

User: User subscription management

Claude: Great! Let's start with Domain Events. What business events happen
when managing subscriptions? Think in past tense...

User: SubscriptionCreated, SubscriptionCancelled, PaymentFailed, SubscriptionRenewed

Claude: Excellent! Now for Commands - what triggers each event?
- What action causes SubscriptionCreated?
...

[Final Output]
```yaml
feature: Subscription Management
aggregates:
  - name: Subscription
    events:
      - name: SubscriptionCreated
        command: CreateSubscription
        fields:
          - userId: string
          - planId: string
          - startDate: Date
      - name: SubscriptionCancelled
        command: CancelSubscription
        fields:
          - reason: string
    policies:
      - when: PaymentFailed
        then: SendPaymentFailedEmail
```
```

## Definition of Done

- [ ] Skill file created
- [ ] Tested with sample feature
- [ ] Output usable by `/feature-prd`
