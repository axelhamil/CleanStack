import type { Result } from "@packages/ddd-kit";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: {
    name: string;
    data: Record<string, unknown>;
  };
}

export interface IEmailService {
  send(params: SendEmailParams): Promise<Result<void>>;
}
