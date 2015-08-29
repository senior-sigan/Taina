'use strict';

const winston = window.require('winston');
const CryptoAdapter = require('./CryptoAdapter');
const SaltRepository = require('./SaltRepository');
const MasterKeyRepository = require('./MasterKeyRepository');
const CryptoService = require('./CryptoService');
const DB = require('./Database');
const Taina = require('./Taina');
const DropboxSync = require('./sync/DropboxSync');
const Sync = require('./sync/index');
const SyncTest = require('./sync/test');
const Random = require('./helpers/Random');

const cryptoAdapter = CryptoAdapter.create();
const saltRepository = SaltRepository.create(cryptoAdapter);
const masterKeyRepository = MasterKeyRepository.create(saltRepository, cryptoAdapter);
const cryptoService = CryptoService.create(masterKeyRepository, cryptoAdapter);
const db = DB.create();
window.db = db;
const taina = Taina.create(cryptoService, db);
window.taina = taina;
const dbs = DropboxSync.create({key: '0bznfxkploq3khs', secret:'7bm6qlat09zs8ro'});
window.dbs = dbs;
const sync = Sync.create(db, [dbs], Random);
const syncTest = SyncTest.create(sync);
syncTest.run();

// TEST
let key = null;
winston.info('>>> START TEST');
masterKeyRepository.getKey().then(function(_key) {
  winston.info('Key loaded', _key);
  return _key;
}).catch(function() {
  winston.info('Creating new key');
  return masterKeyRepository.saveKey('qwerty').then(function(_key) {
    winston.info('New key created', _key);
    return _key;
  });
}).then(function(_key) {
  key = _key;
  return cryptoAdapter.encrypt('Hello World!!', key);
}).then(function(dataWithIV) {
  winston.info(dataWithIV);
  return cryptoAdapter.decrypt(dataWithIV.data, dataWithIV.iv, key);
}).then(function(openText) {
  winston.info(openText);
  winston.info('<<< TEST COMPLETE');
});
