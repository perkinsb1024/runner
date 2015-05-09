define([

], function (

) {
    var MovementStrategy = function MovementStrategy() {
        var scope = this;
        this.stand = function stand() {
            this._callbacks.stand && this._callbacks.stand.call(this);
        }
        this.moveLeft = function moveLeft() {
            this._callbacks.left && this._callbacks.left.call(this);
        };
        this.moveRight = function moveRight() {
            this._callbacks.right && this._callbacks.right.call(this);
        };
        this.climbUp = function climbUp() {
            this._callbacks.climbUp && this._callbacks.climbUp.call(this);
        };
        this.climbDown = function climbDown() {
            this._callbacks.climbDown && this._callbacks.climbDown.call(this);
        };
        this.jump = function jump() {
            this._callbacks.jump && this._callbacks.jump.call(this);
        };
        this.drop = function drop() {
            this._callbacks.drop && this._callbacks.drop.call(this);
        }
        
        this.setStand = function setStand(scope, cb) {
            this._callbacks.stand = function() {
                cb.call(scope);
            }
        };
        this.setMoveLeft = function setMoveLeft(scope, cb) {
            this._callbacks.left = function() {
                cb.call(scope);
            }
        };
        this.setMoveRight = function setMoveRight(scope, cb) {
            this._callbacks.right = function() {
                cb.call(scope);
            };
        };
        this.setClimbUp = function setClimbUp(scope, cb) {
            this._callbacks.climbUp = function() {
                cb.call(scope);
            };
        };
        this.setClimbDown = function setClimbDown(scope, cb) {
            this._callbacks.climbDown = function() {
                cb.call(scope);
            };
        };
        this.setJump = function setJump(scope, cb) {
            this._callbacks.jump = function() {
                cb.call(scope);
            };
        };
        this.setDrop = function setDrop(scope, cb) {
            this._callbacks.drop = function() {
                cb.call(scope);
            };
        }
    }
    
    MovementStrategy.prototype._callbacks = {}; 
    
    return MovementStrategy;
});