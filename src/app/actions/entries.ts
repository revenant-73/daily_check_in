"use server";

import { db } from "@/lib/db";
import { checkIns, reviews, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

export async function submitCheckIn(data: {
  goal: string;
  pillar?: string; // Legacy
  metadata?: Record<string, any>;
  mentalRating: number;
  physicalRating: number;
  emotionalRating: number;
}, isPreview?: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (isPreview && session.user.role === "admin") {
      console.log("Preview submission, skipping DB write");
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.teamId) throw new Error("No team assigned");

    const { metadata, ...rest } = data;

    await db.insert(checkIns).values({
      playerId: session.user.id,
      teamId: user.teamId,
      ...rest,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    revalidatePath("/dashboard");
  } catch (error) {
    logError("submitCheckIn", error);
    throw error;
  }
}

export async function submitReview(data: {
  rating: number;
  mentalRating?: number;
  physicalRating?: number;
  emotionalRating?: number;
  notes: string;
  metadata?: Record<string, any>;
  nextSessionNotes: string;
}, isPreview?: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (isPreview && session.user.role === "admin") {
      console.log("Preview submission, skipping DB write");
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.teamId) throw new Error("No team assigned");

    const { metadata, ...rest } = data;

    await db.insert(reviews).values({
      playerId: session.user.id,
      teamId: user.teamId,
      ...rest,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    revalidatePath("/dashboard");
  } catch (error) {
    logError("submitReview", error);
    throw error;
  }
}

export async function getPlayerEntries() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { checkIns: [], reviews: [] };

    const playerCheckIns = await db.select().from(checkIns).where(eq(checkIns.playerId, session.user.id)).orderBy(desc(checkIns.createdAt)).all();
    const playerReviews = await db.select().from(reviews).where(eq(reviews.playerId, session.user.id)).orderBy(desc(reviews.createdAt)).all();

    return {
      checkIns: playerCheckIns,
      reviews: playerReviews,
    };
  } catch (error) {
    logError("getPlayerEntries", error);
    throw error;
  }
}

export async function getReadinessTrends() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Simple fetch all and filter/process for trend
    // In a larger app, we'd use a more complex SQL query with grouping
    const recentCheckIns = await db.select()
      .from(checkIns)
      .where(eq(checkIns.playerId, session.user.id))
      .orderBy(desc(checkIns.createdAt))
      .limit(7)
      .all();

    return recentCheckIns.map((ci: typeof checkIns.$inferSelect) => ({
      date: ci.createdAt,
      mental: ci.mentalRating,
      physical: ci.physicalRating,
      emotional: ci.emotionalRating,
      average: (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3
    })).reverse(); // Last 7 entries in chronological order
  } catch (error) {
    logError("getReadinessTrends", error);
    throw error;
  }
}
