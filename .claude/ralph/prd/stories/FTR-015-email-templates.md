# FTR-015: Email Templates

## Story

**As a** user
**I want** well-designed emails
**So that** I have a professional experience

## Acceptance Criteria

- [ ] Welcome email template
- [ ] Password reset template
- [ ] Payment confirmation template
- [ ] Templates are responsive
- [ ] Templates use React Email or similar

## Technical Notes

### Setup with React Email

```bash
pnpm add @react-email/components react-email
```

### Template Structure

```
emails/
├── templates/
│   ├── welcome.tsx
│   ├── password-reset.tsx
│   └── payment-confirmation.tsx
└── components/
    ├── layout.tsx
    ├── button.tsx
    └── footer.tsx
```

### Email Layout

```typescript
// emails/components/layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
} from '@react-email/components';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {children}
          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyle = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};
```

### Welcome Email

```typescript
// emails/templates/welcome.tsx
import { Heading, Text, Button, Section } from '@react-email/components';
import { EmailLayout } from '../components/layout';

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to AppName, ${name}!`}>
      <Heading style={headingStyle}>Welcome to AppName!</Heading>
      <Text style={textStyle}>
        Hi {name},
      </Text>
      <Text style={textStyle}>
        Thank you for signing up. We're excited to have you on board.
        Get started by exploring your dashboard.
      </Text>
      <Section style={buttonContainerStyle}>
        <Button style={buttonStyle} href={loginUrl}>
          Go to Dashboard
        </Button>
      </Section>
      <Text style={textStyle}>
        If you have any questions, reply to this email. We're here to help!
      </Text>
    </EmailLayout>
  );
}

export function renderWelcomeEmail(props: WelcomeEmailProps): string {
  return render(<WelcomeEmail {...props} />);
}
```

### Password Reset Email

```typescript
// emails/templates/password-reset.tsx
export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={headingStyle}>Reset Your Password</Heading>
      <Text style={textStyle}>Hi {name},</Text>
      <Text style={textStyle}>
        We received a request to reset your password. Click the button below
        to create a new password. This link will expire in 1 hour.
      </Text>
      <Section style={buttonContainerStyle}>
        <Button style={buttonStyle} href={resetUrl}>
          Reset Password
        </Button>
      </Section>
      <Text style={textStyle}>
        If you didn't request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

### Payment Confirmation

```typescript
// emails/templates/payment-confirmation.tsx
export function PaymentConfirmationEmail({
  name,
  planName,
  amount,
  nextBillingDate,
}: PaymentConfirmationProps) {
  return (
    <EmailLayout preview="Payment confirmation">
      <Heading style={headingStyle}>Payment Confirmed</Heading>
      <Text style={textStyle}>Hi {name},</Text>
      <Text style={textStyle}>
        Thank you for your payment. Here are your details:
      </Text>
      <Section style={detailsStyle}>
        <Row>
          <Column>Plan:</Column>
          <Column>{planName}</Column>
        </Row>
        <Row>
          <Column>Amount:</Column>
          <Column>${amount}</Column>
        </Row>
        <Row>
          <Column>Next billing:</Column>
          <Column>{nextBillingDate}</Column>
        </Row>
      </Section>
      <Text style={textStyle}>
        You can manage your subscription in your account settings.
      </Text>
    </EmailLayout>
  );
}
```

### Preview Emails

```bash
# Add to package.json
"scripts": {
  "email:dev": "email dev"
}

# Run preview server
pnpm email:dev
```

## Definition of Done

- [ ] Templates created
- [ ] Preview works
- [ ] Templates render correctly
- [ ] Mobile responsive
