'use strict';

window.MasterKeyRepository = (function() {
  const Promise = require('bluebird');
  let module = {};

  module.create = function(saltRepository, cryptoService) {
    if (!saltRepository) throw Error('mising saltRepository dependency');
    if (!cryptoService) throw Error('missing cryptoService');

    let MasterKeyRepository = {};
    let storage = sessionStorage;
    const MASTER_KEY_KEY = '_taina_master-key';

    MasterKeyRepository.getKey = function() {
      let key = storage.getItem('masterKey');
      return Promise.resolve(key);
    };

    MasterKeyRepository.generateKey = function(password) {
      return saltRepository.findOrCreate().then(function(salt) {
        return cryptoService.generateHashFromPassword(password, salt);
      });
    };

    MasterKeyRepository.saveKey = function(password) {
      return MasterKeyRepository.generateKey(password).then(function(key) {
        storage.setItem(MASTER_KEY_KEY, key);
        return key;
      });
    };

    return MasterKeyRepository;
  }

  return module;
})();
