import { z } from "zod";
export const emailSchema = z.string().email().max(191);