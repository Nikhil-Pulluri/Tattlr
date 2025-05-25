"use server"
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  const body = await req.json();

  // console.log("called", body) // success
  return NextResponse.json({message:"success"})
}
