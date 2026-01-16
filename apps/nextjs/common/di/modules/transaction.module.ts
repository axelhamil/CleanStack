import { createModule } from "@evyweb/ioctopus";
import { TransactionService } from "@packages/drizzle";
import { env } from "@/common/env";
import { DI_SYMBOLS } from "../types";

export const createTransactionModule = () => {
  const transactionModule = createModule();
  if (env.NODE_ENV === "test") {
  } else {
    transactionModule
      .bind(DI_SYMBOLS.ITransactionManagerService)
      .toClass(TransactionService);
  }

  return transactionModule;
};
