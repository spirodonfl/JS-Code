/**
 * Author: Spiro Floropoulos
 * Version: 1.0
 */

define([ 'vendors/fastClass' ], function( require, exports, module ) {
  var FSM = function () {
    this.state = 'uninitialized';
    this.states = new Array();
  }.define({
    hasState: function ( stateName ) {
      if ( _.isUndefined( this.states[ stateName ] ) ) {
        return false;
      } else {
        return true;
      }
    },
    currentStateHasAction: function ( action ) {
      if ( this.hasState( this.state ) ) {
        if ( _.isUndefined( this.states[ this.state ][ action ] ) ) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    getCurrentStateAction: function ( action ) {
      if ( this.currentStateHasAction( action ) ) {
        return this.states[ this.state ][ action ];
      } else {
        return false;
      }
    },
    stateHasAction: function ( stateName, action ) {
      if ( this.hasState( stateName ) ) {
        if ( _.isUndefined( this.states[ stateName ][ action ] ) ) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    doStatesExist: function () {
      if ( _.isUndefined( this.states ) || _.isEmpty( this.states ) ) {
        this.log( 4, 'Please define states' );
        return false;
      } else {
        return true;
      }
    },
    transition: function ( state ) {
      if ( this.doStatesExist() ) {
        if ( this.hasState( state ) === false ) {
          this.log( 4, 'State ' + state + ' does not exist' );
        } else {
          if ( this.currentStateHasAction( '_onExit' ) ) {
            this.handle( '_onExit' );
          }

          this.state = state;

          if ( this.currentStateHasAction( '_onEnter' ) ) {
            this.handle( '_onEnter' );
          }
        }
      }
    },
    handle: function () {
      var slice = [].slice;
      var action = arguments[0];
      var args = slice.call( arguments, 0 );
      args = args.slice(1);

      if ( this.doStatesExist() ) {
        if ( this.currentStateHasAction( action ) === false ) {
          this.log( 4, 'Action ' + action + ' does not exist' );
        } else {
          this.stateAction = this.getCurrentStateAction( action );
          this.stateAction.apply( this, args );
        }
      }
    },
    defaultArbitraryState: function () {
      return {
        '_onEnter': function () {
          this.log( 2, 'Entered ' + this.state + ' state' );
        },
        '_onExit': function () {
          this.log( 2, 'Exited ' + this.state + ' state' );
        }
      }
    },
    defaultReadyState: function () {
      return {
        '_onEnter': function () {
          this.log( 2, 'Entered ' + this.state + ' state' );

          if ( !_.isUndefined( this.ee ) ) {
            this.ee.emit( this.state );
          }
        },
        '_onExit': function () {
          this.log( 2, 'Exited ' + this.state + ' state' );
        }
      }
    }
  });

  return FSM;
});