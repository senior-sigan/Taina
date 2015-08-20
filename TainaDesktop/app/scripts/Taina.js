'use strict';

window.Taina = (function() {
  const Promise = require('bluebird');
  const module = {};

  module.create = function(cryptoService, db) {
    const Taina = {};

    Taina.getNotes = function() {
      return db.getAllNotes();
    };

    Taina.addNote = function(title, body) {
      return cryptoService.encrypt(body).then(function(encryptedBody) {
        return db.addNote({
          title: title,
          body: encryptedBody
        });
      });
    };

    Taina.showNote = function(id) {
      let note = {};
      return db.getNote(id).then(function(_note) {
        note = _note;
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

  return module;
})();
