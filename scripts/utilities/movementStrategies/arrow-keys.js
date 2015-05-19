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
    'utilities/key-codes'
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
    keyCodes
) {
    var ArrowKeysMovementStrategy = function ArrowKeysMovementStrategy() {
        var scope = this;
        var $window = $(window);
        var keyCheck = 250; // mS
        var callbacks = {};
        this._keyCodes = {
            left: [keyCodes.LEFT_ARROW],
            right: [keyCodes.RIGHT_ARROW],
            climbUp: [keyCodes.UP_ARROW],
            climbDown: [keyCodes.DOWN_ARROW],
            jump: [keyCodes.SPACE],
            drop: [keyCodes.SHIFT]
        };
        this._validKeys = union.apply(this, values(this._keyCodes));

        this.stand = function stand() {
            callbacks.stand && callbacks.stand.call(this);
        }
        this.moveLeft = function moveLeft() {
            callbacks.left && callbacks.left.call(this);
        };
        this.moveRight = function moveRight() {
            callbacks.right && callbacks.right.call(this);
        };
        this.climbUp = function climbUp() {
            callbacks.climbUp && callbacks.climbUp.call(this);
        };
        this.climbDown = function climbDown() {
            callbacks.climbDown && callbacks.climbDown.call(this);
        };
        this.jump = function jump() {
            callbacks.jump && callbacks.jump.call(this);
        };
        this.drop = function drop() {
            callbacks.drop && callbacks.drop.call(this);
        }
        
        this.setPlayerId = function setPlayerId(id) {
            this._playerId = id;
        };
        this.setStand = function setStand(scope, cb) {
            callbacks.stand = function() {
                cb.call(scope);
            }
        };
        this.setMoveLeft = function setMoveLeft(scope, cb) {
            callbacks.left = function() {
                cb.call(scope);
            }
        };
        this.setMoveRight = function setMoveRight(scope, cb) {
            callbacks.right = function() {
                cb.call(scope);
            };
        };
        this.setClimbUp = function setClimbUp(scope, cb) {
            callbacks.climbUp = function() {
                cb.call(scope);
            };
        };
        this.setClimbDown = function setClimbDown(scope, cb) {
            callbacks.climbDown = function() {
                cb.call(scope);
            };
        };
        this.setJump = function setJump(scope, cb) {
            callbacks.jump = function() {
                cb.call(scope);
            };
        };
        this.setDrop = function setDrop(scope, cb) {
            callbacks.drop = function() {
                cb.call(scope);
            };
        }
        
        this.destruct = function destruct() {
            clearInterval(this._timer);
            $window.off('keydown');
            $window.off('keyup');
        };
        
        $window.on('keydown', function(event) {
            return scope._keyDown.call(scope, event);
        });
        $window.on('keyup', function(event) {
            return scope._keyUp.call(scope, event);
        });
        
        this._timer = setInterval(function() {
            scope._move.call(scope);
        }, keyCheck);
    };
    
    // _currentlyPressed is used (and can be modified) by MovementStrategy logic
    ArrowKeysMovementStrategy.prototype._currentlyPressed = [];
    // _ignore is ONLY used to prevent key repeats
    ArrowKeysMovementStrategy.prototype._ignore = [];
    
    ArrowKeysMovementStrategy.prototype._keyDown = function _keyDown(event) {
        var keyCode = (event && event.keyCode);
        if(keyCode && contains(this._validKeys, keyCode)) {
            if(!contains(this._ignore, keyCode)) {
                insert(this._ignore, keyCode);
                insert(this._currentlyPressed, keyCode);
            }
            return false;
        }
    };
    
    ArrowKeysMovementStrategy.prototype._keyUp = function _keyUp(event) {
        var keyCode = (event && event.keyCode);
        if(!keyCode) {
            return;
        }
        remove(this._ignore, keyCode);
        remove(this._currentlyPressed, keyCode);
    };
    
    ArrowKeysMovementStrategy.prototype._move = function _move() {
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
    
    return ArrowKeysMovementStrategy;
});