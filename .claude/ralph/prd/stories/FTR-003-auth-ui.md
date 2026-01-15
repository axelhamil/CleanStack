# FTR-003: Auth UI Polish

## Story

**As a** user
**I want** polished auth pages
**So that** I have confidence in the product

## Acceptance Criteria

- [ ] Login page styled
- [ ] Signup page styled
- [ ] Forgot password page (if applicable)
- [ ] Loading states
- [ ] Error messages clear
- [ ] Responsive design
- [ ] Animations smooth

## Pages

### Login Page
- Email input
- Password input
- "Remember me" checkbox
- "Forgot password" link
- Sign in button
- OAuth buttons
- "Don't have account? Sign up" link

### Signup Page
- Name input
- Email input
- Password input
- Password confirmation (optional)
- Terms checkbox
- Sign up button
- OAuth buttons
- "Already have account? Log in" link

### Components Needed

```typescript
// Form wrapper
<Card>
  <CardHeader>
    <CardTitle>Welcome back</CardTitle>
    <CardDescription>Sign in to your account</CardDescription>
  </CardHeader>
  <CardContent>
    <Form>...</Form>
  </CardContent>
  <CardFooter>
    <OAuthButtons />
  </CardFooter>
</Card>

// Form with validation
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});

// Loading state
<Button disabled={isLoading}>
  {isLoading && <Spinner />}
  Sign in
</Button>

// Error display
{error && (
  <Alert variant="destructive">
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

### Design Specs

- Max width: 400px
- Center aligned
- Logo at top
- Subtle background
- Consistent spacing
- Mobile: full width with padding

## Definition of Done

- [ ] Login page polished
- [ ] Signup page polished
- [ ] Mobile responsive
- [ ] Loading/error states
