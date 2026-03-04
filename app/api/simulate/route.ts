import { NextRequest, NextResponse } from "next/server";
import { simulate } from "@/lib/agents/simulator";

export async function POST(request: NextRequest) {
  try {
    const { targetId, lever, changePct } = await request.json();

    if (!targetId || !lever || changePct === undefined) {
      return NextResponse.json({ error: "targetId, lever, and changePct are required" }, { status: 400 });
    }

    const result = simulate(targetId, lever, Number(changePct));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
