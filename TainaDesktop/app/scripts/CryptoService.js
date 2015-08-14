'use strict';

window.CryptoService = (function() {
  const Promise = require('bluebird');
  const Crypto = Promise.promisifyAll(require('crypto'));
  const HASH_ALGORITHM = 'sha1';
  const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  const SALT_SIZE = 256;
  const IV_SIZE = 16;
  let module = {};

  module.create = function() {
    let CryptoService = {};

    CryptoService.generateHashFromPassword = function(password, hSalt) {
      let bSalt = new Buffer(hSalt, 'hex');
      return Crypto.pbkdf2Async(password, bSalt, 4096, 32, HASH_ALGORITHM).then(function(hash) {
        return hash.toString('hex');
      });
    };

    CryptoService.generateSalt = function() {
      return Crypto.randomBytesAsync(SALT_SIZE).then(function(salt) {
        return salt.toString('hex');
      });
    };

    CryptoService.encrypt = function(data, hKey) {
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

    CryptoService.decrypt = function(data, hKey, hIv) {
      let bKey = new Buffer(hKey, 'hex');
      let bIv = new Buffer(hIv, 'hex');

      let decipher = Crypto.createDecipheriv(ENCRYPTION_ALGORITHM, bKey, bIv);
      let dec = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');

      return Promise.resolve(dec);
    };

    return CryptoService;
  };

  return module;
})();
