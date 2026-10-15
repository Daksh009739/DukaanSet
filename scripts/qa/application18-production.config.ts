import {defineConfig} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import base from '../../playwright.config';
const development=process.env.DUKAANSET_QA_SERVER_MODE==='development';
/** One compiled-app suite per fresh server/database; no preview or live-account data. */
export default defineConfig({...base,testDir:path.resolve('tests/e2e'),reporter:[['line'],['json',{outputFile:path.resolve(process.env.DUKAANSET_QA_JSON_REPORT||process.env.PLAYWRIGHT_JSON_OUTPUT_NAME||'.local/qa/application18/result.json')}]],webServer:{cwd:process.cwd(),command:development?'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3001':'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001',url:'http://127.0.0.1:3001',timeout:120000,reuseExistingServer:false,env:{NODE_ENV:development?'development':'production',...(development?{DUKAANSET_BUILD_DIR:'.next-e2e-audit'}:{}),DUKAANSET_ENV:'local',DUKAANSET_E2E:'1',DATABASE_PATH:'.data/application18-production-'+randomUUID()+'.sqlite',AUTH_BASE_URL:'http://127.0.0.1:3001',AUTH_EMAIL_MODE:'file',AUTH_MAIL_DIRECTORY:'.data/e2e-mail',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0',DUKAANSET_UPI_WORKER:'0',AI_PROVIDER:'',OPENAI_API_KEY:'',VOICE_STT_PROVIDER:'',VOICE_TTS_PROVIDER:'',MY_VOICE_PROVIDER:'',RAZORPAY_CLIENT_ID:'',RAZORPAY_CLIENT_SECRET:''}}});
