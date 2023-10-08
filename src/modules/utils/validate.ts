import { z } from "zod";

export const pagination = {
  limit: z.number().min(10).max(100),
  page: z.number().min(1),
};
