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
    
    // todo: Change the floor to render brick instead of rock
    
    return {
        "level": 3,
        "splashImage": {
            "path": "images/src/level3.png",
            "size": {
                "width": 640,
                "height": 420
            }
        },
        "background": {
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEXAwMD///8raYe0AAAAGklEQVR4AWNgZAQiIMEAoYEUlIbxEZgRj2IAB1AAM1ldG0sAAAAASUVORK5CYII=",
            "size": {
                "width": 8,
                "height": 8
            }
        },
        "floorTypeId": GameTile.subTypeIds.BRICK,
        "marbleProbability": 0.1,
        "marbleTypeCumulativeProbability": {
            0: 0.2, // Red
            1: 0.7, // Purple
            2: 0.85, // Light gray
            3: 1, // Dark gray
        },
        "opponents": [
            {
                "position": {
                    "x": 38,
                    "y": 0
                }
            },
            {
                "position": {
                    "x": 37,
                    "y": 2
                },
                "intelligence": 40
            }
        ],
        "music": "audio/music/level03.mp3",
        "map": [
            _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,u,u,_,_,_,_,u,_,_,_,_,_,_,
            _,_,_,_,_,H,_,_,u,u,_,_,_,_,_,H,_,_,_,_,_,o,_,_,_,_,_,u,u,_,_,_,H,u,u,_,_,H,_,_,
            _,_,H,_,_,_,_,_,_,u,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,_,u,H,_,_,_,u,_,H,_,_,_,_,
            _,_,_,_,_,H,_,_,_,_,_,o,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,u,_,o,_,H,u,u,_,_,H,_,_,
            _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,u,u,_,_,o,_,_,H,_,u,u,H,_,_,_,u,_,H,_,_,_,_,
            _,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,u,_,_,H,_,_,_,_,_,u,_,o,_,H,u,u,_,_,H,_,_,
            _,_,_,_,H,_,_,_,_,_,_,_,o,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,u,_,H,_,_,_,_,_,_,H,_,_,
            _,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_,_,H,_,_,_,_,_,
        ]
    }
});