'use strict';

window.CryptoService = (function() {
  const Promise = require('bluebird');
  const Crypto = Promise.promisifyAll(require('crypto'));
  const HASH_ALGORITHM = 'sha1';
  const SALT_SIZE = 256;
  let module = {};

  module.create = function() {
    let CryptoService = {};

    CryptoService.generateHashFromPassword = function(password, salt) {
      return Crypto.pbkdf2Async(password, salt, 4096, 32, HASH_ALGORITHM);
    };

    CryptoService.generateSalt = function() {
      return Crypto.randomBytesAsync(SALT_SIZE);
    };

    return CryptoService;
  };

  return module;
})();
