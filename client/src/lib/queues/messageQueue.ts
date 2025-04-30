import { Queue } from "bullmq";

const messageQueue = new Queue("message", {
  connection: { host: "localhost", port: 6379 },
});

export default messageQueue;
