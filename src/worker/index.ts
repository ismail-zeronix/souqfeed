import { Worker } from "bullmq";
import { logger } from "@/lib/logging/logger";
import {
  findStalledBroadcasts,
  markParseFailed,
  processBroadcast,
} from "@/modules/broadcasts/processing";
import {
  enqueueBroadcastParse,
  PARSE_ATTEMPTS,
  PARSE_QUEUE,
  parseQueueConnection,
  type ParseJobData,
} from "@/modules/broadcasts/queue";

const log = logger.child({ process: "worker" });
const SWEEP_INTERVAL_MS = 60_000;
const STALLED_AFTER_SECONDS = 120;

const worker = new Worker<ParseJobData>(
  PARSE_QUEUE,
  async (job) => {
    const result = await processBroadcast(job.data.broadcastId);
    log.info({ broadcastId: job.data.broadcastId, result }, "Broadcast parsed");
    return result;
  },
  { connection: parseQueueConnection(), concurrency: 4 },
);

worker.on("failed", (job, error) => {
  if (!job) return;
  const { broadcastId } = job.data;
  log.error(
    { err: error, broadcastId, attempt: job.attemptsMade },
    "Broadcast parse attempt failed",
  );
  if (job.attemptsMade >= (job.opts.attempts ?? PARSE_ATTEMPTS)) {
    markParseFailed(broadcastId).catch((markError) =>
      log.error(
        { err: markError, broadcastId },
        "Could not mark broadcast failed",
      ),
    );
  }
});

worker.on("error", (error) => log.error({ err: error }, "Worker error"));

/**
 * Re-queues broadcasts stuck in PROCESSING, e.g. submitted while Redis was
 * down. Queueing uses the broadcast id as job id, so one already waiting or
 * running isn't queued twice.
 */
async function sweep() {
  try {
    const stalled = await findStalledBroadcasts(STALLED_AFTER_SECONDS);
    for (const id of stalled) await enqueueBroadcastParse(id);
    if (stalled.length > 0) {
      log.info({ count: stalled.length }, "Re-queued stalled broadcasts");
    }
  } catch (error) {
    log.error({ err: error }, "Sweep failed");
  }
}

void sweep();
const sweeper = setInterval(sweep, SWEEP_INTERVAL_MS);
log.info({ queue: PARSE_QUEUE }, "Worker started");

async function shutdown(signal: string) {
  log.info({ signal }, "Worker shutting down");
  clearInterval(sweeper);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
