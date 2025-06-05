"use server"
// import { useParams } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await backendRes.json()
  console.log(data)
  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status })
  }
  // const cookie = backendRes.headers.get('set-cookie')

  // const response = NextResponse.json(data, { status: backendRes.status })

  // if (cookie) {
  //   response.headers.set('set-cookie', cookie)
  // }

  // return response
// 
  // console.log("called ", body) // success

  return NextResponse.json({
    "status": "success",
    "user" : data.user
  })
}
