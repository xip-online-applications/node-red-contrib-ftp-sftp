
# node-red-contrib-ftp-sftp by Harding Point

http://www.HardingPoint.com

A Node-RED node to FTP and SFTP Client. This is a work in progress but does work to list and put files. Please send log issues or email requests to Support@HardingPoint.com.
(https://github.com/HardingPoint/node-red-contrib-ftp-sftp)

Install
-------

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-ftp-sftp


SFTP
-------
PUT - Set msg.payload.filedata to the file contents you want pushed and will be uploaded to {GUID}.FileExtension. If you need more changes file request to github.

GET - Set msg.payload.filename to get the file or will use Workdir + Filename in configuration. Leave configuration blank to set in code.

DELETE - Set msg.payload.filename to delete the file or will use Workdir + Filename in configuration. Leave configuration blank to set in code.

LIST - Uses the workdir


Acknowledgements
----------------

The node-red-contrib-force uses the following open source software:

- [node-ftp-sftp] (https://github.com/HardingPoint/node-red-contrib-ftp-sftp): node-ftp is an FTP and SFTP client module for node.js that provides an asynchronous interface for communicating with an FTP and SFTP servers.

License
-------

See [license] (https://github.com/HardingPoint/node-red-contrib-ftp-sftp/blob/master/LICENSE) (Apache License Version 2.0).
