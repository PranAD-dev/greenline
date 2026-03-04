import { NextRequest, NextResponse } from "next/server";
import { analyzePolicy } from "@/lib/agents/globe";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Policy text is required" }, { status: 400 });
    }

    const locations = await analyzePolicy(text);
    return NextResponse.json({ locations });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
