export async function register() {
  if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.VERCEL!=='1'&&process.env.DUKAANSET_CLOSING_WORKER==='1') {
    const {startClosingWorker}=await import('./lib/server/closing-worker');startClosingWorker();
  }
}
