"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function voteOnGeneration(formData: FormData) {
  const generationId = formData.get("generation_id");
  const voteValue = formData.get("value");

  // Validate submitted data
  if (
    typeof generationId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(generationId) ||
    (voteValue !== "1" && voteValue !== "-1")
  ) {
    throw new Error("Invalid vote");
  }

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Insert a vote or update the user's existing vote
  const { error } = await supabase
    .from("votes")
    .upsert(
      {
        user_id: user.id,
        generation_id: generationId,
        value: Number(voteValue),
      },
      {
        onConflict: "user_id,generation_id",
      }
    );

  if (error) {
    console.error("Vote error:", error);
    throw new Error("Failed to save vote");
  }

  // Refresh feed after voting
  revalidatePath("/feed");
}