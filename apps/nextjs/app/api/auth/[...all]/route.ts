import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/common/auth";

export const { GET, POST } = toNextJsHandler(auth);
