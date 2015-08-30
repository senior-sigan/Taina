'use strict';


import PromiseA from 'bluebird';

/**
 * create SaltRepository object
 * @param  {CryptoAdapter} cryptoAdapter
 * @return {SaltRepository}
 */
module.exports.create = function(cryptoAdapter) {
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
   * @return {PromiseA} salt as string
   */
  SaltRepository.findOrCreate = function() {
    let salt = storage.getItem(SALT_KEY);

    if (!salt) {
      return cryptoAdapter.generateSalt().then(salt => {
        storage.setItem(SALT_KEY, salt);
        return salt;
      });
    } else {
      return PromiseA.resolve(salt);
    }
  };

  return SaltRepository;
};
