'use strict';

window.MasterKeyRepository = (function() {
  const Promise = require('bluebird');
  const module = {};

  module.create = function(saltRepository, cryptoAdapter) {
    if (!saltRepository) throw Error('mising saltRepository dependency');
    if (!cryptoAdapter) throw Error('missing cryptoAdapter');

    const MasterKeyRepository = {};
    const storage = sessionStorage;
    const MASTER_KEY_KEY = '_taina_master-key';

    MasterKeyRepository.getKey = function() {
      let key = storage.getItem(MASTER_KEY_KEY);
      if (key) {
        return Promise.resolve(key);
      } else {
        return Promise.reject('Master key not found. Generate new.');
      }
    };

    MasterKeyRepository.generateKey = function(password) {
      return saltRepository.findOrCreate().then(function(salt) {
        return cryptoAdapter.generateHashFromPassword(password, salt);
      });
    };

    MasterKeyRepository.saveKey = function(password) {
      return MasterKeyRepository.generateKey(password).then(function(key) {
        storage.setItem(MASTER_KEY_KEY, key);
        return key;
      });
    };

    return MasterKeyRepository;
  };

  return module;
})();
