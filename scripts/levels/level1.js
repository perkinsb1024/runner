define([
    'utilities/game-board',
    'utilities/game-tile',
],function (
    GameBoard,
    GameTile
) {
    var u = GameTile.typeIds.HOLE;
    var _ = GameTile.typeIds.FLOOR;
    var H = GameTile.typeIds.LADDER;
    var o = GameTile.typeIds.SWITCH;
    return {
        "background": {
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEX//wD///+LefOdAAAAE0lEQVQI12NgYIRBKGCAsUgSAQAHzwA6Dhdq6AAAAABJRU5ErkJggg==",
            "size": {
                "width": 8,
                "height": 8
            }
        },
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