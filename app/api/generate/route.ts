import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  let requestId: string | null = null;
  let prompt = "";

  try {
    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in first" },
        { status: 401 }
      );
    }

    // 2. Read prompt
    const body = await request.json();
    prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt is too long" },
        { status: 400 }
      );
    }

    // 3. Create generation request log
    const { data: requestRow, error: requestInsertError } =
      await supabase
        .from("generation_requests")
        .insert({
          user_id: user.id,
          prompt,
          status: "processing",
        })
        .select("id")
        .single();

    if (requestInsertError) {
      console.error(
        "generation_requests insert error:",
        requestInsertError
      );
    } else {
      requestId = requestRow.id;
    }

    // 4. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      if (requestId) {
        await supabase
          .from("generation_requests")
          .update({ status: "failed" })
          .eq("id", requestId);
      }

      return NextResponse.json(
        { error: "Gemini API key is missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // 5. Generate AI caption
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `
Create ONE short, witty caption about Columbia University
or New York City student life.

Scenario: ${prompt}

Requirements:
- Maximum 2 sentences
- Funny and concise
- Suitable for college students
- No hashtags
- Do not explain the joke
      `,
    });

    const caption = response.text?.trim();

    if (!caption) {
      if (requestId) {
        await supabase
          .from("generation_requests")
          .update({ status: "failed" })
          .eq("id", requestId);
      }

      return NextResponse.json(
        { error: "No caption generated" },
        { status: 500 }
      );
    }

    // 6. Save final caption to generations
    const { data: generation, error: dbError } =
      await supabase
        .from("generations")
        .insert({
          user_id: user.id,
          prompt: prompt,
          content: caption,
        })
        .select()
        .single();

    if (dbError) {
      console.error("Database error:", dbError);

      if (requestId) {
        await supabase
          .from("generation_requests")
          .update({ status: "failed" })
          .eq("id", requestId);
      }

      return NextResponse.json(
        { error: "Failed to save caption" },
        { status: 500 }
      );
    }

    // 7. Save LLM response log
    if (requestId) {
      const { error: responseInsertError } = await supabase
        .from("llm_responses")
        .insert({
          request_id: requestId,
          response_text: caption,
          model_id: null,
        });

      if (responseInsertError) {
        console.error(
          "llm_responses insert error:",
          responseInsertError
        );
      }

      const { error: requestUpdateError } = await supabase
        .from("generation_requests")
        .update({ status: "completed" })
        .eq("id", requestId);

      if (requestUpdateError) {
        console.error(
          "generation_requests update error:",
          requestUpdateError
        );
      }
    }

    // 8. Return saved generation
    return NextResponse.json({
      generation,
    });

  } catch (error) {
    console.error("Generate route error:", error);

    if (requestId) {
      await supabase
        .from("generation_requests")
        .update({ status: "failed" })
        .eq("id", requestId);
    }

    return NextResponse.json(
      { error: "Failed to generate caption" },
      { status: 500 }
    );
  }
}