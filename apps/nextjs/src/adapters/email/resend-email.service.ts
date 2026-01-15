import { Result } from "@packages/ddd-kit";
import { Resend } from "resend";
import type {
  IEmailService,
  SendEmailParams,
} from "@/application/ports/email.service.port";

export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const fromAddress = process.env.EMAIL_FROM;
    if (!fromAddress) {
      throw new Error("EMAIL_FROM is not configured");
    }

    this.resend = new Resend(apiKey);
    this.fromAddress = fromAddress;
  }

  async send(params: SendEmailParams): Promise<Result<void>> {
    try {
      if (!params.html && !params.text) {
        return Result.fail("Email must have either html or text content");
      }

      const { error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html ?? "",
        text: params.text,
      });

      if (error) {
        return Result.fail(`Email error: ${error.message}`);
      }

      return Result.ok();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(`Email error: ${message}`);
    }
  }
}
