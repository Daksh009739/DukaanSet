import path from 'node:path';
import {homedir} from 'node:os';
import {httpsOrigin} from './deployment-config.mjs';

// The hosting account home is outside hbuilds/current and public_html. Never
// keep the SQLite/WAL files in a release directory that Hostinger replaces.
export function configureHostinger(env, home = homedir()) {
  if (env.DUKAANSET_HOSTINGER_STAGING !== '1' || env.DUKAANSET_ENV !== 'staging') throw new Error('Select the explicit Hostinger staging deployment.');
  const origin = httpsOrigin(env.DUKAANSET_PUBLIC_ORIGIN, 'DUKAANSET_PUBLIC_ORIGIN');
  const host = new URL(origin).hostname;
  if (!host.endsWith('.hostingersite.com')) throw new Error('This staging package requires the selected temporary Hostinger address.');
  if (!path.isAbsolute(home) || /(?:^|[\\/])(?:tmp|public_html|hbuilds|nodejs)(?:[\\/]|$)/i.test(home) || home === path.parse(home).root) throw new Error('A private persistent hosting account home is required.');
  const root = path.join(home, '.dukaanset-staging', host);
  if (env.DUKAANSET_DATA_ROOT && path.resolve(env.DUKAANSET_DATA_ROOT) !== root) throw new Error('Unexpected staging data root.');
  const database = path.join(root, 'dukaanset.sqlite');
  if (env.DATABASE_PATH && path.resolve(env.DATABASE_PATH) !== database) throw new Error('Unexpected staging database path.');
  env.DUKAANSET_DATA_ROOT = root;
  env.DATABASE_PATH = database;
  return {root, database};
}
