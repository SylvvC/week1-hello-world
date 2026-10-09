import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();

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
    const prompt =
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

    // 3. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // 4. Generate AI caption
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
      return NextResponse.json(
        { error: "No caption generated" },
        { status: 500 }
      );
    }

    // 5. Save to Supabase
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

      return NextResponse.json(
        { error: "Failed to save caption" },
        { status: 500 }
      );
    }

    // 6. Return saved generation
    return NextResponse.json({
      generation: generation,
    });

  } catch (error) {
    console.error("Generate route error:", error);

    return NextResponse.json(
      { error: "Failed to generate caption" },
      { status: 500 }
    );
  }
}