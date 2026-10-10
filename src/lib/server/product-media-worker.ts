import { getStore } from './store';
import { ProductMediaService } from './product-media-service';
declare global { var dukaanMediaWorker: ReturnType<typeof setInterval> | undefined; }
/** Persistent Node backend only. Lookup is asynchronous and never part of stock confirmation. */
export function startProductMediaWorker() {
  if (globalThis.dukaanMediaWorker) return;
  let busy = false;
  const run = async () => { if (busy) return; busy = true; try { for (let i = 0; i < 3; i++) { if (!await new ProductMediaService(getStore()).processOne()) break; } } catch { console.error('[product-media-worker] Job deferred'); } finally { busy = false; } };
  globalThis.dukaanMediaWorker = setInterval(() => { void run(); }, 20000); globalThis.dukaanMediaWorker.unref(); void run();
}
