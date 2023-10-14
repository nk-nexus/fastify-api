import { PrismaClient } from "@prisma/client";

// declare prisma with log level
const prisma = new PrismaClient({
  log: [{ emit: 'stdout', level: 'warn' }],
});

export default prisma;
