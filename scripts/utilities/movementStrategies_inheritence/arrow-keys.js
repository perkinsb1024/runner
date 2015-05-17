define([
    '../key-codes',
    './keys'
], function (
    keyCodes,
    KeysMovementStrategy
) {
    var ArrowKeysMovementStrategy = function ArrowKeysMovementStrategy() { 
        var callbacks = {};
        this.setCallbackObject(callbacks);
    };
    ArrowKeysMovementStrategy.prototype = new KeysMovementStrategy({
        left: [keyCodes.LEFT_ARROW],
        right: [keyCodes.RIGHT_ARROW],
        climbUp: [keyCodes.UP_ARROW],
        climbDown: [keyCodes.DOWN_ARROW],
        jump: [keyCodes.SPACE],
        drop: [keyCodes.SHIFT]
    });
    
    return ArrowKeysMovementStrategy;
});