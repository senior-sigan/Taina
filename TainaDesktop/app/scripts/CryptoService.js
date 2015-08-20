'use strict';

window.CryptoService = (function() {
  const module = {};

  module.create = function(masterKeyRepository, cryptoAdapter) {
    const CryptoService = {};

    CryptoService.encrypt = function(data) {
      return masterKeyRepository.getKey().then(function(key) {
        return cryptoAdapter.encrypt(data, key);
      });
    };

    CryptoService.decrypt = function(data) {
      return masterKeyRepository.getKey().then(function(key) {
        return cryptoAdapter.decrypt(data.data, data.iv, key);
      });
    };

    return CryptoService;
  };

  return module;
})();
