/**
 * Author: Spiro Floropoulos
 * Version: 1.0
 *
 * Defines a common templating module that can be used to create or retrieve markup for rendering and makes it available for DOM injection
 */

define( function( require, exports, module ) {
  var LOGGING = require( 'plugins/logging' );
  var EventEmitter = require( 'vendors/EventEmitter' );

  var TEMPLATES = function () {
    // PUBLIC VARIABLES //
    this.ee = new EventEmitter();
    this.templates = {};
    this.accessibleElements = [];

    // PRIVATE VARIABLES //
    this._className = 'TEMPLATES';
  }.define({
    createElement: function ( type, options, innerHTML ) {
      var self = this;

      var element = document.createElement( type );
      if ( element instanceof HTMLElement ) {
        if ( _.isObject( options ) ) {
          _.forEach( options, function ( value, option ) {
            if ( element.hasOwnProperty( option ) ) {
              if ( option === 'style' ) {
                _.forEach( value, function ( value, style ) {
                  element.style[ style ] = value;
                });
              } else {
                element[ option ] = value;
              }
            } else if ( element.attributes.getNamedItem( option ) ) {
              element.setAttribute( option, value );
            } else {
              self.log( 4, 'Tried to access an option that the HTMLElement does not have' );
            }
          });

          if ( !_.isNull( innerHTML ) && !_.isEmpty( innerHTML ) && _.isString( innerHTML ) ) {
            element.innerHTML = innerHTML;
          }

          return element;
        } else {
          this.log( 4, 'Passed options as a non-object', options );
        }
      } else {
        this.log( 4, 'The element is not an HTML element', type );
      }

      return false;
    },
    applyCSS: function ( element, cssObject ) {
      if ( _.isObject( cssObject ) && element instanceof HTMLElement ) {
        _.forEach( cssObject, function ( value, style ) {
          element.style[ style ] = value;
        });
      } else if ( !_.isObject( cssObject ) )  {
        //this.log( 4, 'CSS was not an object...' );
      } else if ( element instanceof HTMLElement === false ) {
        //this.log( 4, 'Element was not an htmlelement' );
      }
    },
    createMarkupFromString: function ( markup ) {
      var frag = document.createDocumentFragment();

      if ( _.isString( markup ) ) {
        frag.innerHTML = markup;
      } else {
        this.log( 4, 'Tried to pass markup that was not a string' );
        return false;
      }

      return frag;
    },
    parseTemplates: function () {
      var self = this;
      var templates = document.getElementsByTagName( 'template' );
      _.each( templates, function ( template ) {
        var html = template.innerHTML.trim();
        html = html.replace(/(\r\n|\n|\r|\t)/gm,'');
        html = html.replace(/ /g,'');
        self.templates[ template.id ] = html.trim();
      });
    },
    jsonToElement: function ( jsonObj ) {
      var el = document.createElement( jsonObj.type );
      if ( jsonObj.hasOwnProperty( 'id' ) ) {
        el.id = jsonObj.id;
      }
      if ( jsonObj.hasOwnProperty( 'className' ) ) {
        el.className = jsonObj.className;
      }
      if ( jsonObj.hasOwnProperty( 'class' ) ) {
        el.className = jsonObj.class;
      }
      if ( jsonObj.hasOwnProperty( 'cssText' ) ) {
        el.style.cssText = jsonObj.cssText;
      }
      if ( jsonObj.hasOwnProperty( 'text' ) ) {
        el.innerHTML = jsonObj.text;
      }
      if ( jsonObj.hasOwnProperty( 'src' ) ) {
        el.src = jsonObj.src;
      }
      if ( jsonObj.hasOwnProperty( 'href' ) ) {
        el.href = jsonObj.href;
      }
      if ( jsonObj.hasOwnProperty( 'value' ) ) {
        el.value = jsonObj.value;
      }
      if ( jsonObj.hasOwnProperty( 'placeholder' ) ) {
        el.placeholder = jsonObj.placeholder;
      }
      if ( jsonObj.hasOwnProperty( 'colspan' ) ) {
        el.setAttribute( 'colspan',jsonObj [ 'colspan' ] );
      }
      if ( jsonObj.hasOwnProperty( 'data-type' ) ) {
        el.type = jsonObj[ 'data-type' ];
      }
      if ( jsonObj.hasOwnProperty( 'data-id' ) ) {
        el.setAttribute( 'data-id', jsonObj[ 'data-id' ] );
      }
      return el;
    },
    jsonCreateChildren: function ( parent, jsonObj ) {
      for ( var child in jsonObj ) {
        var
        obj = jsonObj[ child ],
        children = obj.children,
        el = this.jsonToElement( obj );

        if ( !_.isUndefined( children ) && children.length ) {
          this.jsonCreateChildren( el, children );
        }

        if ( obj.hasOwnProperty( 'data-return' ) ) {
          this.accessibleElements.push( el );
        }
        parent.appendChild( el );
      }
    },
    jsonToHTML: function ( jsonObj ) {
      var frag = document.createDocumentFragment();
      this.accessibleElements = [];
      this.jsonCreateChildren( frag, { content: jsonObj } );
      return frag;
    },
    htmlToJSONTree: function ( el, obj ) {
      obj.type = el.nodeName;
      var nodeList = el.childNodes;
      if ( nodeList !== null ) {
        if ( nodeList.length ) {
          obj.children = [];
          for ( var i = 0; i < nodeList.length; i++ ) {
            if ( nodeList[ i ].nodeType === 3 ) {
              obj.text = nodeList[ i ].nodeValue;
            } else {
              obj.children.push( {} );
              this.htmlToJSONTree( nodeList[ i ], obj.children[ obj.children.length - 1 ] );
            }
          }
        }
      }
      if ( el.attributes != null ) {
        if ( el.attributes.length ) {
          //obj['attributes'] = {};
          for ( var i = 0; i < el.attributes.length; i++ ) {
            //obj['attributes'][el.attributes[i].nodeName] = el.attributes[i].nodeValue;
            obj[ el.attributes[ i ].nodeName ] = el.attributes[ i ].nodeValue;
          }
        }
      }
    },
    htmlToJSON: function ( el, asString ) {
      var treeObject = {};
      if ( typeof el === 'string' ) {
        if ( window.DOMParser ) {
          parser = new DOMParser();
          docNode = parser.parseFromString( el, 'text/html' );
        } else {
          docNode = new ActiveXObject( 'Microsoft.XMLDOM' );
          docNode.async = false;
          docNode.loadXML( el ); 
        } 
        el = docNode.firstChild;
      }
      this.htmlToJSONTree( el.getElementsByClassName('template')[0], treeObject );
      return ( asString ) ? JSON.stringify( treeObject.children ) : treeObject.children;
    },
    findElements: function ( elementsJSON, searchType, searchText ) {
      var classAttributeUtils = require( 'plugins/class_attribute_utils' );
      var elements = [];
      _.each( elementsJSON, function ( el, key ) {
        if ( searchType === 'class' ) {
          if ( _.isString( searchText ) ) {
            if ( classAttributeUtils.hasClass( el, searchText ) ) {
              elements.push( el );
            }
          } else if ( _.isArray( searchText ) ) {
            var missingOne = false;
            _.each( searchText, function ( text ) {
              if ( !classAttributeUtils.hasClass( el, text ) ) {
                missingOne = true;
              }
            });
            if ( !missingOne ) {
              elements.push( el );
            }
          }
        } else if ( searchType === 'className' ) {
          if ( el.className === searchText ) {
            elements.push( el );
          }
        } else if ( searchType === 'id' ) {
          if ( el.id === searchText ) {
            elements.push( el );
          }
        } else if ( searchType === 'data-id' ) {
          if ( el.getAttribute( 'data-id' ) === searchText ) {
            elements.push( el );
          }
        }
      });
      return elements;
    }
  }, LOGGING);

  return TEMPLATES;
});