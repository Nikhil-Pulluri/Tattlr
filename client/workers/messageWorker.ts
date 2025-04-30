import { Worker } from "bullmq";
import dotenv from 'dotenv';
dotenv.config();


const worker = new Worker(
  "message",
  async (job) => {
    console.log("worker started")
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    // const token = localStorage.getItem('token')
    const { message, chatId, senderId } = job.data
    console.log("message", message)
    console.log("chatId", chatId)
    console.log("senderId", senderId)
    const msgSendingStatus = await fetch(`${backendUrl}/message/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: message,
            chatId: chatId,
            senderId: senderId,
          }),
        })

        if (!msgSendingStatus.ok) {
          throw new Error('Failed to send message')
        }

        console.log('Message sent successfully', msgSendingStatus)

      
  },
  {
    connection: { host: "localhost", port: 6379 },
  }
);
