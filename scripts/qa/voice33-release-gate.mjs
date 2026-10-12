import fs from 'node:fs';
const file=process.argv[2]||'docs/qa/voice33/live-acceptance.json',record=JSON.parse(fs.readFileSync(file,'utf8')),failures=[];
if(record.version!=='3.3'||!/^https:\/\//.test(record.stagingUrl||'')||!/^[a-f0-9]{40}$/.test(record.reviewedCommit||''))failures.push('Version, HTTPS staging URL and reviewed commit are required.');
if(record.providerVerified!==true)failures.push('Live configured provider verification is pending.');
const scenarios=['automaticGreeting','automaticMicAfterGreeting','naturalEndpoint','duplicateSeparateRahul','spokenSaveVerified','billingLedger','paymentLedger','stockConfirmation','pauseCloseRelease','languageVoicePersistence','noiseAndLongPause','networkRecovery','permissionDenial','shopIsolation'];
for(const device of ['desktop','android']){const run=record[device];if(run?.status!=='passed'||run.humanMicrophone!==true||!run.browser||!Number.isFinite(Date.parse(run.testedAt))||!run.evidence)failures.push(`${device}: a dated human microphone run and evidence are required.`);for(const scenario of scenarios)if(run?.scenarios?.[scenario]!=='passed')failures.push(`${device}: ${scenario} pending.`);}
const m=record.metrics||{};for(const key of ['endpointSuccess','intentAccuracy','duplicateFollowupSuccess'])if(!Number.isFinite(m[key])||m[key]<.95||m[key]>1)failures.push(`${key}: measured rate must meet the 95% acceptance threshold.`);
if(m.duplicateBackendWrites!==0)failures.push('Duplicate backend writes must be zero.');if(!Number.isFinite(m.replyLatencyP95Ms)||m.replyLatencyP95Ms<=0||m.replyLatencyP95Ms>8000)failures.push('Measured spoken turn p95 must be within 8 seconds.');
if(!Array.isArray(record.criticalFailures)||record.criticalFailures.length)failures.push('Critical failures must be resolved.');
console.log(JSON.stringify({productionReady:failures.length===0,evidence:file,failures},null,2));if(failures.length)process.exitCode=1;
