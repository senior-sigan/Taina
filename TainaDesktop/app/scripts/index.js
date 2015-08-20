'use strict';

const winston = require('winston');
const cryptoAdapter = CryptoAdapter.create();
const saltRepository = SaltRepository.create(cryptoAdapter);
const masterKeyRepository = MasterKeyRepository.create(saltRepository, cryptoAdapter);
const cryptoService = CryptoService.create(masterKeyRepository, cryptoAdapter);
const db = DB.create();
const taina = Taina.create(cryptoService, db);


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
