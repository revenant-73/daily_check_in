"use server";

import { db } from "@/lib/db";
import { organizations, teams, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getAdminData() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const allOrganizations = await db.select().from(organizations);
  const allTeams = await db.select().from(teams);
  const allUsers = await db.select().from(users);

  return {
    organizations: allOrganizations,
    teams: allTeams,
    users: allUsers,
  };
}

export async function createOrganization(name: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.insert(organizations).values({ name });
  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: "admin" | "coach" | "player") {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin");
}

export async function assignToTeam(userId: string, teamId: string | null) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ teamId }).where(eq(users.id, userId));
  revalidatePath("/admin");
}
