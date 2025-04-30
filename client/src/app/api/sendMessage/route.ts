import { NextRequest, NextResponse } from 'next/server'
import messageQueue from '@/lib/queues/messageQueue'

export async function POST(request: NextRequest) {
  const { message, chatId, senderId } = await request.json()

  // this should be in the client side
  const messageQueueEntry = await messageQueue.add("message",{ message, chatId, senderId })
  console.log('messageQueueEntry', messageQueueEntry)

  return NextResponse.json(messageQueueEntry)
}
