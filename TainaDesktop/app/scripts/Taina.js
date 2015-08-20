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

    Taina.showNote = function(id) {};

    return Taina;
  };

  return module;
})();
