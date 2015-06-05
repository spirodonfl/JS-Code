(function () {
  //function AJAX() {}
  this.AJAX = function () {}

  this.AJAX.prototype.haveError = false;
  this.AJAX.prototype.errorMessage = '';
  this.AJAX.prototype.error = function ( message ) {
    var a = this;

    a.haveError = true;
    a.errorMessage = message;
  }

  this.AJAX.prototype.request = function ( options ) { //url, requestType, queryString, callback ) {
    var a = this;
    a.haveError = false;
    a.errorMessage = '';

    if ( options === undefined || typeof options !== 'object' ) {
      a.error( 'XHR Error: No options passed' );
      return false;
    } else if ( options.url === undefined || options.url === '' || options.url === 0 ) {
      a.error( 'XHR Error: No URL passed in the options...' );
      return false;
    } else if ( options.requestType === undefined || options.requestType === '' || options.requestType === 0 ) {
      a.error( 'XHR Error: No requestType passed in the options...' );
      return false;
    }

    if ( options.queryString === undefined || options.queryString === 0 ) {
      options.queryString = '';
    }

    if ( options.responseType === undefined || options.responseType === 0 ) {
      options.responseType = '';
      // options.responseType can be arraybuffer, blob, document, json, text
    }

    var ids = ["MSXML2.XmlHttp",
      "MSXML2.XmlHttp.5.0",
      "MSXML2.XmlHttp.4.0",
      "MSXML2.XmlHttp.3.0",
      "MSXML2.XmlHttp.2.0",
      "Microsoft.XmlHttp"], xhr;

    if ( window.XMLHttpRequest || typeof XMLHttpRequest !== undefined ) {
      xhr = new XMLHttpRequest();
    } else {
      for ( var i = 0; i < ids.length; i++ ) {
        try {
          xhr = new ActiveXObject( ids[i] );
          break;
        } catch ( e ) {
          console.log( 'XHR Error!', e );
          return false;
        }
      }
    }

    if ( options.timeout !== undefined && options.timeout > 0 ) {
      xhr.timeout = options.timeout;  // Timeout is in milliseconds
    }

    xhr.ontimeout = function() {
      if ( options.ontimeout !== undefined && options.ontimeout !== '' && options.ontimeout !== 0 ) {
        options.ontimeout();
      }
    }

    xhr.onreadystatechange = function() {
      // Fixes error on IE 9
      // http://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
      if ( xhr.readyState === 4 ) {
        a.status = xhr.status;
      }

      // xhr.readyState (0) === open() has not been called yet
      // xhr.readyState (1) === send() has not been called yet
      // xhr.readyState (2) === send() has been called and headers and status are available
      // xhr.readyState (3) === Downloading; responseText holds partial data
      // xhr.readyState (4) === The operation is complete

      if ( xhr.readyState === 4 && xhr.status === 200 && options.responseType === 'json' ) {
        xhr.jsonResponse = JSON.parse( xhr.responseText );
      }

      if ( options.callback !== '' && options.callback !== undefined && options.callback !== 0 ) {
        options.callback( xhr );
      }
    }

    if ( options.overrideMimeType !== undefined && options.overrideMimeType !== '' && options.overrideMimeType !== 0 ) {
      xhr.overrideMimeType( options.overrideMimeType );
    }

    var user = null;
    var password = null;
    var async = true;
    if ( options.async !== undefined && options.async !== '' && options.async < 2 ) {
      async = options.async;
    }
    if ( options.user !== undefined && options.user !== '' && options.user !== 0 ) {
      user = options.user;
    }
    if ( options.password !== undefined && options.password !== '' && options.password !== 0 ) {
      password = options.password;
    }

    xhr.open( options.requestType, options.url, async, user, password );
  
  // Fixes error on IE 10
    // https://github.com/enyo/dropzone/issues/179
  if ( options.withCredentials !== undefined && options.withCredentials === true ) {
      xhr.withCredentials = true;
    }

    if ( options.additionalHeaders !== undefined && options.additionalHeaders !== '' && options.additionalHeaders !== 0 ) {
      for ( var key in options.additionalHeaders ) {
        var value = options.additionalHeaders[ key ];
        xhr.setRequestHeader( key, value );
      }
    }

    if ( options.requestType.toUpperCase() === 'GET' ) {
      xhr.send();
    } else if ( options.requestType.toUpperCase() === 'LOGIN' || options.requestType.toUpperCase() === 'POST' || options.requestType.toUpperCase() === 'DELETE' || options.requestType.toUpperCase() === 'PUT' || options.requestType.toUpperCase() === 'PATCH' ) {
      xhr.send( options.queryString );
    } else {
      a.error( 'XHR ERROR: Bad requestType given' );
      return false;
    }
  }

  //this.AJAX = new ajax();
})();