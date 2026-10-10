import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e', fullyParallel:false, workers:1, timeout:60_000,
  expect:{timeout:15_000}, reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:3001',channel:process.platform==='win32'?'msedge':undefined,viewport:{width:1440,height:1000},trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'npm run dev -- --port 3001',url:'http://127.0.0.1:3001',timeout:120_000,reuseExistingServer:false,env:{DUKAANSET_MEDIA_WORKER:'0',DATABASE_PATH:'.data/e2e.sqlite',DUKAANSET_BUILD_DIR:'.next-e2e',NEXT_TELEMETRY_DISABLED:'1',AUTH_BASE_URL:'http://127.0.0.1:3001',AUTH_EMAIL_MODE:'file',AUTH_MAIL_DIRECTORY:'.data/e2e-mail',AI_PROVIDER:''}},
});
