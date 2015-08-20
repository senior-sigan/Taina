'use strict';

window.CryptoService = (function() {
  const module = {};

  /**
   * create CryptoService object
   * @param  {MasterKeyRepository} masterKeyRepository
   * @param  {CryptoAdapter} cryptoAdapter
   * @return {CryptoService}
   */
  module.create = function(masterKeyRepository, cryptoAdapter) {
    if (!masterKeyRepository) throw new Error('CryptoService: missing MasterKeyRepository dependency');
    if (!cryptoAdapter) throw new Error('CryptoService: missing CryptoAdapter dependency');
    const CryptoService = {};

    /**
     * @method encrypt
     * @description encrypt data with key stored in MasterKeyRepository
     * @param  {string} data - open data as string
     * @return {Promise} encrypted data as string in hex format
     */
    CryptoService.encrypt = function(data) {
      return masterKeyRepository.getKey().then(function(key) {
        return cryptoAdapter.encrypt(data, key);
      });
    };

    /**
     * @method decrypt
     * @description decrypt data with key stored in MasterKeyRepository
     * @param  {string} data - encrypted data as string in hex format
     * @return {Promise} open data as string
     */
    CryptoService.decrypt = function(data) {
      return masterKeyRepository.getKey().then(function(key) {
        return cryptoAdapter.decrypt(data.data, data.iv, key);
      });
    };

    return CryptoService;
  };

  return module;
})();
