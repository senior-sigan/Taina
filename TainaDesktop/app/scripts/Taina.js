'use strict';

/**
 * Main module that used as interface to the all application.
 * @module Taina
 */

const Promise = window.require('bluebird');
const _ = window.require('lodash');
const logger = window.require('winston');

/**
 * create Taina object
 * @param  {CryptoService} cryptoService
 * @param  {DB} db
 * @return {Taina}
 */
module.exports.create = function(cryptoService, db) {
  if (!cryptoService) throw new Error('Taina: missing CryptoService dependecy');
  if (!db) throw new Error('Taina: missing DataBase dependency');
  const Taina = {};

  /**
   * @method getNotes
   * @description get array of all notes. All data exept body is open. Body is encrypted.
   * @return {Promise} array of notes
   */
  Taina.getNotes = function() {
    return db.getAllNotes();
  };

  /**
   * @method addNote
   * @description create new note
   * @param  {string} title - this will be stored as open text
   * @param  {string} body - this will be encrypted
   * @return {Promise}
   */
  Taina.addNote = function(title, body) {
    return cryptoService.encrypt(body).then(function(encryptedBody) {
      return db.addNote({
        title: title,
        body: encryptedBody
      });
    });
  };

  /**
   * editNote
   * @param  {string} id
   * @param  {object} note
   * @param  {string} note.title
   * @param  {string} note.body
   * @return {Promise}
   */
  Taina.editNote = function(id, note) {
    if (!_.isObject(note)) {
      return Promise.reject('Note argument should be object');
    }
    if (!note.title || !note.body) {
      logger.info('Taina.editNote - nothing to update');
      return Promise.resolve(null);
    }

    return Taina.showNote(id).then(function() {
      if (note.body) {
        return cryptoService.encrypt(note.body);
      } else {
        return null;
      }
    }).then(function(encryptedBody) {
      return db.editNote(id, {
        title: note.title,
        body: encryptedBody
      });
    });
  };

  /**
   * @method showNote
   * @description find note in DB by id and decrypt it
   * @param  {string} id
   * @return {Promise} decrypted note
   */
  Taina.showNote = function(id) {
    let note = {};
    return db.getNote(id).then(function(_note) {
      note = _note.data;
      return cryptoService.decrypt(note.body);
    }).then(function(body) {
      return {
        _id: id,
        title: note.title,
        body: body
      };
    });
  };

  return Taina;
};
