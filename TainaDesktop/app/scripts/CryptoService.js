'use strict';

import logger from 'winston';

/**
 * create CryptoService object
 * @param  {MasterKeyRepository} masterKeyRepository
 * @param  {CryptoAdapter} cryptoAdapter
 * @return {CryptoService}
 */
module.exports.create = function(masterKeyRepository, cryptoAdapter) {
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
    return masterKeyRepository.getKey().then(key => cryptoAdapter.encrypt(data, key));
  };

  /**
   * @method decrypt
   * @description decrypt data with key stored in MasterKeyRepository
   * @param  {object} data
   * @param  {string} data.data - encrypted data as string in hex format
   * @param  {string} data.iv - initialization vector for aes-256
   * @return {Promise} open data as string
   */
  CryptoService.decrypt = function(data) {
    if (!data || !data.data || !data.iv) {
      logger.warn('CryptoService.decrypt - input data is empty');
      return null;
    }
    return masterKeyRepository.getKey().then(key => cryptoAdapter.decrypt(data.data, data.iv, key));
  };

  return CryptoService;
};
