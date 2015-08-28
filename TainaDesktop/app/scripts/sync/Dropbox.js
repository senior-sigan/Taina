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

    /**
     * @method startAuth
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
                    resolve(accessToken);
                  } else {
                    winston.error('Can\'t get dropbox accessToken: %d, %s', status, JSON.stringify(accessToken, null, ' '));
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
