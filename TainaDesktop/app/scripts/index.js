'use strict';

let cryptoService = CryptoService.create();
let saltRepository = SaltRepository.create(cryptoService);
let masterKeyRepository = MasterKeyRepository.create(saltRepository, cryptoService);

let key = null;

masterKeyRepository.saveKey('qwerty').then(function(_key) {
  key = _key;
  return cryptoService.encrypt('Hello World!!', key);
}).then(function(dataWithIV) {
  console.log(dataWithIV);
  return cryptoService.decrypt(dataWithIV.data, key, dataWithIV.iv);
}).then(function(openText) {
  console.log(openText);
});
