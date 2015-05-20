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
        "level": 1,
        "splashImage": {
            "path": "images/src/level1.png",
            "size": {
                "width": 640,
                "height": 420
            }
        },
        "background": {
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEX//wD///+LefOdAAAAE0lEQVQI12NgYIRBKGCAsUgSAQAHzwA6Dhdq6AAAAABJRU5ErkJggg==",
            "size": {
                "width": 8,
                "height": 8
            }
        },
        "floorTypeId": GameTile.subTypeIds.ROCK,
        "marbleProbability": 0.005,
        "marbleTypeCumulativeProbability": { 
            0: 0.05, // Red
            1: 0.8, // Purple
            2: 0.9, // Light gray
            3: 1, // Dark gray
        },
        "opponents": [
            {
                "position": {
                    "x": 38,
                    "y": 0
                }
            }
        ],
        "music": "audio/music/level01.mp3",
        "map": [
            _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
            _,_,_,_,H,_,_,_,_,o,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,o,_,_,_,H,_,_,_,_,
            _,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,
            _,_,_,_,_,_,_,H,_,_,_,u,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,u,_,_,_,H,_,_,_,_,_,_,_,
            _,_,_,H,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,o,_,_,_,H,_,_,_,_,
            _,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,
            _,_,_,H,_,_,_,_,_,_,o,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,
            _,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,
        ]
    }
});