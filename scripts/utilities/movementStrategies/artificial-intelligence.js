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
    
    var ArtificialIntelligenceMovementStrategy = function ArtificialIntelligenceMovementStrategy(eventEmitter) {
        var scope = this;
        var moveInterval = 250; // mS
        var callbacks = {};
        this.setCallbackObject(callbacks);
        this.eventEmitter = eventEmitter;
        
        eventEmitter.on('aiInfo', function(event) {
            scope._move.call(scope, event);
        });
        
        setInterval(function() {
            scope._requestInfo.call(scope);
        }, moveInterval);
    };
    
    ArtificialIntelligenceMovementStrategy.prototype = new MovementStrategy();
    ArtificialIntelligenceMovementStrategy.prototype.constructor = ArtificialIntelligenceMovementStrategy;
    
    ArtificialIntelligenceMovementStrategy.prototype._requestInfo = function _requestInfo() {
        var scope = this;
        var id = this._playerId;
        if(id) {
            this.eventEmitter.emit('aiInfoRequest', {
                player: id
            });
        }
    };
    
    ArtificialIntelligenceMovementStrategy.prototype._move = function _move(event) {
        var nearestLadder, ladders, preferLeft;
        var scope = this;
        var position = event.position;
        var target = event.nearestHuman;
        var laddersOnThisRow = event.laddersOnThisRow;
        var laddersOnLowerRow = event.laddersOnLowerRow;
        var madeMove = false;
        
        var getNearestLadder = function getNearestLadder(ladders, position, preferLeft) {
            var nearestPreferredDistance = null;
            var nearestPreferredLadder = null;
            var nearestUnpreferredDistance = null;
            var nearestUnpreferredLadder = null;
            forEach(ladders, function(ladder) {
                var difference = ladder.x - position.x;
                var distance = Math.abs(difference);
                var isLeft = (difference < 0);
                                
                // No XOR function :(
                if(distance === 0 || (isLeft && preferLeft) || (!isLeft && !preferLeft)) {
                    // Preferred direction of motion
                    if(!nearestPreferredLadder || distance < nearestPreferredDistance) {
                        nearestPreferredDistance = distance;
                        nearestPreferredLadder = ladder;
                    }
                }
                else {
                    // Unpreferred direction of motion
                    if(!nearestUnpreferredLadder || distance < nearestUnpreferredDistance) {
                        nearestUnpreferredDistance = distance;
                        nearestUnpreferredLadder = ladder;
                    }
                }
            });
            return nearestPreferredLadder || nearestUnpreferredLadder;
        }
        
        // If no human
            // MOVE stand
        // If on same level
            // If right of target
                // MOVE left
            // If left of target
                // MOVE right
            // Else
                // MOVE stand
        // If not on level
            // Use correct ladder array
            // If left of target
                // preferLeft = false
            // Else
                // preferLeft = true
            // Get closest ladder
            // Move toward closest ladder
        
        if(!target) {
            // No living humans
            return this.stand();
        }
        else if(position.y === target.y) {
            // On same level as target
            if(position.x < target.x) {
                // Left of target
                return this.moveRight();
            }
            else if(position.x > target.x) {
                return this.moveLeft();
            }
            else {
                return this.stand();
            }
        }
        else {
            // Use laders beneath you to move down or ladders on your row to move up
            ladders = (position.y < target.y) ? laddersOnLowerRow : laddersOnThisRow;
            // Prefer running toward a ladder in the opposite direction of your target
            preferLeft = (position.x < target.x);
            nearestLadder = getNearestLadder(ladders, position, preferLeft);
            if(position.x < nearestLadder.x) {
                return this.moveRight();
            }
            else if(position.x > nearestLadder.x) {
                return this.moveLeft();
            }
            else {
                return (position.y < nearestLadder.y) ? this.climbDown() : this.climbUp();
            }
        }
    };
    
    return ArtificialIntelligenceMovementStrategy;
});