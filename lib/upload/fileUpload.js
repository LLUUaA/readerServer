
const fs = require('fs'),
    util = require('util'),
    logger = require('../logger'),
    MultipartParser = require('./multipart_parser').MultipartParser,
    EventEmitter = require('events'),
    Stream = require('stream'),
    crypto = require('crypto'),
    StringDecoder = require('string_decoder').StringDecoder,
    path = require('path'),
    File = require('./file');

function getConfig(cfg = {}) {
    //无效
    return Object.assign({
        limitSize: 1073741824,//文件上传大小限制1073741824b = 1Gb
        tempPath: 'temp',//存储分片路径
        savePath: process.cwd() + '/upload',//文件保存路径
        isChunk: true//是否分片
    }, cfg)
}

function Upload(cfg={}) {
    if (!(this instanceof Upload)) return new Upload(cfg);

    EventEmitter.call(this);

    this.error = null;
    this.ended = false;

    this.isChunk = cfg.isChunk || true;//是否分片上传
    this.maxFields = cfg.maxFields || 1000;
    this.maxFieldsSize = cfg.maxFieldsSize || 200 * 1024 * 1024;//最大尺寸
    this.maxFileSize = cfg.maxFileSize || 2000 * 1024 * 1024;//最大允许文件大小
    this.keepExtensions = cfg.keepExtensions || true;//是否显示文件后缀
    this.uploadDir = cfg.uploadDir || (process.cwd && process.cwd())+'/upload' ;//上传地址
    this.encoding = cfg.encoding || 'utf-8';//编码格式
    this.headers = null;
    this.type = null;
    this.hash = cfg.hash || false;
    this.multiples = cfg.multiples || false;
  
    this.bytesReceived = null;
    this.bytesExpected = null;
  
    this._parser = null;
    this._flushing = 0;
    this._fieldsSize = 0;
    this._fileSize = 0;
    this.openedFiles = [];
}

util.inherits(Upload, EventEmitter);
module.exports = Upload;


Upload.prototype.write = function(buffer) {
    if (this.error) {
      return;
    }
    if (!this._parser) {
      this._error(new Error('uninitialized parser'));
      return;
    }
  
    this.bytesReceived += buffer.length;
    this.emit('progress', this.bytesReceived, this.bytesExpected);
  
    var bytesParsed = this._parser.write(buffer);
    if (bytesParsed !== buffer.length) {
      this._error(new Error('parser error, '+bytesParsed+' of '+buffer.length+' bytes parsed'));
    }
  
    return bytesParsed;
  };

Upload.prototype._parseContentLength = function() {
  this.bytesReceived = 0;
  if (this.headers['content-length']) {
    this.bytesExpected = parseInt(this.headers['content-length'], 10);
  } else if (this.headers['transfer-encoding'] === undefined) {
    this.bytesExpected = 0;
  }

  if (this.bytesExpected !== null) {
    this.emit('progress', this.bytesReceived, this.bytesExpected);
  }
};

Upload.prototype._parseContentType = function() {
  if (this.bytesExpected === 0) {
    this._parser = dummyParser(this);
    return;
  }

  if (!this.headers['content-type']) {
    this._error(new Error('bad content-type header, no content-type'));
    return;
  }

  if (this.headers['content-type'].match(/octet-stream/i)) {
    this._initOctetStream();
    return;
  }

  if (this.headers['content-type'].match(/urlencoded/i)) {
    this._initUrlencoded();
    return;
  }

  if (this.headers['content-type'].match(/multipart/i)) {
    var m = this.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (m) {
      this._initMultipart(m[1] || m[2]);
    } else {
      this._error(new Error('bad content-type header, no multipart boundary'));
    }
    return;
  }

  if (this.headers['content-type'].match(/json/i)) {
    this._initJSONencoded();
    return;
  }

  this._error(new Error('bad content-type header, unknown content-type: '+this.headers['content-type']));
};

Upload.prototype._initUrlencoded = function() {
  this.type = 'urlencoded';

  var parser = new QuerystringParser(this.maxFields)
    , self = this;

  parser.onField = function(key, val) {
    self.emit('field', key, val);
  };

  parser.onEnd = function() {
    self.ended = true;
    self._maybeEnd();
  };
}

/**
 * @function _initMultipart
 * @description 初始化 Multipart
 */
