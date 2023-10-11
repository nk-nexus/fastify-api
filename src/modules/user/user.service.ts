import { UserRole } from "@prisma/client";
import { hashPassword } from "../utils/hash";
import prisma from "../utils/prisma";
import { RegisterUserInput } from "./user.schema";

export async function registerUser(input: RegisterUserInput) {
  const { password, ...rest } = input;
  const { hash, salt } = hashPassword(password);

  return prisma.user.create({
    data: { ...rest, salt, password: hash, role: UserRole.CUSTOMER },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
