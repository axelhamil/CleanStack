# SKL-002: /feature-prd Skill

## Story

**As a** developer
**I want** a PRD generation skill
**So that** I can create structured feature specs from EventStorming output

## Acceptance Criteria

- [ ] Skill file: `.claude/skills/feature-prd.md`
- [ ] Takes EventStorming output as input
- [ ] Generates structured PRD
- [ ] Includes: Domain model, Use Cases, API endpoints, Tests
- [ ] Output is actionable for implementation

## Technical Notes

### Skill File

```markdown
---
name: feature-prd
description: Generate a Product Requirements Document from EventStorming output
---

# Feature PRD Generator

You generate structured PRDs for features based on EventStorming discoveries.

## Input

Expects EventStorming YAML or description of feature.

## Output Structure

Generate a PRD with these sections:

### 1. Overview
- Feature name
- Business value
- Success metrics

### 2. Domain Model
From EventStorming:
- Aggregates with properties
- Value Objects needed
- Domain Events

### 3. Use Cases
For each Command:
- Name (e.g., CreateSubscriptionUseCase)
- Input DTO
- Output DTO
- Business rules
- Events emitted

### 4. API Endpoints
- Route
- Method
- Request/Response schemas
- Auth requirements

### 5. Implementation Checklist
- [ ] Domain entities
- [ ] Value objects
- [ ] Use cases
- [ ] Repository methods
- [ ] API routes
- [ ] Tests

## Example Output

\`\`\`markdown
# PRD: Subscription Management

## Overview
Allow users to subscribe to plans, manage subscriptions, and handle payments.

## Domain Model

### Subscription Aggregate
- id: SubscriptionId
- userId: UserId
- planId: PlanId
- status: SubscriptionStatus (active, cancelled, past_due)
- startDate: Date
- endDate: Option<Date>

### Value Objects
- SubscriptionStatus
- PlanId

### Events
- SubscriptionCreated
- SubscriptionCancelled
- SubscriptionRenewed

## Use Cases

### CreateSubscriptionUseCase
**Input:** { userId, planId, paymentMethodId }
**Output:** { subscriptionId, status }
**Rules:**
- User must not have active subscription
- Plan must exist and be available
**Events:** SubscriptionCreated

...
\`\`\`
```

### Usage Flow

```
1. /eventstorming → YAML output
2. /feature-prd [paste YAML or describe feature]
3. Claude generates PRD
4. Developer uses PRD for /gen-domain, /gen-usecase
```

## Definition of Done

- [ ] Skill file created
- [ ] Tested with EventStorming output
- [ ] PRD output is comprehensive
