import winston from 'winston';
import CryptoAdapter from './CryptoAdapter';
import SaltRepository from './SaltRepository';
import MasterKeyRepository from './MasterKeyRepository';
import CryptoService from './CryptoService';
import DB from './Database';
import Taina from './Taina';
import DropboxSync from './sync/DropboxSync';
import Sync from './sync/index';
import Random from './helpers/Random';
import Merger from './sync/Merger';

const cryptoAdapter = CryptoAdapter.create();
const saltRepository = SaltRepository.create(cryptoAdapter);
const masterKeyRepository = MasterKeyRepository.create(saltRepository, cryptoAdapter);
const cryptoService = CryptoService.create(masterKeyRepository, cryptoAdapter);
const db = DB.create();
window.db = db;
const dbs = DropboxSync.create({key: '0bznfxkploq3khs', secret: '7bm6qlat09zs8ro'});
window.dbs = dbs;
const merger = Merger.create(Random);
const sync = Sync.create(db, [dbs], merger);
window.sync = sync;
const taina = Taina.create(cryptoService, db, saltRepository, masterKeyRepository, sync);
window.taina = taina;

require('./components/app.jsx').create(taina);

// TEST
let key = null;
winston.info('>>> START TEST');
masterKeyRepository.getKey().then(_key => {
  winston.info('Key loaded', _key);
  return _key;
}).catch(() => {
  winston.info('Creating new key');
  return masterKeyRepository.saveKey('qwerty').then(_key => {
    winston.info('New key created', _key);
    return _key;
  });
}).then(_key => {
  key = _key;
  return cryptoAdapter.encrypt('Hello World!!', key);
}).then(dataWithIV => {
  winston.info(dataWithIV);
  return cryptoAdapter.decrypt(dataWithIV.data, dataWithIV.iv, key);
}).then(openText => {
  winston.info(openText);
  winston.info('<<< TEST COMPLETE');
});
