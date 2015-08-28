'use strict';

window.DropboxSync = (function() {
  const Promise = require('bluebird');
  const winston = require('winston');
  const remote = require('remote');
  const BrowserWindow = remote.require('browser-window');
  const dbox  = require('dbox');
  const module = {};

  /**
   * create DropboxSync object
   * @param  {object} options
   * @param  {string} options.key
   * @param  {string} options.secret
   * @return {DropboxSync}
   */
  module.create = function(options) {
    const dboxApp = dbox.app({'app_key' : options.key, 'app_secret': options.secret});
    const DropboxSync = {};
    const browserConfig = {
      height: 600,
      width: 800,
      show: false,
      'node-integration': false,
      'web-preferences': {
        'web-security': true
      }
    };
    const storage = localStorage;
    const DB_KEY = '_taina_dropbox_access_token';

    /**
     * @method getToken
     * @description Load Dropbox access token from storage. Reject if not found
     * @return {Promise} accessToken
     */
    DropboxSync.getToken = Promise.method(function() {
      let accessToken = storage.getItem(DB_KEY);
      if (accessToken) {
        return JSON.parse(accessToken);
      } else {
        throw 'Dropbox accessToken not found. Get new one.';
      }
    });

    /**
     * @method startAuth
     * @description Open new window and start dropbox authentication. Save accessToken in storage.
     * @return {Promise} dropbox accessToken
     */
    DropboxSync.startAuth = function() {
      let authWindow = new BrowserWindow(browserConfig);
      authWindow.on('close', function() {
        authWindow = null;
      }, false);

      return new Promise(function(resolve, reject) {
        dboxApp.requesttoken(function(status, token) {
          if (status === 200) {
            authWindow.loadUrl(token.authorize_url);
            authWindow.show();
            authWindow.on('page-title-updated', function() {
              if (authWindow.getUrl() === 'https://www.dropbox.com/1/oauth/authorize_submit') {
                authWindow.close();
                dboxApp.accesstoken(token, function(status, accessToken) {
                  if (status === 200) {
                    storage.setItem(DB_KEY, JSON.stringify(accessToken));
                    winston.info('[DropboxSync] accessToken loaded');
                    resolve(accessToken);
                  } else {
                    winston.error('Can\'t get dropbox accessToken: %d, %s',
                      status, JSON.stringify(accessToken, null, ' '));
                    reject('[DropboxSync] can\t get accessToken: ' + status);
                  }
                });
              }
            });
          } else {
            winston.error('Can\'t start dropbox auth: %d, %s', status, JSON.stringify(token, null, ' '));
            reject('[DropboxSync] can\'t start auth: ' + status);
          }
        });
      });
    };

    return DropboxSync;
  };

  return module;
})();
