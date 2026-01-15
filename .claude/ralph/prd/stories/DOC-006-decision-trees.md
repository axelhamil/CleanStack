# DOC-006: Decision Trees Section

## Story

**As a** developer
**I want** decision trees in CLAUDE.md
**So that** I know which pattern to use when

## Acceptance Criteria

- [ ] Entity vs Aggregate decision
- [ ] Result vs Option decision
- [ ] When to emit events
- [ ] Repository vs Query decision
- [ ] Clear flowcharts

## Content

```markdown
## Decision Trees

### Entity vs Aggregate

\`\`\`
Does it have a unique identity?
├─ No → Value Object
└─ Yes → Does it own other entities?
         ├─ No → Entity
         └─ Yes → Does it need domain events?
                  ├─ No → Entity (root of group)
                  └─ Yes → Aggregate
\`\`\`

**Examples:**
- Email → Value Object (no identity)
- Address → Entity (identity, no children)
- User → Aggregate (has identity, owns sessions, emits events)
- Order → Aggregate (owns OrderItems, emits events)

---

### Result vs Option

\`\`\`
Can the operation fail with an error message?
├─ Yes → Result<T>
│        └─ Multiple failure reasons? → Result<T, ErrorEnum>
└─ No → Is the value optional/nullable?
        ├─ Yes → Option<T>
        └─ No → Plain T
\`\`\`

**Examples:**
- `Email.create()` → `Result<Email>` (can fail: invalid format)
- `findById()` → `Result<Option<User>>` (can fail: DB error, can be missing)
- `user.name` → `Name` (required, validated at creation)
- `user.bio` → `Option<Bio>` (optional, no error if missing)

---

### When to Emit Domain Events

\`\`\`
Is this a significant business state change?
├─ No → Don't emit
└─ Yes → Should other parts of system react?
         ├─ No → Don't emit
         └─ Yes → Emit event
                  └─ Dispatch AFTER repository.save()
\`\`\`

**Emit for:**
- User registration (send welcome email)
- Subscription created (provision resources)
- Payment failed (notify user)

**Don't emit for:**
- User updated name (no side effects)
- Internal state changes

---

### Repository vs Query

\`\`\`
Need to modify data?
├─ Yes → Repository (through Use Case)
└─ No → Need domain logic?
        ├─ Yes → Repository (returns Aggregate)
        └─ No → Is this a simple read?
                ├─ Yes → Query (direct ORM)
                └─ No → Repository + DTO
\`\`\`

**Use Repository when:**
- Creating/updating entities
- Need to apply business rules
- Need aggregate with full state

**Use Query when:**
- Dashboard statistics
- List views with filters
- Reports
- No business logic needed

---

### CQRS Decision

\`\`\`
Command or Query?

Command (write):
Controller → UseCase → Aggregate → Repository
                            ↓
                   EventDispatcher → Handlers

Query (read):
Controller → Query → Database
                ↓
            DTO Response
\`\`\`
```

## Definition of Done

- [ ] All decision trees added
- [ ] Clear and actionable
- [ ] Examples for each
