/**
 * Main module that used as interface to the all application.
 * @module Taina
 */

import PromiseA from 'bluebird';
import _ from 'lodash';
import logger from 'winston';

/**
 * create Taina object
 * @param  {CryptoService} cryptoService
 * @param  {DB} db
 * @return {Taina}
 */
module.exports.create = (cryptoService, db, saltRepository, masterKeyRepository, sync) => {
  if (!cryptoService) throw new Error('Taina: missing CryptoService dependecy');
  if (!db) throw new Error('Taina: missing DataBase dependency');
  if (!saltRepository) throw new Error('Taina: missing saltRepository dependency');
  if (!masterKeyRepository) throw new Error('Taina: missing masterKeyRepository dependency');
  if (!sync) throw new Error('Taina: missing sync dependency');
  const Taina = {};

  /**
   * @method getNotes
   * @description get array of all notes. All data exept body is open. Body is encrypted.
   * @return {PromiseA} array of notes
   */
  Taina.getNotes = () => {
    return db.getAllNotes();
  };

  /**
   * @method addNote
   * @description create new note
   * @param  {string} title - this will be stored as open text
   * @param  {string} body - this will be encrypted
   * @return {PromiseA}
   */
  Taina.addNote = (title, body) => {
    return cryptoService.encrypt(body).then(encryptedBody => {
      return db.addNote({
        title: title,
        body: encryptedBody,
      });
    });
  };

  /**
   * editNote
   * @param  {string} id
   * @param  {object} note
   * @param  {string} note.title
   * @param  {string} note.body
   * @return {PromiseA}
   */
  Taina.editNote = (id, note) => {
    if (!_.isObject(note)) {
      return PromiseA.reject('Note argument should be object');
    }
    if (!note.title && !note.body) {
      logger.info('Taina.editNote - nothing to update');
      return PromiseA.resolve(null);
    }

    return Taina.showNote(id).then(() => {
      if (note.body) cryptoService.encrypt(note.body);
    }).then(encryptedBody => {
      return db.editNote(id, {
        title: note.title,
        body: encryptedBody,
      });
    });
  };

  /**
   * @method showNote
   * @description find note in DB by id and decrypt it
   * @param  {string} id
   * @return {PromiseA} decrypted note
   */
  Taina.showNote = (id) => {
    let note = {};
    return db.getNote(id).then(_note => {
      note = _note.data;
      return cryptoService.decrypt(note.body);
    }).then(body => {
      return {
        _id: id,
        title: note.title,
        body: body,
      };
    });
  };

  Taina.clearAll = () => {
    return PromiseA.join(saltRepository.clear(), masterKeyRepository.clear(), db.drop());
  };

  Taina.initFromScratch = () => {
    return saltRepository.findOrCreate();
  };

  Taina.initFromRemote = (serviceName) => {
    return sync.getSalt(serviceName).then(salt => {
      if (salt) {
        saltRepository.save(salt);
      } else {
        throw new Error('Remote service has no data');
      }
    });
  };

  Taina.login = (password) => {
    return masterKeyRepository.saveKey(password).then(key => {
      cryptoService
    });
  };

  return Taina;
};
