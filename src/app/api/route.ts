import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Cue Cards API is running"
  });
}