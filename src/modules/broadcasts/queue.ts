import { Queue } from "bullmq";
import { redisOptionsFromUrl } from "@/lib/queue/redis-options";
import { getEnv } from "@/lib/validation/env";

export const PARSE_QUEUE = "broadcast-parse";
export const PARSE_ATTEMPTS = 3;

export interface ParseJobData {
  broadcastId: string;
}

let queue: Queue<ParseJobData> | undefined;

export function parseQueueConnection() {
  return redisOptionsFromUrl(getEnv().REDIS_URL);
}

function getParseQueue(): Queue<ParseJobData> {
  queue ??= new Queue<ParseJobData>(PARSE_QUEUE, {
    connection: parseQueueConnection(),
    defaultJobOptions: {
      attempts: PARSE_ATTEMPTS,
      backoff: { type: "exponential", delay: 5_000 },
      // Removed when done, so a broadcast sent back for parsing later can be
      // queued again under the same job id.
      removeOnComplete: true,
      removeOnFail: true,
    },
  });
  return queue;
}

/**
 * Queues a broadcast for parsing. The job id is the broadcast id, so queueing
 * one that is already waiting or running does nothing.
 */
export async function enqueueBroadcastParse(
  broadcastId: string,
): Promise<void> {
  await getParseQueue().add("parse", { broadcastId }, { jobId: broadcastId });
}

/**
 * Like `enqueueBroadcastParse`, but gives up after `timeoutMs` instead of
 * waiting for Redis to come back. The worker's sweeper re-queues anything
 * left in PROCESSING, so a missed enqueue only delays parsing.
 */
export async function tryEnqueueBroadcastParse(
  broadcastId: string,
  timeoutMs = 3_000,
): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      enqueueBroadcastParse(broadcastId),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Queue timeout")), timeoutMs);
      }),
    ]);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
