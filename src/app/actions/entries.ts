"use server";

import { db } from "@/lib/db";
import { checkIns, reviews, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";
import { z } from "zod";

const readinessRating = z.number().int().min(1).max(10);

const checkInSchema = z.object({
  goal: z.string().trim().min(1, "Choose a practice goal").max(300),
  pillar: z.string().trim().max(100).optional(),
  metadata: z
    .object({
      pillar: z.string().trim().max(100).optional(),
      lookLike: z.string().trim().max(500).optional(),
    })
    .strict()
    .optional(),
  mentalRating: readinessRating,
  physicalRating: readinessRating,
  emotionalRating: readinessRating,
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  mentalRating: readinessRating.optional(),
  physicalRating: readinessRating.optional(),
  emotionalRating: readinessRating.optional(),
  notes: z.string().trim().max(2_000),
  metadata: z
    .object({
      goalAttention: z.string().trim().max(50).nullable().optional(),
      cultureReview: z.string().trim().max(100).nullable().optional(),
      originalGoal: z.string().trim().max(300).optional(),
      originalPillar: z.string().trim().max(100).optional(),
      nextCommitment: z.string().trim().max(100).nullable().optional(),
    })
    .strict()
    .optional(),
  nextSessionNotes: z.string().trim().max(500),
});

type CheckInInput = z.infer<typeof checkInSchema>;
type ReviewInput = z.infer<typeof reviewSchema>;

export async function submitCheckIn(data: CheckInInput, isPreview?: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (isPreview && session.user.role === "admin") {
      return;
    }

    const parsed = checkInSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid check-in");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.teamId) throw new Error("No team assigned");
    if (user.role !== "player") throw new Error("Player access required");

    const { metadata, ...rest } = parsed.data;

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

export async function submitReview(data: ReviewInput, isPreview?: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (isPreview && session.user.role === "admin") {
      return;
    }

    const parsed = reviewSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid review");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.teamId) throw new Error("No team assigned");
    if (user.role !== "player") throw new Error("Player access required");

    const { metadata, ...rest } = parsed.data;

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
