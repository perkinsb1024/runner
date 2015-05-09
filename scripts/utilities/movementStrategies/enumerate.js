define([
    'mout/object/keys',
    './arrow-keys'
], function (
    keys,
    ArrowKeysMovementStrategy
) {
    var MovementStrategies = {
        ARROW_KEYS: ArrowKeysMovementStrategy
    };
    MovementStrategies.toString = function() {
        return keys(this);
    }
    return MovementStrategies;
});