define([

], function (

) {
    var MovementStrategy = function MovementStrategy() {
        var callbacks = {};
        
        this.setCallbackObject = function setCallbackObject(callbackObject) {
            callbacks = callbackObject;
        };
        
        this.setPlayerId = function setPlayerId(id) {
            this._playerId = id;
        };
        
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
        
        this.setStand = function setStand(scope, cb) {
//             console.log(scope._name, callbacks.stand);
            callbacks.stand = function() {
                cb.call(scope);
            }
        };
        this.setMoveLeft = function setMoveLeft(scope, cb) {
//             console.log(scope._name, callbacks.left);
            callbacks.left = function() {
                cb.call(scope);
            }
        };
        this.setMoveRight = function setMoveRight(scope, cb) {
//             console.log(scope._name, callbacks.right);
            callbacks.right = function() {
                cb.call(scope);
            };
        };
        this.setClimbUp = function setClimbUp(scope, cb) {
//             console.log(scope._name, callbacks.climbUp);
            callbacks.climbUp = function() {
                cb.call(scope);
            };
        };
        this.setClimbDown = function setClimbDown(scope, cb) {
//             console.log(scope._name, callbacks.climbDown);
            callbacks.climbDown = function() {
                cb.call(scope);
            };
        };
        this.setJump = function setJump(scope, cb) {
//             console.log(scope._name, callbacks.jump);
            callbacks.jump = function() {
                cb.call(scope);
            };
        };
        this.setDrop = function setDrop(scope, cb) {
//             console.log(scope._name, callbacks.drop);
            callbacks.drop = function() {
                cb.call(scope);
            };
        }
    }

    return MovementStrategy;
});