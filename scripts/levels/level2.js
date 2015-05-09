define([
    'utilities/game-board',
    'utilities/game-tile',
], function (
    GameBoard,
    GameTile
) {
    var u = GameTile.typeIds.HOLE;
    var _ = GameTile.typeIds.FLOOR;
    var H = GameTile.typeIds.LADDER;
    var o = GameTile.typeIds.SWITCH;
    return {
        "background": {
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEUA//////+xuF6gAAAADklEQVQI12NgZIABilgAAWgACV4W/60AAAAASUVORK5CYII=",
            "size": {
                "width": 8,
                "height": 8
            }
        },
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