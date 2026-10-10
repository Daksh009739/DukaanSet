import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {Store} from '../../src/lib/server/store';

// A private QA fixture only. Production registration retains its delivery requirements.
const database=resolve(process.env.DATABASE_PATH||'');
assert.equal(database,resolve('.data/v13-production-qa.sqlite'));
const store=new Store(database);
try{
 const email=`v13-${crypto.randomUUID()}@example.test`;
 const session=store.register({name:'Anand QA',email,password:'Fictional-private-2026',language:'en',businessName:'Anand Kirana · QA',category:'grocery'});
 store.db.prepare('UPDATE users SET email_verified=1,verification_required=1 WHERE id=?').run(session.user.id);
 assert.equal(store.session(session.user.id).user.emailVerified,true);
 console.log(JSON.stringify({email,business:session.businesses[0]}));
}finally{store.close();}
