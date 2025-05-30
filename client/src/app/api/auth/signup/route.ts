"use server"
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  const body = await req.json();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const backendRes = await fetch(`${backendUrl}/auth/register`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return NextResponse.json({message:"success"})
}
