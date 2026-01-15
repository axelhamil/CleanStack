import { Result } from "@packages/ddd-kit";
import type { IEmailService } from "@/application/ports/email.service.port";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { UserCreatedEvent } from "@/domain/user/events/user-created.event";
import { renderWelcomeEmail } from "@/emails/templates/welcome";

export class SendWelcomeEmailHandler
  implements IEventHandler<UserCreatedEvent>
{
  readonly eventType = "user.created";

  constructor(private readonly emailService: IEmailService) {}

  async handle(event: UserCreatedEvent): Promise<Result<void>> {
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      : "https://example.com/dashboard";

    const html = await renderWelcomeEmail({
      name: event.payload.name,
      loginUrl,
    });

    const result = await this.emailService.send({
      to: event.payload.email,
      subject: "Welcome to the App!",
      html,
      text: `Welcome ${event.payload.name}! Thank you for signing up. Visit your dashboard at ${loginUrl}`,
    });

    if (result.isFailure) {
      return result;
    }
    return Result.ok();
  }
}
