# FTR-001: Verify Existing Auth

## Story

**As a** developer
**I want** to verify the existing auth implementation
**So that** I can build on a solid foundation

## Acceptance Criteria

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Sign out flow works
- [ ] Session management works
- [ ] Protected routes work
- [ ] Email verification works (if implemented)

## Verification Checklist

### Sign Up
```
1. Go to /signup
2. Enter: email, password, name
3. Submit form
4. Verify: user created in DB
5. Verify: session created
6. Verify: UserCreatedEvent emitted
7. Verify: redirected to dashboard
```

### Sign In
```
1. Go to /login
2. Enter: existing email, password
3. Submit form
4. Verify: session created
5. Verify: redirected to dashboard
```

### Sign Out
```
1. While logged in, click sign out
2. Verify: session destroyed
3. Verify: redirected to login
4. Verify: cannot access protected routes
```

### Protected Routes
```
1. While logged out, go to /dashboard
2. Verify: redirected to /login
3. After login, go to /dashboard
4. Verify: page loads with user info
```

### Session Persistence
```
1. Log in
2. Refresh page
3. Verify: still logged in
4. Close browser, reopen
5. Verify: session behavior as expected
```

## Code Review Points

- [ ] SignUpUseCase follows patterns
- [ ] SignInUseCase follows patterns
- [ ] Guards work correctly
- [ ] BetterAuth properly configured
- [ ] No security issues

## Definition of Done

- [ ] All flows tested manually
- [ ] All flows have passing tests
- [ ] No console errors
- [ ] Security review passed
