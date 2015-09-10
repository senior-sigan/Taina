import PromiseA from 'bluebird';

/**
 * @module SaltRepository
 */

/**
 * create SaltRepository object
 * @param  {CryptoAdapter} cryptoAdapter
 * @return {SaltRepository}
 */
module.exports.create = (cryptoAdapter) => {
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
  SaltRepository.findOrCreate = () => {
    const salt = storage.getItem(SALT_KEY);

    if (salt) {
      return PromiseA.resolve(salt);
    }

    return cryptoAdapter.generateSalt().then(_salt => {
      storage.setItem(SALT_KEY, _salt);
      return _salt;
    });
  };

  SaltRepository.isEmpty = () => {
    return !storage.getItem(SALT_KEY);
  };

  return SaltRepository;
};
