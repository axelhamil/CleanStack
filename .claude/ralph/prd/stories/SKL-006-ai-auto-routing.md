# SKL-006: AI Auto-Routing Hooks

## Story

**As a** developer
**I want** Claude to automatically use the right skills/agents
**So that** I don't need to remember which skill to invoke

## Acceptance Criteria

- [ ] UserPromptSubmit hook detects context
- [ ] Suggests appropriate skill/agent
- [ ] CLAUDE.md has clear triggers
- [ ] Seamless workflow without manual invocation

## Technical Notes

### Hook: Auto-Suggest Skills

```bash
# .claude/hooks/user-prompt-submit.sh
#!/bin/bash

# Read the user prompt from stdin
PROMPT=$(cat)

# Detect intent and suggest skill
suggest_skill() {
  local prompt="$1"

  # EventStorming detection
  if echo "$prompt" | grep -qiE "(eventstorm|domain event|aggregate|command.*event|model.*domain)"; then
    echo "💡 Tip: Use /eventstorming for structured domain modeling"
    return
  fi

  # Feature PRD detection
  if echo "$prompt" | grep -qiE "(feature|user story|acceptance criteria|prd|specification)"; then
    echo "💡 Tip: Use /feature-prd to generate a structured PRD"
    return
  fi

  # Domain generation detection
  if echo "$prompt" | grep -qiE "(create.*aggregate|create.*entity|generate.*domain|new.*domain)"; then
    echo "💡 Tip: Use /gen-domain [AggregateName] for domain files"
    return
  fi

  # UseCase generation detection
  if echo "$prompt" | grep -qiE "(create.*use.?case|generate.*use.?case|new.*use.?case|implement.*use.?case)"; then
    echo "💡 Tip: Use /gen-usecase [UseCaseName] for use case scaffold"
    return
  fi

  # Test generation detection
  if echo "$prompt" | grep -qiE "(write.*test|create.*test|generate.*test|add.*test)"; then
    echo "💡 Tip: Use /gen-tests [UseCaseName] for BDD tests"
    return
  fi
}

suggest_skill "$PROMPT"
```

### CLAUDE.md Triggers Section

```markdown
## Skill Auto-Triggers

Claude should AUTOMATICALLY use these skills when detecting the intent:

| User Says | Skill | Example |
|-----------|-------|---------|
| "Model the domain for..." | `/eventstorming` | "Model the domain for order management" |
| "Create a feature for..." | `/feature-prd` | "Create a feature for user notifications" |
| "Generate the domain..." | `/gen-domain` | "Generate the domain for Subscription" |
| "Create use case for..." | `/gen-usecase` | "Create use case for CancelSubscription" |
| "Add tests for..." | `/gen-tests` | "Add tests for SignInUseCase" |

### Workflow Chains

When user describes a new feature:
1. First: `/eventstorming` → understand domain
2. Then: `/feature-prd` → document requirements
3. Then: `/gen-domain` → create domain files
4. Then: `/gen-usecase` → create use cases
5. Finally: `/gen-tests` → create tests

Claude should suggest the next step after each skill completion.
```

### Agent Auto-Selection

```markdown
## Agent Auto-Selection

### feature-architect
Trigger: "How should I implement...", "What's the best approach for...", "Design a feature for..."

### code-reviewer
Trigger: After significant code changes, before PR, "Review this code"

### test-writer
Trigger: After UseCase implementation, "Write tests for...", when coverage needed

### doc-writer
Trigger: After feature completion, "Document this...", before release
```

### Smart Context Detection

```typescript
// .claude/hooks/context-detector.ts
interface ContextSignals {
  hasNewAggregate: boolean;
  hasNewUseCase: boolean;
  hasUntestedCode: boolean;
  isFeatureRequest: boolean;
  isDomainDiscussion: boolean;
}

function detectContext(prompt: string, recentFiles: string[]): ContextSignals {
  return {
    hasNewAggregate: recentFiles.some(f => f.includes('.aggregate.ts')),
    hasNewUseCase: recentFiles.some(f => f.includes('.use-case.ts')),
    hasUntestedCode: recentFiles.some(f =>
      f.includes('.use-case.ts') &&
      !recentFiles.some(t => t.includes('.test.ts'))
    ),
    isFeatureRequest: /\b(feature|implement|add|create)\b/i.test(prompt),
    isDomainDiscussion: /\b(aggregate|entity|event|domain)\b/i.test(prompt),
  };
}

function suggestAction(signals: ContextSignals): string | null {
  if (signals.isDomainDiscussion && !signals.hasNewAggregate) {
    return 'Consider using /eventstorming first to model the domain';
  }
  if (signals.hasNewUseCase && signals.hasUntestedCode) {
    return 'New UseCase detected. Run /gen-tests to add tests';
  }
  if (signals.isFeatureRequest && !signals.isDomainDiscussion) {
    return 'New feature request. Start with /eventstorming or /feature-prd';
  }
  return null;
}
```

### Workflow State Tracking

```yaml
# .claude/workflow-state.local.yml (gitignored)
current_feature: null
completed_steps: []
next_suggested: null

# After /eventstorming
current_feature: "subscription-management"
completed_steps:
  - eventstorming
next_suggested: "/feature-prd"

# After /feature-prd
completed_steps:
  - eventstorming
  - feature-prd
next_suggested: "/gen-domain Subscription"
```

### Integration with Skills

```markdown
<!-- At end of each skill output -->

## Next Steps

Based on your progress:
- ✅ EventStorming complete
- ✅ PRD generated
- ⏳ Domain generation pending

**Suggested next:** `/gen-domain Subscription`

Run the command above or describe what you want to do next.
```

### Atomic Commit Guidance

```markdown
## Commit Strategy

After each skill completion, Claude should:

1. **Review changes** - What files were created/modified
2. **Suggest atomic commit** - One logical unit of work
3. **Format message** - Using conventional commits

Example flow:
```
/gen-domain Order
→ Created: order.aggregate.ts, order-id.vo.ts, order-created.event.ts
→ Suggested commit: `feat(domain): add Order aggregate with events`

/gen-usecase CreateOrder
→ Created: create-order.use-case.ts, create-order.dto.ts
→ Updated: di/modules/order.module.ts
→ Suggested commit: `feat(order): add CreateOrder use case`
```

Claude should prompt for commit after each logical step, not batch multiple changes.
```

## Definition of Done

- [ ] UserPromptSubmit hook works
- [ ] Skills auto-suggested
- [ ] Agents auto-selected
- [ ] Workflow state tracked
- [ ] Next steps suggested
- [ ] Atomic commits prompted
