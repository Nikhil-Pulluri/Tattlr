"use server"
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // const body = await req.json()

  console.log("chat called")


  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/conversation/getUserConversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({userId}),
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

  // return NextResponse.json({
  //   "status": "success",
  //   "user" : data.user
  // })

  return NextResponse.json(data)
}
