'use strict';

const winston = require('winston');
const cryptoAdapter = CryptoAdapter.create();
const saltRepository = SaltRepository.create(cryptoService);
const masterKeyRepository = MasterKeyRepository.create(saltRepository, cryptoService);
const cryptoService = CryptoService.create(masterKeyRepository, cryptoAdapter);
const db = DB.create();
const taina = Taina.create(cryptoService, db);

let key = null;
masterKeyRepository.getKey().then(function(key) {
  winston.info('Key loaded', key);
  return key;
}).catch(function() {
  winston.info('Creating new key');
  return masterKeyRepository.saveKey('qwerty').then(function(_key) {
    key = _key;
    winston.info('New key created', key);
    return cryptoService.encrypt('Hello World!!', key);
  });
}).then(function(dataWithIV) {
  winston.info(dataWithIV);
  return cryptoService.decrypt(dataWithIV.data, key, dataWithIV.iv);
}).then(function(openText) {
  winston.info(openText);
});
