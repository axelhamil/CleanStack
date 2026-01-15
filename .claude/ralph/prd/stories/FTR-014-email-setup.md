# FTR-014: Email Provider Setup

## Story

**As a** developer
**I want** an email provider integration
**So that** I can send transactional emails

## Acceptance Criteria

- [ ] IEmailService interface
- [ ] Resend/SendGrid/Postmark provider
- [ ] Email sending works
- [ ] Environment variables configured

## Technical Notes

### Interface

```typescript
// src/application/ports/i-email-service.port.ts
export interface IEmailService {
  send(params: SendEmailParams): Promise<Result<void>>;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: {
    name: string;
    data: Record<string, unknown>;
  };
}
```

### Resend Implementation

```typescript
// src/adapters/email/resend-email.service.ts
import { Resend } from 'resend';

export class ResendEmailService implements IEmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(params: SendEmailParams): Promise<Result<void>> {
    try {
      await this.resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Email error: ${error.message}`);
    }
  }
}
```

### Alternative: SendGrid

```typescript
// src/adapters/email/sendgrid-email.service.ts
import sgMail from '@sendgrid/mail';

export class SendGridEmailService implements IEmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async send(params: SendEmailParams): Promise<Result<void>> {
    try {
      await sgMail.send({
        to: params.to,
        from: process.env.EMAIL_FROM!,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Email error: ${error.message}`);
    }
  }
}
```

### Environment Variables

```env
# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourapp.com

# OR SendGrid
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@yourapp.com
```

### DI Registration

```typescript
// common/di/modules/email.module.ts
export const createEmailModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.IEmailService).toClass(ResendEmailService);
  return m;
};
```

### Usage in Event Handler

```typescript
// src/application/event-handlers/send-welcome-email.handler.ts
export class SendWelcomeEmailHandler implements IEventHandler<UserCreatedEvent> {
  readonly eventType = 'user.created';

  constructor(private readonly emailService: IEmailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.send({
      to: event.payload.email,
      subject: 'Welcome to AppName!',
      html: renderWelcomeEmail({ name: event.payload.name }),
    });
  }
}
```

## Definition of Done

- [ ] Interface defined
- [ ] Provider implemented
- [ ] Registered in DI
- [ ] Test email sends
