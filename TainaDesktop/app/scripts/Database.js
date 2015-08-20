'use strict';

window.DB = (function(PouchDB) {
  const logger = require('winston');
  const _ = require('lodash');
  const module = {};

  module.create = function() {
    const DB = {};
    const Notes = new PouchDB('notes', {adapter: 'idb'});
    const Passwords = new PouchDB('passwords', {adapter: 'idb'});

    DB.getAllNotes = function() {
      return Notes.allDocs({
        'include_docs': true,
        attachments: true
      }).then(function(result) {
        return _.map(result.rows, function(row) {
          let note = row.doc;

          return {
            _id: note._id,
            title: note.title,
            body: note.body
          };
        });
      }).catch(function(err) {
        logger.error('Database#getAllNotes: %s', JSON.stringify(err, null, ' '));
      });
    };

    DB.addNote = function(note) {
      return Notes.post(note).then(function(result) {
        logger.debug(JSON.stringify(result, null, ' '));
      }).catch(function(err) {
        logger.error(
          'Database#addNote(%s): %s',
          JSON.stringify(note, null, ' '),
          JSON.stringify(err, null, ' ')
        );
      });
    };

    DB.getNote = function(id) {
      return Notes.get(id, {attachments: true}).then(function(note) {
        logger.debug(JSON.stringify(note, null, ' '));
        return note;
      });
    };

    DB.getAllPasswords = function() {
      return Promise.reject('NOT IMPLEMENTED: DB.getAllPasswords');
    };

    return DB;
  };

  return module;
})(window.PouchDB);
