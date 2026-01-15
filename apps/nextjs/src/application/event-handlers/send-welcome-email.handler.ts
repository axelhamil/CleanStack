import { Result } from "@packages/ddd-kit";
import type { IEmailService } from "@/application/ports/email.service.port";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { UserCreatedEvent } from "@/domain/user/events/user-created.event";

export class SendWelcomeEmailHandler
  implements IEventHandler<UserCreatedEvent>
{
  readonly eventType = "user.created";

  constructor(private readonly emailService: IEmailService) {}

  async handle(event: UserCreatedEvent): Promise<Result<void>> {
    const result = await this.emailService.send({
      to: event.payload.email,
      subject: "Welcome to the App!",
      html: this.renderWelcomeEmail(event.payload.name),
      text: `Welcome ${event.payload.name}! Thank you for signing up.`,
    });

    if (result.isFailure) {
      console.error(
        `[Event] Failed to send welcome email to ${event.payload.email}: ${result.getError()}`,
      );
      return result;
    }

    console.log(`[Event] Welcome email sent to ${event.payload.email}`);
    return Result.ok();
  }

  private renderWelcomeEmail(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome!</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-weight: 900; text-transform: uppercase; border-bottom: 3px solid black; padding-bottom: 10px;">
            Welcome!
          </h1>
          <p style="font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Thank you for signing up! We're excited to have you on board.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
            Best regards,<br>
            The Team
          </p>
        </body>
      </html>
    `;
  }
}
