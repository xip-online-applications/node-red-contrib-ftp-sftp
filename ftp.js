/**
 * Copyright 2015 Atsushi Kojo.
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
  var ftp = require('ftp');
  var fs = require('fs');

  function FtpNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    this.options = {
      'host': n.host || 'localhost',
      'port': n.port || 21,
      'secure': n.secure || false,
      'secureOptions': n.secureOptions,
      'user': n.user || 'anonymous',
      'password': n.password || 'anonymous@',
      'connTimeout': n.connTimeout || 10000,
      'pasvTimeout': n.pasvTimeout || 10000,
      'keepalive': n.keepalive || 10000
    };
  }

  RED.nodes.registerType('ftp', FtpNode);

  function FtpInNode(n) {
    RED.nodes.createNode(this, n);
    this.ftp = n.ftp;
    this.operation = n.operation;
    this.filename = n.filename;
    this.localFilename = n.localFilename;
    this.workdir = n.workdir;
    this.savedir = n.savedir;
    this.ftpConfig = RED.nodes.getNode(this.ftp);

    if (this.ftpConfig) {

      var node = this;

      node.on('input', function (msg) {
        try {
          
          var conn = new ftp();
        
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
                conn.list(workdir, node.sendMsg);
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

          conn.connect(node.ftpConfig.options);

      } catch (error) {
          node.error(error);
      }
    });
    } else {
      this.error('missing ftp configuration');
    }
  }
  RED.nodes.registerType('ftp in', FtpInNode);
}
