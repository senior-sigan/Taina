'use strict';

window.SaltRepository = (function() {
  const Promise = require('bluebird');
  const module = {};

  module.create = function(cryptoAdapter) {
    if (!cryptoAdapter) {
      throw Error('missing cryptoAdapter');
    }

    const SaltRepository = {};
    const storage = localStorage;
    const SALT_KEY = '_taina_salt';

    SaltRepository.findOrCreate = function() {
      let salt = storage.getItem(SALT_KEY);

      if (!salt) {
        return cryptoAdapter.generateSalt().then(function(salt) {
          storage.setItem(SALT_KEY, salt);
          return salt;
        });
      } else {
        return Promise.resolve(salt);
      }
    };

    return SaltRepository;
  };

  return module;
})();
