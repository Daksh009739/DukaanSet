export async function register() {
  if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.VERCEL!=='1'&&process.env.DUKAANSET_MEDIA_WORKER!=='0') {
    const {startProductMediaWorker}=await import('./lib/server/product-media-worker');startProductMediaWorker();
  }
  if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.VERCEL!=='1'&&process.env.DUKAANSET_CLOSING_WORKER==='1') {
    const {startClosingWorker}=await import('./lib/server/closing-worker');startClosingWorker();
  }
}
