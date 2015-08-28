'use strict';

const Promise = window.require('bluebird');
const _ = window.require('lodash');

/**
 * create MasterKeyRepository object
 * @param  {SaltRepository} saltRepository
 * @param  {CryptoAdapter} cryptoAdapter
 * @return {MasterKeyRepository}
 */
module.exports.create = function(saltRepository, cryptoAdapter) {
  if (!saltRepository) throw Error('MasterKeyRepository: mising SaltRepository dependency');
  if (!cryptoAdapter) throw Error('MasterKeyRepository: missing CryptoAdapter dependency');

  const MasterKeyRepository = {};
  const storage = sessionStorage;

  /**
   * Key in the secure storage for masterKey value
   * @const
   * @type {String}
   */
  const MASTER_KEY_KEY = '_taina_master-key';

  /**
   * @method getKey
   * @description load master key from secter storage. Raise error if not found.
   * @return {Promise} secret master key as string
   */
  MasterKeyRepository.getKey = function() {
    let key = storage.getItem(MASTER_KEY_KEY);
    if (key) {
      return Promise.resolve(key);
    } else {
      return Promise.reject('Master key not found. Generate new.');
    }
  };

  /**
   * @method generateKey
   * @description generate master key from password with random generated or founded in storage salt
   * @see module:SaltRepository
   * @param  {string} password
   * @return {Promise} master key
   */
  MasterKeyRepository.generateKey = function(password) {
    return saltRepository.findOrCreate().then(function(salt) {
      return cryptoAdapter.generateHashFromPassword(password, salt);
    });
  };

  MasterKeyRepository.validatePassword = function(password) {
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_PASSWORD_LENGTH = 256;

    if (typeof password !== 'string') {
      return Promise.reject('Password should be string');
    }

    if (_.isEmpty(password)) {
      return Promise.reject('Password can not be empty');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return Promise.reject('Password length should be more than ' + MIN_PASSWORD_LENGTH);
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return Promise.reject('Password length should be less than ' + MAX_PASSWORD_LENGTH);
    }

    return Promise.resolve(null);
  };

  /**
   * @method saveKey
   * @description generate key and save in secure storage
   * @see generateKey
   * @param  {string} password
   * @return {Promise} master key
   */
  MasterKeyRepository.saveKey = function(password) {
    return MasterKeyRepository.validatePassword(password).then(function(){
      return MasterKeyRepository.generateKey(password);
    }).then(function(key) {
      storage.setItem(MASTER_KEY_KEY, key);
      return key;
    });
  };

  return MasterKeyRepository;
};
