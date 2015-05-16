define([
    'utilities/game-board',
    'utilities/game-tile',
    'utilities/addon'
], function (
    GameBoard,
    GameTile,
    Addon
) {
    var u = GameTile.typeIds.HOLE;
    var _ = GameTile.typeIds.FLOOR;
    var H = GameTile.typeIds.LADDER;
    var o = GameTile.typeIds.SWITCH;
    return {
        "level": 2,
        "background": {
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEUA//////+xuF6gAAAADklEQVQI12NgZIABilgAAWgACV4W/60AAAAASUVORK5CYII=",
            "size": {
                "width": 8,
                "height": 8
            }
        },
        "floorTypeId": GameTile.subTypeIds.ROCK,
        "marbleProbability": 0.05,
        "marbleTypeCumulativeProbability": {
            0: 0.15, // Red
            1: 0.8, // Purple
            2: 0.9, // Dark gray
            3: 1, // Light gray
        },
        "opponents": [
            {
                "position": {
                    "x": 38,
                    "y": 0
                }
            }
        ],
        "music": "audio/music/level02.mp3",
        "map": [
            _,_,_,_,_,_,_,_,_,_,_,u,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
            _,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,o,_,_,_,_,_,_,
            _,H,_,_,_,_,_,o,_,_,_,_,_,_,H,_,_,_,_,_,_,_,o,_,_,_,_,_,u,_,_,_,_,H,_,_,_,_,_,_,
            _,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,u,_,_,o,_,_,
            _,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,
            _,_,_,_,_,_,_,H,_,u,_,_,_,_,_,_,_,o,_,_,_,_,_,u,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,
            _,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,
            _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,o,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_
        ]
    }
});