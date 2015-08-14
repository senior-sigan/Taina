'use strict';

let cryptoService = CryptoService.create();
let saltRepository = SaltRepository.create(cryptoService);
let masterKeyRepository = MasterKeyRepository.create(saltRepository, cryptoService);

masterKeyRepository.saveKey('qwerty').then(function(key) {
  console.log(key.toString('hex'));
});
