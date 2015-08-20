'use strict';

window.CryptoService = (function() {
  const module = {};

  module.create = function(masterKeyRepository, cryptoAdapter) {
    const CryptoService = {};

    CryptoService.encrypt = function(data) {};

    CryptoService.decrypt = function(data) {};

    return CryptoService;
  };

  return module;
})();
