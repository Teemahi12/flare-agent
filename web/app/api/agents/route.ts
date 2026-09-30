import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ agents: AGENTS });
}
