# DOC-007: AI Guidance Section

## Story

**As a** developer using Claude
**I want** AI guidance in CLAUDE.md
**So that** Claude helps me effectively

## Acceptance Criteria

- [ ] How to prompt Claude for this project
- [ ] What to ask for
- [ ] What NOT to ask for
- [ ] Example prompts

## Content

```markdown
## AI Guidance

### Effective Prompts

#### For New Features
\`\`\`
"Create a [Feature] feature with:
- [Aggregate] aggregate
- [Events] domain events
- [UseCases] use cases
Follow the existing auth pattern."
\`\`\`

#### For Bug Fixes
\`\`\`
"Fix [issue] in [file].
The expected behavior is [X].
The current behavior is [Y]."
\`\`\`

#### For Refactoring
\`\`\`
"Refactor [code] to:
- Follow [pattern]
- Match [existing example]
Keep the same behavior."
\`\`\`

---

### What Claude Should Do

✅ **Do ask Claude to:**
- Generate domain entities following patterns
- Write use cases with proper DI
- Create BDD tests
- Update documentation
- Review code for architecture violations

✅ **Expect Claude to:**
- Use Result<T> for fallible operations
- Use Option<T> for nullable values
- Emit events in aggregates
- Dispatch events after save
- Mock at repository level in tests

---

### What Claude Should NOT Do

❌ **Don't ask Claude to:**
- Skip tests
- Use `any` types
- Throw exceptions in domain
- Import adapters in domain
- Create index.ts barrels
- Add comments everywhere

❌ **Claude should refuse:**
- Breaking Clean Architecture layers
- Skipping event dispatch
- Using null instead of Option
- Mixing queries and commands

---

### Example Workflow Session

\`\`\`
User: I need to add a "team" feature where users can create teams and invite members

Claude: I'll help you build a Teams feature. Let me use the workflow:

1. /eventstorming
[Discovers: TeamCreated, MemberInvited, MemberJoined, MemberRemoved]

2. /feature-prd
[Generates PRD with Team aggregate, Invitation entity, use cases]

3. /gen-domain Team with name, ownerId, members
[Creates domain files]

4. /gen-usecase CreateTeam: creates a team with the current user as owner
[Creates use case + DTOs + DI]

5. /gen-tests CreateTeamUseCase
[Creates comprehensive tests]

6. Let me verify with code-reviewer agent...
[Reviews for issues]

All done! Run `pnpm check:all` to validate.
\`\`\`

---

### Context Claude Needs

When asking for help, provide:
1. **Feature name** - What you're building
2. **Business context** - Why it exists
3. **Reference** - Similar existing code to follow
4. **Constraints** - Any specific requirements

Example:
\`\`\`
"Add subscription billing feature.
Business: Users pay monthly for premium features.
Reference: Follow the auth flow pattern.
Constraints: Must integrate with Stripe webhooks."
\`\`\`
```

## Definition of Done

- [ ] Section written
- [ ] Prompts tested
- [ ] Examples practical
