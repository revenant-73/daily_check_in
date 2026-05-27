"use server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as "player" | "coach" | "admin" || "player";
  const adminCode = formData.get("adminCode") as string;

  if (role === "admin") {
    const validAdminCode = process.env.ADMIN_SIGNUP_CODE;
    if (!validAdminCode || adminCode !== validAdminCode) {
      throw new Error("Invalid admin access code");
    }
  }

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role,
  });

  return { success: true };
}