Upload.prototype._initMultipart = function(boundary) {
    this.type = 'multipart';
  
    var parser = new MultipartParser(),
        self = this,
        headerField,
        headerValue,
        part;
  
    parser.initWithBoundary(boundary);
  
    parser.onPartBegin = function() {
      part = new Stream();
      part.readable = true;
      part.headers = {};
      part.name = null;
      part.filename = null;
      part.mime = null;
  
      part.transferEncoding = 'binary';
      part.transferBuffer = '';
  
      headerField = '';
      headerValue = '';
    };
  
    parser.onHeaderField = function(b, start, end) {
      headerField += b.toString(self.encoding, start, end);
    };
  
    parser.onHeaderValue = function(b, start, end) {
      headerValue += b.toString(self.encoding, start, end);
    };
  
    parser.onHeaderEnd = function() {
      headerField = headerField.toLowerCase();
      part.headers[headerField] = headerValue;
  
      // matches either a quoted-string or a token (RFC 2616 section 19.5.1)
      var m = headerValue.match(/\bname=("([^"]*)"|([^\(\)<>@,;:\\"\/\[\]\?=\{\}\s\t/]+))/i);
      if (headerField == 'content-disposition') {
        if (m) {
          part.name = m[2] || m[3] || '';
        }
  
        part.filename = self._fileName(headerValue);
      } else if (headerField == 'content-type') {
        part.mime = headerValue;
      } else if (headerField == 'content-transfer-encoding') {
        part.transferEncoding = headerValue.toLowerCase();
      }
  
      headerField = '';
      headerValue = '';
    };
  
    parser.onHeadersEnd = function() {
      switch(part.transferEncoding){
        case 'binary':
        case '7bit':
        case '8bit':
        parser.onPartData = function(b, start, end) {
        //   console.log('onPartData11',start,end);
          part.emit('data', b.slice(start, end));
        };
  
        parser.onPartEnd = function() {
          part.emit('end');
        };
        break;
  
        case 'base64':
        parser.onPartData = function(b, start, end) {
          part.transferBuffer += b.slice(start, end).toString('ascii');

          /*
          four bytes (chars) in base64 converts to three bytes in binary
          encoding. So we should always work with a number of bytes that
          can be divided by 4, it will result in a number of buytes that
          can be divided vy 3.
          */
          var offset = parseInt(part.transferBuffer.length / 4, 10) * 4;
          part.emit('data', new Buffer(part.transferBuffer.substring(0, offset), 'base64'));
          part.transferBuffer = part.transferBuffer.substring(offset);
        };
  
        parser.onPartEnd = function() {
          part.emit('data', new Buffer(part.transferBuffer, 'base64'));
          part.emit('end');
        };
        break;
  
        default:
        return self._error(new Error('unknown transfer-encoding'));
      }
  
      // self.onPart(part);

      self.handlePart(part);
    };
  
  
    parser.onEnd = function() {
      self.ended = true;
      self._maybeEnd();
    };
  
    this._parser = parser;
  };

  Upload.prototype._initOctetStream = function() {
    this.type = 'octet-stream';
    var filename = this.headers['x-file-name'];
    var mime = this.headers['content-type'];
  
    var file = new File({
      path: this._uploadPath(filename),
      name: filename,
      type: mime
    });
  
    this.emit('fileBegin', filename, file);
    file.open();
    this.openedFiles.push(file);
    this._flushing++;
  
    var self = this;
  
    self._parser = new OctetParser();
  
    //Keep track of writes that haven't finished so we don't emit the file before it's done being written
    var outstandingWrites = 0;
  
    self._parser.on('data', function(buffer){
      self.pause();
      outstandingWrites++;
  
      file.write(buffer, function() {
        outstandingWrites--;
        self.resume();
  
        if(self.ended){
          self._parser.emit('doneWritingFile');
        }
      });
    });
  
    self._parser.on('end', function(){
      self._flushing--;
      self.ended = true;
  
      var done = function(){
        file.end(function() {
          self.emit('file', 'file', file);
          self._maybeEnd();
        });
      };
  
      if(outstandingWrites === 0){
        done();
      } else {
        self._parser.once('doneWritingFile', done);
      }
    });
  };

  Upload.prototype.pause = function() {

    // this does nothing, unless overwritten in Upload.parse
    return false;
  };
  
  Upload.prototype.resume = function() {
    // this does nothing, unless overwritten in Upload.parse
    return false;
  };

  Upload.prototype._error = function(err) {
    if (this.error || this.ended) {
      return;
    }
  
    this.error = err;
    this.emit('error', err);
  
    if (Array.isArray(this.openedFiles)) {
      this.openedFiles.forEach(function(file) {
        file._writeStream.destroy();
        setTimeout(fs.unlink, 0, file.path, function(error) { });
      });
    }
  };

  Upload.prototype._maybeEnd = function() {
    if (!this.ended || this._flushing || this.error) {
      return;
    }
  
    this.emit('end');
  };

