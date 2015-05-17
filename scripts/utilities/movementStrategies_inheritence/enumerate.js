define([
    'mout/object/keys',
    './arrow-keys',
    './artificial-intelligence'
], function (
    keys,
    ArrowKeysMovementStrategy,
    ArtificialIntelligenceMovementStrategy
) {
    var MovementStrategies = {
        ARROW_KEYS: ArrowKeysMovementStrategy,
        AI: ArtificialIntelligenceMovementStrategy
    };
    return MovementStrategies;
});