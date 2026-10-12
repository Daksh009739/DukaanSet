import {z} from 'zod';
// Voice schemas run in the browser's strict CSP as well as on the backend.
// Disable generated-function validation and its eval capability probe.
z.config({jitless:true});
export {z};
