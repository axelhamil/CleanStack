import { createModule } from "@evyweb/ioctopus";
import { ResendEmailService } from "@/adapters/services/email/resend-email.service";
import { DI_SYMBOLS } from "../types";

export const createEmailModule = () => {
  const emailModule = createModule();

  emailModule.bind(DI_SYMBOLS.IEmailService).toClass(ResendEmailService);

  return emailModule;
};
