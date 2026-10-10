import { getStore } from './store';
import { ClosingService } from './closing';
declare global { var dukaanClosingWorker: ReturnType<typeof setInterval> | undefined; }
/** The queue is durable; this timer only wakes the backend consumer. Multiple consumers are safe. */
export function startClosingWorker() {
  if(globalThis.dukaanClosingWorker)return;
  const run=()=>{try{new ClosingService(getStore()).tick();}catch(error){console.error('[closing-worker]',error instanceof Error?error.name:'Error');}};
  globalThis.dukaanClosingWorker=setInterval(run,30_000);globalThis.dukaanClosingWorker.unref();run();
}
