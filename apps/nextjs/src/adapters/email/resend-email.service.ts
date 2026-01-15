import { Result } from "@packages/ddd-kit";
import { Resend } from "resend";
import type {
  IEmailService,
  SendEmailParams,
} from "@/application/ports/email.service.port";

export class ResendEmailService implements IEmailService {
  private _resend: Resend | null = null;
  private _fromAddress: string | null = null;

  private getResend(): Resend {
    if (!this._resend) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured");
      }
      this._resend = new Resend(apiKey);
    }
    return this._resend;
  }

  private getFromAddress(): string {
    if (!this._fromAddress) {
      const fromAddress = process.env.EMAIL_FROM;
      if (!fromAddress) {
        throw new Error("EMAIL_FROM is not configured");
      }
      this._fromAddress = fromAddress;
    }
    return this._fromAddress;
  }

  async send(params: SendEmailParams): Promise<Result<void>> {
    try {
      if (!params.html && !params.text) {
        return Result.fail("Email must have either html or text content");
      }

      const { error } = await this.getResend().emails.send({
        from: this.getFromAddress(),
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
