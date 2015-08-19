'use strict';

window.DB = (function(PouchDB) {
  const logger = require('winston');
  const module = {};

  module.create = function() {
    const DB = {};
    const Notes = new PouchDB('notes', {adapter: 'idb'});
    //const Passwords = new PouchDB('passwords', {adapter: 'idb'});

    DB.getAllNotes = function() {
      return Notes.allDocs({
        'include_docs': true,
        attachments: true
      }).then(function(result) {
        console.log(result);
      }).catch(function(err) {
        logger.error('Database#getAllNotes: %s', JSON.stringify(err, null, ' '));
      });
    };

    DB.addNote = function(note) {
      return Notes.post(note).then(function(result) {
        console.log(result);
      }).catch(function(err) {
        logger.error(
          'Database#addNote(%s): %s',
          JSON.stringify(note, null, ' '),
          JSON.stringify(err, null, ' ')
        );
      });
    };

    DB.getAllPasswords = function() {

    };

    return DB;
  };

  return module;
})(window.PouchDB);
