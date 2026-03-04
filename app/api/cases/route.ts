import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const casesPath = path.join(process.cwd(), "data", "sample-cases.json");
    const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
    return NextResponse.json(cases);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
