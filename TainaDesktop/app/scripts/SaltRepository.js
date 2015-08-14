'use strict';

window.SaltRepository = (function() {
  const Promise = require('bluebird');
  const module = {};

  module.create = function(cryptoService) {
    if (!cryptoService) {
      throw Error('missing cryptoService');
    }

    const SaltRepository = {};
    const storage = localStorage;
    const SALT_KEY = '_taina_salt';

    SaltRepository.findOrCreate = function() {
      let salt = storage.getItem(SALT_KEY);

      if (!salt) {
        return cryptoService.generateSalt().then(function(salt) {
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
