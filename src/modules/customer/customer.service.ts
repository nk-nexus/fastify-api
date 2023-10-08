import { hashPassword } from "../utils/hash";
import prisma from "../utils/prisma";
import { CreateCustomerInput } from "./customer.schema";

export async function createCustomer(input: CreateCustomerInput) {
  const { password, ...rest } = input;

  const { hash, salt } = hashPassword(password);
  const customer = await prisma.customer.create({
    data: { ...rest, salt, password: hash },
  });

  return customer;
}

export async function findCustomerByEmail(email: string) {
  return prisma.customer.findUnique({
    where: {
      email,
    },
  });
}
