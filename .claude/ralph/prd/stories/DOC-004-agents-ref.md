# DOC-004: Agents Reference Section

## Story

**As a** developer
**I want** an agents reference in CLAUDE.md
**So that** I know what agents are available

## Acceptance Criteria

- [ ] List all agents
- [ ] When to use each
- [ ] What each does
- [ ] Example invocations

## Content

```markdown
## Agents Reference

### feature-architect
**Purpose:** Design feature architecture before implementation

**When to use:**
- Starting a new feature
- Unsure about structure
- Want to follow existing patterns

**What it does:**
1. Analyzes existing codebase patterns
2. Proposes file structure
3. Identifies needed components
4. Creates implementation blueprint

**Invoke:**
\`\`\`
Use the feature-architect agent to design [feature name]
\`\`\`

---

### code-reviewer
**Purpose:** Review code for issues before commit

**When to use:**
- After implementing feature
- Before creating PR
- Want quality check

**What it does:**
1. Checks Clean Architecture compliance
2. Verifies DDD patterns
3. Finds bugs and code smells
4. Suggests improvements

**Invoke:**
\`\`\`
Use the code-reviewer agent to review [file or feature]
\`\`\`

**Output:** Issues by severity with fixes

---

### test-writer
**Purpose:** Generate comprehensive tests

**When to use:**
- After implementing use case
- Need more test coverage
- Want BDD-style tests

**What it does:**
1. Analyzes implementation
2. Identifies all code paths
3. Writes comprehensive tests
4. Covers edge cases

**Invoke:**
\`\`\`
Use the test-writer agent to write tests for [use case]
\`\`\`

---

### doc-writer
**Purpose:** Update documentation

**When to use:**
- After adding feature
- After changing patterns
- README needs update

**What it does:**
1. Identifies affected docs
2. Updates CLAUDE.md sections
3. Updates README
4. Keeps examples current

**Invoke:**
\`\`\`
Use the doc-writer agent to update docs for [feature]
\`\`\`
```

## Definition of Done

- [ ] Section written
- [ ] All agents documented
- [ ] Invocation clear
