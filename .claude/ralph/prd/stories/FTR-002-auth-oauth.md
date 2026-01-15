# FTR-002: OAuth Providers

## Story

**As a** user
**I want** to sign in with Google/GitHub
**So that** I don't need to remember another password

## Acceptance Criteria

- [ ] Google OAuth configured
- [ ] GitHub OAuth configured
- [ ] OAuth buttons on login/signup pages
- [ ] Account linking works
- [ ] Error handling for OAuth failures

## Technical Notes

### BetterAuth Config

```typescript
// common/auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### Environment Variables

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### OAuth Setup Links
- Google: https://console.cloud.google.com/apis/credentials
- GitHub: https://github.com/settings/developers

### UI Components

```typescript
// app/(auth)/login/_components/oauth-buttons.tsx
export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        onClick={() => authClient.signIn.social({ provider: "google" })}
      >
        <GoogleIcon /> Continue with Google
      </Button>
      <Button
        variant="outline"
        onClick={() => authClient.signIn.social({ provider: "github" })}
      >
        <GitHubIcon /> Continue with GitHub
      </Button>
    </div>
  );
}
```

### Account Linking

When OAuth user already has email account:
- Option 1: Link accounts automatically
- Option 2: Prompt user to link
- Option 3: Treat as separate account

## Definition of Done

- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Error states handled
- [ ] UI polished
