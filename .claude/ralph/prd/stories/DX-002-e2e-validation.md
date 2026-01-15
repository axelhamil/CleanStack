# DX-002: Validation E2E Workflow

## Story

**As a** developer
**I want** validated end-to-end workflow
**So that** I can build features efficiently with AI

## Acceptance Criteria

- [ ] Skills chain works seamlessly
- [ ] Clone to feature < 30 min
- [ ] All patterns documented
- [ ] Example workflow recorded

## Technical Notes

### Complete AI Workflow

```
Step 1: EventStorming
─────────────────────
/eventstorming "User subscription management"

Output:
- Commands: SubscribeToPlan, CancelSubscription, UpgradePlan
- Events: SubscriptionCreated, SubscriptionCancelled, PlanUpgraded
- Aggregates: Subscription
- Value Objects: PlanId, SubscriptionStatus

Step 2: Feature PRD
───────────────────
/feature-prd "Subscription management" --events <paste>

Output:
- User stories
- Acceptance criteria
- Technical decisions

Step 3: Generate Domain
───────────────────────
/gen-domain Subscription

Output:
- src/domain/subscription/subscription.aggregate.ts
- src/domain/subscription/events/
- src/domain/subscription/value-objects/

Step 4: Generate UseCase
────────────────────────
/gen-usecase SubscribeToPlan

Output:
- src/application/use-cases/subscription/subscribe-to-plan.use-case.ts
- src/application/dto/subscription/subscribe-to-plan.dto.ts
- common/di/modules/subscription.module.ts (updated)

Step 5: Ralph Loop
──────────────────
/ralph-loop "Implement subscription management. Tests must pass."

Output:
- Complete implementation
- All tests passing
- Feature working

Step 6: Tests
─────────────
/gen-tests SubscribeToPlanUseCase

Output:
- src/application/use-cases/subscription/__tests__/subscribe-to-plan.use-case.test.ts
```

### Validation Checklist

```markdown
## Pre-Flight Checks

### Environment
- [ ] Node 20+
- [ ] pnpm 9+
- [ ] Docker running
- [ ] PostgreSQL up

### Initial Setup
- [ ] `pnpm install` succeeds
- [ ] `pnpm db:push` succeeds
- [ ] `pnpm dev` starts without errors
- [ ] Auth pages load

### Skills Validation
- [ ] `/eventstorming` produces structured output
- [ ] `/feature-prd` generates PRD document
- [ ] `/gen-domain` creates valid domain files
- [ ] `/gen-usecase` creates valid use case + DI
- [ ] `/gen-tests` creates passing tests

### Agents Validation
- [ ] feature-architect analyzes correctly
- [ ] code-reviewer catches issues
- [ ] test-writer generates BDD tests
- [ ] doc-writer produces documentation

### Quality Gates
- [ ] `pnpm test` all pass
- [ ] `pnpm type-check` no errors
- [ ] `pnpm lint` no warnings
- [ ] `pnpm jscpd` < 3% duplication
- [ ] `pnpm knip` no unused code
- [ ] Coverage > 90%
```

### Sample Feature: Newsletter Subscription

```bash
# 1. EventStorming
User: /eventstorming "Newsletter subscription system"

# 2. PRD Generation
User: /feature-prd "Newsletter" --events "SubscribedToNewsletter, UnsubscribedFromNewsletter"

# 3. Domain Generation
User: /gen-domain NewsletterSubscription

# 4. UseCase Generation
User: /gen-usecase SubscribeToNewsletter
User: /gen-usecase UnsubscribeFromNewsletter

# 5. Implementation
User: /ralph-loop "Complete newsletter subscription feature. All tests must pass."

# 6. Verify
pnpm test
pnpm quality:full
```

### Timing Benchmarks

```
Operation               Target    Actual
──────────────────────────────────────────
Clone + Install         2 min     [ ]
DB Setup               1 min      [ ]
First dev server       30 sec     [ ]
/eventstorming         2 min      [ ]
/feature-prd           3 min      [ ]
/gen-domain            1 min      [ ]
/gen-usecase           1 min      [ ]
Test generation        2 min      [ ]
Ralph loop (feature)   15 min     [ ]
──────────────────────────────────────────
Total                  < 30 min   [ ]
```

### Error Recovery

```typescript
// Common issues and solutions

// Issue: DI Symbol not found
// Solution: Run /gen-usecase again or check common/di/symbols.ts

// Issue: Type mismatch in mapper
// Solution: Check domain entity props match DB schema

// Issue: Tests fail with "not a function"
// Solution: Check DI module registration order

// Issue: Event handler not called
// Solution: Verify handler registered in events.module.ts
```

## Definition of Done

- [ ] Full workflow documented
- [ ] Sample feature completed
- [ ] Timing benchmarks met
- [ ] Error recovery documented
