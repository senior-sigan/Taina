'use strict';

/**
 * Adapter over nodejs Crypto service.
 * Contain all setings for cryptographic algorithms, key's size.
 * @module CryptoAdapter
 **/

const Promise = window.require('bluebird');
const Crypto = Promise.promisifyAll(window.require('crypto'));

/**
 * create CryptoAdapter object
 * @return {CryptoAdapter}
 */
module.exports.create = function() {
  const CryptoAdapter = {};

  const HASH_ALGORITHM = 'sha1';
  const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  const SALT_SIZE = 256;
  const IV_SIZE = 16;

  /**
   * @method generateHashFromPassword
   * @param  {string} password
   * @param  {string} hSalt - salt as string in hex format
   * @return {Promise} password hash with salt as string in hex format
   */
  CryptoAdapter.generateHashFromPassword = function(password, hSalt) {
    let bSalt = new Buffer(hSalt, 'hex');
    return Crypto.pbkdf2Async(password, bSalt, 4096, 32, HASH_ALGORITHM).then(function(hash) {
      return hash.toString('hex');
    });
  };

  /**
   * @method generateSalt
   * @return {Promise} salt as string in hex format
   */
  CryptoAdapter.generateSalt = function() {
    return Crypto.randomBytesAsync(SALT_SIZE).then(function(salt) {
      return salt.toString('hex');
    });
  };

  /**
   * @method encrypt
   * @param  {string} data - open data
   * @param  {string} hKey - encryption key in hex format
   * @return {Promise} object with encrypted data as string in hex format
   *                          and initialization vector as string in hex format
   */
  CryptoAdapter.encrypt = function(data, hKey) {
    let bKey = new Buffer(hKey, 'hex');
    return Crypto.randomBytesAsync(IV_SIZE).then(function(iv) {
      let cipher = Crypto.createCipheriv(ENCRYPTION_ALGORITHM, bKey, iv);
      let enc = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');

      return {
        data: enc,
        iv: iv.toString('hex')
      };
    });
  };

  /**
   * @method decrypt
   * @param  {string} data - encrypted data in hex format
   * @param  {string} hIv  - initialization vector for encryption algorithm in hex format
   * @param  {string} hKey - key in hex format
   * @return {Promise} open data as string
   */
  CryptoAdapter.decrypt = function(data, hIv, hKey) {
    let bKey = new Buffer(hKey, 'hex');
    let bIv = new Buffer(hIv, 'hex');

    let decipher = Crypto.createDecipheriv(ENCRYPTION_ALGORITHM, bKey, bIv);
    let dec = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');

    return Promise.resolve(dec);
  };

  return CryptoAdapter;
};
