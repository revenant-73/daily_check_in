"use server";

import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitFeedback(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const rating = parseInt(formData.get("rating") as string) || null;
  const category = formData.get("category") as string || "general";

  if (!content) throw new Error("Feedback content is required");

  await db.insert(feedback).values({
    userId: session.user.id,
    content,
    rating,
    category,
  });

  revalidatePath("/dashboard");
  return { success: true };
}
