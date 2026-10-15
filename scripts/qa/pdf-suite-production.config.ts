import {defineConfig} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import base from '../../playwright.config';

/** Compiled-app verification owns a fresh database; never uses preview shop data. */
export default defineConfig({...base,testDir:path.resolve('tests/e2e'),reporter:[['list']],webServer:{cwd:process.cwd(),command:'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001',url:'http://127.0.0.1:3001',timeout:120000,reuseExistingServer:false,env:{NODE_ENV:'production',DUKAANSET_ENV:'local',DUKAANSET_E2E:'1',DATABASE_PATH:'.data/pdf-suite-production-'+randomUUID()+'.sqlite',AUTH_BASE_URL:'http://127.0.0.1:3001',AUTH_EMAIL_MODE:'file',AUTH_MAIL_DIRECTORY:'.data/pdf-suite-production-mail',DUKAANSET_MEDIA_WORKER:'0',DUKAANSET_CLOSING_WORKER:'0',AI_PROVIDER:'',VOICE_STT_PROVIDER:'',VOICE_TTS_PROVIDER:'',MY_VOICE_PROVIDER:''}}});
