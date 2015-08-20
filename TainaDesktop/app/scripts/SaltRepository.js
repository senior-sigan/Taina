'use strict';

window.SaltRepository = (function() {
  const Promise = require('bluebird');
  const module = {};

  /**
   * create SaltRepository object
   * @param  {CryptoAdapter} cryptoAdapter
   * @return {SaltRepository}
   */
  module.create = function(cryptoAdapter) {
    if (!cryptoAdapter) throw Error('SaltRepository: missing CryptoAdapter dependency');

    const SaltRepository = {};
    const storage = localStorage;

    /**
     * Key in the storage for salt value
     * @const
     * @type {String}
     */
    const SALT_KEY = '_taina_salt';

    /**
     * @method findOrCreate
     * @description find salt in repository or randomly generate new one
     * @return {Promise} salt as string
     */
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
