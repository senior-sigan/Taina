import PromiseA from 'bluebird';
import _ from 'lodash';
import logger from 'winston';

/**
 * create MasterKeyRepository object
 * @param  {SaltRepository} saltRepository
 * @param  {CryptoAdapter} cryptoAdapter
 * @return {MasterKeyRepository}
 */
module.exports.create = (saltRepository, cryptoAdapter) => {
  if (!saltRepository) throw Error('MasterKeyRepository: mising SaltRepository dependency');
  if (!cryptoAdapter) throw Error('MasterKeyRepository: missing CryptoAdapter dependency');

  const MasterKeyRepository = {};
  const storage = sessionStorage;
  const standardStorage = localStorage;

  /**
   * Key in the secure storage for masterKey value
   * @const
   * @type {String}
   */
  const MASTER_KEY_KEY = '_taina_master-key';

  /**
   * Key in the local storage for standardKey value.
   * Used to validate password.
   * @const
   * @type {String}
   */
  const STANDARD_KEY = '_taina_standard-key';

  /**
   * @method getKey
   * @description load master key from secter storage. Raise error if not found.
   * @return {PromiseA} secret master key as string
   */
  MasterKeyRepository.getKey = PromiseA.method(() => {
    const key = storage.getItem(MASTER_KEY_KEY);
    if (!key) {
      throw new Error('Master key not found. Generate new.');
    }

    return key;
  });

  MasterKeyRepository.isSet = () => !!storage.getItem(MASTER_KEY_KEY);

  /**
   * @method generateKey
   * @description generate master key from password with random generated or founded in storage salt
   * @see module:SaltRepository
   * @param  {string} password
   * @return {PromiseA} master key
   */
  MasterKeyRepository.generateKey = (password) => {
    return saltRepository.findOrCreate().then(salt => {
      return cryptoAdapter.generateHashFromPassword(password, salt);
    });
  };

  MasterKeyRepository.validatePassword = (password) => {
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_PASSWORD_LENGTH = 256;

    if (typeof password !== 'string') {
      return PromiseA.reject('Password should be string');
    }

    if (_.isEmpty(password)) {
      return PromiseA.reject('Password can not be empty');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return PromiseA.reject('Password length should be more than ' + MIN_PASSWORD_LENGTH);
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return PromiseA.reject('Password length should be less than ' + MAX_PASSWORD_LENGTH);
    }

    return PromiseA.resolve(null);
  };

  MasterKeyRepository.checkOrCreateStandard = PromiseA.method((key) => {
    const standard = JSON.parse(standardStorage.getItem(STANDARD_KEY));
    logger.info('Validating password');
    if (standard && standard.data && standard.iv) {
      logger.info(`Find standard ${standard.data}:${standard.iv}`);
      return cryptoAdapter.decrypt(standard.data, standard.iv, key).then(() => key);
    }

    logger.info('Generate new standard');
    return cryptoAdapter.generateSalt()
      .then(salt => cryptoAdapter.encrypt(salt, key))
      .then(data => standardStorage.setItem(STANDARD_KEY, JSON.stringify(data)))
      .then(() => key);
  });

  MasterKeyRepository.isEmpty = () => {
    return !standardStorage.getItem(STANDARD_KEY);
  };

  /**
   * @method saveKey
   * @description generate key and save in secure storage
   * @see generateKey
   * @param  {string} password
   * @return {PromiseA} master key
   */
  MasterKeyRepository.saveKey = (password) => {
    return MasterKeyRepository
      .validatePassword(password)
      .then(() => MasterKeyRepository.generateKey(password))
      .then(MasterKeyRepository.checkOrCreateStandard)
      .then(key => {
        storage.setItem(MASTER_KEY_KEY, key);
        return key;
      });
  };

  MasterKeyRepository.removeKey = PromiseA.method(() => {
    return storage.removeItem(MASTER_KEY_KEY);
  });

  MasterKeyRepository.clear = PromiseA.method(() => {
    logger.info('MasterKeyRepository has been cleared');
    standardStorage.removeItem(STANDARD_KEY);
    storage.removeItem(MASTER_KEY_KEY);
  });

  return MasterKeyRepository;
};
