/**
 * Copyright 2017 Joe Gaska
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
  'use strict';

  var sftp = require('ssh2').Client;
  var fs = require('fs');

  function SFtpNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    this.options = {
      'host': n.host || 'localhost',
        'port': n.port || 22,
        'username': n.user,
        'password': n.password,
        'algorithms': {
            hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1', 'hmac-sha1-96'],
            cipher: ['aes256-cbc']
        }
    };
  }

  RED.nodes.registerType('sftp', SFtpNode);

  function SFtpInNode(n) {
    RED.nodes.createNode(this, n);
    this.sftp = n.sftp;
    this.operation = n.operation;
    this.filename = n.filename;
    this.localFilename = n.localFilename;
    this.workdir = n.workdir;
    this.savedir = n.savedir;
    this.sftpConfig = RED.nodes.getNode(this.sftp);

    if (this.sftpConfig) {
      var node = this;
      node.on('input', function (msg) {
        try {
          var conn = new sftp();
          var filename = node.filename || msg.filename || '';
          var localFilename = node.localFilename || msg.localFilename;
          var workdir = node.workdir || msg.workdir || '';
          var savedir = node.savedir || msg.savedir || '';

          if (!localFilename) {
            localFilename = msg.payload ? new Buffer(msg.payload, 'utf8') : '';
          }

          this.sendMsg = function (err, result) {
            if (err) {
              node.error(err.toString());
              node.status({ fill: 'red', shape: 'ring', text: 'failed' });
            }
            node.status({});
            if (node.operation == 'get') {
              result.once('close', function() { conn.end(); });
              result.pipe(fs.createWriteStream(savedir + filename));
              msg.payload = 'Get operation successful. ' + savedir + filename;
            } else if (node.operation == 'put') {
              conn.end();
              msg.payload = 'Put operation successful.';
            } else {
              conn.end();
              msg.payload = result;
            }
            msg.filename = filename;
            msg.localFilename = localFilename;
            node.send(msg);
          };

          conn.on('ready', function () {
            switch (node.operation) {
              case 'list':
                  conn.readdir(workdir, node.sendMsg);
                // conn.list(workdir, node.sendMsg);
                break;
              case 'get':
                conn.get(workdir + filename, node.sendMsg);
                break;
              case 'put':
                conn.put(localFilename, filename, node.sendMsg);
                break;
              case 'delete':
                conn.delete(filename, node.sendMsg);
                break;
            }
          });
          
          conn.on('error', function(error) {
            node.error(error);
          });

          conn.connect(node.sftpConfig.options);

      } catch (error) {
          node.error(error);
      }
    });
    } else {
      this.error('missing sftp configuration');
    }
  }
  RED.nodes.registerType('sftp in', SFtpInNode);
};
