# Tutorial: Build Your First Feature

Build a complete **Notes** feature using the AI workflow.

**Time:** ~30 minutes
**Prerequisites:** [Quick Start](./01-quick-start.md) completed

## What We'll Build

A personal notes feature where users can:
- Create notes with a title and content
- View their notes list
- Edit existing notes
- Delete notes

## Step 1: Domain Discovery (2 min)

Start by understanding the domain with EventStorming.

**Tell Claude:**
> "Let's do EventStorming for a Notes feature where users can create, edit, and delete personal notes"

Or use the skill:
```
/eventstorming "Personal notes management"
```

**Expected Output:**
- **Commands**: CreateNote, UpdateNote, DeleteNote
- **Events**: NoteCreated, NoteUpdated, NoteDeleted
- **Aggregates**: Note
- **Value Objects**: NoteId, NoteTitle, NoteContent

## Step 2: Generate PRD (3 min)

Document the requirements:

```
/feature-prd "Notes management" --events NoteCreated,NoteUpdated,NoteDeleted
```

**Expected Output:**
- User stories
- Acceptance criteria
- Technical specifications

Review the generated PRD and adjust if needed.

## Step 3: Generate Domain (2 min)

Create the domain layer:

```
/gen-domain Note
```

**Files Created:**
```
src/domain/note/
├── note.aggregate.ts
├── note-id.vo.ts
├── note-title.vo.ts
├── note-content.vo.ts
└── events/
    ├── note-created.event.ts
    ├── note-updated.event.ts
    └── note-deleted.event.ts
```

**Verify the generated code:**

```typescript
// note.aggregate.ts
export class Note extends Aggregate<INoteProps> {
  get id(): NoteId { return NoteId.create(this._id); }
  get title(): NoteTitle { return this._props.title; }
  get content(): NoteContent { return this._props.content; }
  get userId(): UserId { return this._props.userId; }

  static create(props: INoteCreateProps, id?: UUID): Note {
    const note = new Note(
      { ...props, createdAt: new Date(), updatedAt: new Date() },
      id ?? new UUID()
    );
    note.addEvent(new NoteCreatedEvent({
      noteId: note.id.value,
      userId: note.userId.value,
    }));
    return note;
  }

  updateContent(title: NoteTitle, content: NoteContent): void {
    this._props.title = title;
    this._props.content = content;
    this._props.updatedAt = new Date();
    this.addEvent(new NoteUpdatedEvent({ noteId: this.id.value }));
  }
}
```

## Step 4: Generate Use Cases (5 min)

Create use cases for each operation:

```
/gen-usecase CreateNote
/gen-usecase UpdateNote
/gen-usecase DeleteNote
/gen-usecase GetUserNotes
```

**Files Created:**
```
src/application/
├── use-cases/note/
│   ├── create-note.use-case.ts
│   ├── update-note.use-case.ts
│   ├── delete-note.use-case.ts
│   └── get-user-notes.use-case.ts
├── ports/
│   └── i-note-repository.ts
└── dto/note/
    ├── create-note.dto.ts
    ├── update-note.dto.ts
    └── note.dto.ts
```

**Example use case:**

```typescript
// create-note.use-case.ts
export class CreateNoteUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly noteRepo: INoteRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // Validate input
    const titleResult = NoteTitle.create(input.title);
    const contentResult = NoteContent.create(input.content);
    const combined = Result.combine([titleResult, contentResult]);
    if (combined.isFailure) return Result.fail(combined.getError());

    // Create aggregate
    const note = Note.create({
      title: titleResult.getValue(),
      content: contentResult.getValue(),
      userId: UserId.create(new UUID(input.userId)),
    });

    // Persist
    const saveResult = await this.noteRepo.create(note);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());

    // Dispatch events
    await this.eventDispatcher.dispatch(note.domainEvents);

    return Result.ok({ id: note.id.value });
  }
}
```

## Step 5: Implement Repository (5 min)

**Tell Claude:**
> "Implement the DrizzleNoteRepository following the pattern in DrizzleUserRepository"

**Files Created:**
```
src/adapters/repositories/drizzle-note.repository.ts
src/adapters/mappers/note.mapper.ts
packages/drizzle/src/schema/notes.ts
```

**Update DI:**
```typescript
// common/di/modules/note.module.ts
export const createNoteModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.INoteRepository).toClass(DrizzleNoteRepository);
  m.bind(DI_SYMBOLS.CreateNoteUseCase).toClass(CreateNoteUseCase, [
    DI_SYMBOLS.INoteRepository,
    DI_SYMBOLS.IEventDispatcher,
  ]);
  // ... other use cases
  return m;
};
```

**Push database schema:**
```bash
pnpm db:push
```

## Step 6: Create UI (10 min)

**Tell Claude:**
> "Create a notes page at /dashboard/notes with:
> - List of user's notes
> - Create note button and form
> - Edit and delete actions on each note
> Follow the existing dashboard page patterns"

**Files Created:**
```
app/(protected)/dashboard/notes/
├── page.tsx
└── _components/
    ├── notes-list.tsx
    ├── note-card.tsx
    ├── create-note-form.tsx
    └── edit-note-dialog.tsx
```

**Example page:**

```typescript
// page.tsx
import { requireAuth } from "@/adapters/guards/require-auth";
import { NotesList } from "./_components/notes-list";

export default async function NotesPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Notes</h1>
      <NotesList userId={session.user.id} />
    </div>
  );
}
```

## Step 7: Add Tests (3 min)

Generate tests for use cases:

```
/gen-tests CreateNoteUseCase
/gen-tests UpdateNoteUseCase
/gen-tests DeleteNoteUseCase
```

**Files Created:**
```
src/application/use-cases/note/__TESTS__/
├── create-note.use-case.test.ts
├── update-note.use-case.test.ts
└── delete-note.use-case.test.ts
```

**Run tests:**
```bash
pnpm test
```

## Step 8: Final Checks

```bash
# Type check
pnpm type-check

# Lint and format
pnpm fix

# Run all tests
pnpm test

# Full quality check
pnpm check:all
```

## Step 9: Commit

```bash
git add .
git commit -m "feat(notes): add notes feature with CRUD operations"
```

## Done!

You've built a complete feature following Clean Architecture:

- **Domain**: Note aggregate, value objects, events
- **Application**: Use cases, ports, DTOs
- **Adapters**: Repository, mapper
- **Presentation**: Pages, components

## Tips

1. **Let Claude guide you** - The skills suggest the right next step
2. **Review generated code** - AI is fast, but verify it matches your needs
3. **Commit often** - Atomic commits after each step
4. **Run tests early** - Catch issues before they compound

## Next Steps

- **[AI Workflow](./04-ai-workflow.md)** - Deep dive into skills and agents
- **[Architecture](./02-architecture.md)** - Understand the patterns better
