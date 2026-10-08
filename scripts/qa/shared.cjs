const fs = require('node:fs');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const address = new URL(process.env.DUKAANSET_QA_ORIGIN || 'http://127.0.0.1:3000');
if (!['http:', 'https:'].includes(address.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(address.hostname) || address.username || address.password || address.pathname !== '/' || address.search || address.hash) {
  throw new Error('DUKAANSET_QA_ORIGIN must be a local app origin, such as http://127.0.0.1:3000.');
}
const origin = address.origin;

function outputDirectory(name) {
  const output = path.resolve(__dirname, '../../.local/visual-qa', name);
  fs.mkdirSync(output, { recursive: true });
  return output;
}

function launchBrowser() {
  const browserName = process.env.DUKAANSET_QA_BROWSER || (process.platform === 'win32' ? 'msedge' : 'chromium');
  if (!['msedge', 'chrome', 'chromium'].includes(browserName)) {
    throw new Error('DUKAANSET_QA_BROWSER must be msedge, chrome, or chromium.');
  }
  return chromium.launch({ headless: true, ...(browserName === 'chromium' ? {} : { channel: browserName }) });
}

function writeReport(report, output, filename) {
  fs.writeFileSync(path.join(output, filename), JSON.stringify(report, null, 2));
  const failed = report.filter(result => {
    const viewport = result.viewport ?? result.width;
    const expectedStatus = result.route === '/unknown-page' ? 404 : 200;
    return result.violations?.length || result.overflow?.length || result.errors?.length || result.passed === false ||
      (viewport !== undefined && result.scrollWidth > viewport) ||
      (result.status !== undefined && result.status !== expectedStatus);
  });
  if (failed.length) {
    console.error(`Visual QA found ${failed.length} failed checks. See ${path.join(output, filename)}.`);
    process.exitCode = 1;
  } else {
    console.log(`Visual QA passed. Report: ${path.join(output, filename)}`);
  }
}

module.exports = { fs, path, chromium, expect, AxeBuilder, origin, outputDirectory, launchBrowser, writeReport };
