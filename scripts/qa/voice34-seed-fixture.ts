import {basename,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {Store} from '../../src/lib/server/store';
const database=resolve(process.env.DATABASE_PATH||'');assert.ok(basename(database).startsWith('voice34-production-qa-'));assert.equal(resolve('.data'),resolve(database,'..'));assert.equal(process.env.DUKAANSET_ENV,'local');
const store=new Store(database);
try{const session=store.register({name:'Voice34 QA Owner',email:'voice34-owner@example.test',password:'Voice34-fixture-only-2026',businessName:'Voice34 QA Store',category:'grocery',language:'en'});store.db.prepare('UPDATE users SET email_verified=1 WHERE id=?').run(session.user.id);store.createContact(session.user.id,session.businesses[0].id,'customers',{name:'Rahul',phone:'9000000001'});store.createProduct(session.user.id,session.businesses[0].id,{name:'Daal',unit:'kg',pricePaise:8000,costPaise:5000,quantityMilli:100000});}finally{store.close();}
