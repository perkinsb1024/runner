define([
    'jquery',
    'mout/array/forEach',
    'mout/array/contains',
    'mout/array/union',
    'mout/array/intersection',
    'mout/array/difference',
    'mout/array/insert',
    'mout/array/remove',
    'mout/object/values',
    'mout/object/some',
    './main'
], function (
    $,
    forEach,
    contains,
    union,
    intersection,
    difference,
    insert,
    remove,
    values,
    some,
    MovementStrategy
) {
    
    // To do: Convert this to a pure virtual function (object instead of function)
    
    var KeysMovementStrategy = function KeysMovementStrategy(keyCodes) {
        var scope = this;
        var $window = $(window);
        var keyCheck = 250; // mS    
        this._keyCodes = keyCodes;
        this._validKeys = union.apply(this, values(this._keyCodes));
        
        $window.on('keydown', function(event) {
            return scope._keyDown.call(scope, event);
        });
        $window.on('keyup', function(event) {
            return scope._keyUp.call(scope, event);
        });
        
        setInterval(function() {
            scope._move.call(scope);
        }, keyCheck);
    };
    
    KeysMovementStrategy.prototype = new MovementStrategy();
    // _currentlyPressed is used (and can be modified) by MovementStrategy logic
    KeysMovementStrategy.prototype._currentlyPressed = [];
    // _ignore is ONLY used to prevent key repeats
    KeysMovementStrategy.prototype._ignore = [];
    KeysMovementStrategy.prototype._keyCodes = {
        left: [],
        right: [],
        climbUp: [],
        climbDown: [],
        jump: [],
        drop: []
    };
    
    KeysMovementStrategy.prototype._keyDown = function _keyDown(event) {
        var keyCode = (event && event.keyCode);
        if(keyCode && contains(this._validKeys, keyCode)) {
            if(!contains(this._ignore, keyCode)) {
                insert(this._ignore, keyCode);
                insert(this._currentlyPressed, keyCode);
            }
            return false;
        }
    };
    
    KeysMovementStrategy.prototype._keyUp = function _keyUp(event) {
        var keyCode = (event && event.keyCode);
        if(!keyCode) {
            return;
        }
        remove(this._ignore, keyCode);
        remove(this._currentlyPressed, keyCode);
    };
    
    KeysMovementStrategy.prototype._move = function _move() {
        var scope = this;
        var currentlyPressed = this._currentlyPressed;
        var keyCodes = scope._keyCodes;
                
        if(intersection(currentlyPressed, keyCodes.left).length) {
            if(intersection(currentlyPressed, keyCodes.jump).length) {
                // Remove any `jump` keys from `currentlyPressed`
                this._currentlyPressed = currentlyPressed = difference(currentlyPressed, keyCodes.jump);
                scope.jump();
            }
            else  {
                scope.moveLeft();
            }
        }
        else if(intersection(currentlyPressed, keyCodes.right).length) {
            if(intersection(currentlyPressed, keyCodes.jump).length) {
                // Remove any `jump` keys from `currentlyPressed`
                this._currentlyPressed = currentlyPressed = difference(currentlyPressed, keyCodes.jump);
                scope.jump();
            }
            else  {
                scope.moveRight();
            }
        }
        else if(intersection(currentlyPressed, keyCodes.climbUp).length) {
            scope.climbUp();
        }
        else if(intersection(currentlyPressed, keyCodes.climbDown).length) {
            scope.climbDown();
        }
        else {
            scope.stand();
        }
        
        if(intersection(currentlyPressed, keyCodes.drop).length) {
            scope.drop();
        }
    };
    
    return KeysMovementStrategy;
});