/**
 * @function handlePart
 * @description 处理上传
 */
  
  Upload.prototype.handlePart = function(part) {
    var self = this;
  
    // This MUST check exactly for undefined. You can not change it to !part.filename.
    if (part.filename === undefined) {
      var value = ''
        , decoder = new StringDecoder(this.encoding);
  
      part.on('data', function(buffer) {
        self._fieldsSize += buffer.length;
        if (self._fieldsSize > self.maxFieldsSize) {
          self._error(new Error('maxFieldsSize exceeded, received '+self._fieldsSize+' bytes of field data'));
          return;
        }
        value += decoder.write(buffer);
      });
  
      part.on('end', function() {
        self.emit('field', part.name, value);
      });
      return;
    }
  
    this._flushing++;
  
    var file = new File({
      path: this._uploadPath(part.filename),
      name: part.filename,
      type: part.mime,
      hash: self.hash
    });
  
    this.emit('fileBegin', part.name, file);
  
    file.open();
    this.openedFiles.push(file);
  
    part.on('data', function(buffer) {
      self._fileSize += buffer.length;
      if (self._fileSize > self.maxFileSize) {
        self._error(new Error('maxFileSize exceeded, received '+self._fileSize+' bytes of file data'));
        return;
      }
      if (buffer.length == 0) {
        return;
      }
      self.pause();
      file.write(buffer, function() {
        self.resume();
      });
    });
  
    part.on('end', function() {
      file.end(function() {
        self._flushing--;
        self.emit('file', part.name, file);
        self._maybeEnd();
      });
    });
  };

  Upload.prototype.parse = function(req, cb) {
    this.pause = function() {
      try {
        req.pause();
      } catch (err) {
        // the stream was destroyed
        if (!this.ended) {
          // before it was completed, crash & burn
          this._error(err);
        }
        return false;
      }
      return true;
    };
  
    this.resume = function() {
      try {
        req.resume();
      } catch (err) {
        // the stream was destroyed
        if (!this.ended) {
          // before it was completed, crash & burn
          this._error(err);
        }
        return false;
      }
  
      return true;
    };
  
    // Setup callback first, so we don't miss anything from data events emitted
    // immediately.
    if (cb) {
      var fields = {}, files = {};
      this
        .on('field', function(name, value) {
          fields[name] = value;
        })
        .on('file', function(name, file) {
          if (this.multiples) {
            if (files[name]) {
              if (!Array.isArray(files[name])) {
                files[name] = [files[name]];
              }
              files[name].push(file);
            } else {
              files[name] = file;
            }
          } else {
            files[name] = file;
          }
        })
        .on('error', function(err) {
          cb(err, fields, files);
        })
        .on('end', function() {
          cb(null, fields, files);
        });
    }
  
    // Parse headers and setup the parser, ready to start listening for data.

    this.headers = req.headers;
    this._parseContentLength();
    this._parseContentType();
  
    // Start listening for data.
    var self = this;
    req
      .on('error', function(err) {
        self._error(err);
      })
      .on('aborted', function() {
        self.emit('aborted');
        self._error(new Error('Request aborted'));
      })
      .on('data', function(buffer) {
        console.log('Recive buffer',buffer.length);
        self.write(buffer);
      })
      .on('end', function() {
        if (self.error) {
          return;
        }
  
        var err = self._parser.end();
        if (err) {
          self._error(err);
        }
      });
  
    return this;
  };

  Upload.prototype._fileName = function(headerValue) {
    // matches either a quoted-string or a token (RFC 2616 section 19.5.1)
    var m = headerValue.match(/\bfilename=("(.*?)"|([^\(\)<>@,;:\\"\/\[\]\?=\{\}\s\t/]+))($|;\s)/i);
    if (!m) return;
  
    var match = m[2] || m[3] || '';
    var filename = match.substr(match.lastIndexOf('\\') + 1);
    filename = filename.replace(/%22/g, '"');
    filename = filename.replace(/&#([\d]{4});/g, function(m, code) {
      return String.fromCharCode(code);
    });
    return filename;
  };

  
Upload.prototype._uploadPath = function (filename) {
  var buf = crypto.randomBytes(16);
  var name = 'upload_' + buf.toString('hex');
  if (this.keepExtensions) {
    var ext = path.extname(filename);
    ext = ext.replace(/(\.[a-z0-9]+).*/i, '$1');
    name += ext;
  }
  return path.join(this.uploadDir, name);
};