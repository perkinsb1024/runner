define([
    'mout/array/forEach',
    'mout/array/remove'
], function (
    forEach,
    remove
) {
    var TILE_WIDTH = 16;
    var TILE_HEIGHT = 48;
    var DEFAULT_TYPE = 1; // Floor
    var DEFAULT_SWITCH_STATE = 0; // Off
    
    var GameTile = function GameTile(context, col, row, typeId) {
        // These shoudln't take col, row - They should not be aware of the game board. Just draw and return themself
            // Figure out how to return a canvas-drawable section like that
        this._context = context;
        this._col = col;
        this._row = row;
        this._typeId = typeId;
        this._type = GameTile.types[typeId] || GameTile.types[DEFAULT_TYPE];
        this._addons = [];
        if(typeId === GameTile.typeIds.SWITCH) {   
            this._state = DEFAULT_SWITCH_STATE;
        }
    };
        
    GameTile.prototype.render = function() {
        var scope = this;
        this._type.render(
            this._context,
            {
                "x": this._col * TILE_WIDTH,
                "y": this._row * TILE_HEIGHT
            },
            this._state
        );
        forEach(this._addons, function(addon) {
            addon.render();
        });
    };
    
    GameTile.prototype.getAddons = function getAddons() {
        return this._addons;
    };
    
    GameTile.prototype.addAddon = function addAddon(addon) {
        return this._addons.push(addon);
    };
    
    GameTile.prototype.removeAddon = function removeAddon(addon) {
        return remove(this._addons, addon);
    };
    
    GameTile.prototype.setState = function setState(state) {
        if(this._typeId === 3) {
            this._state = state;
        }
    };
    
    GameTile.prototype.getType = function getType() {
        return this._typeId;
    };
    
    GameTile.prototype.getState = function getState() {
        return this._state;
    };
    
    GameTile.getTileSize = function getTileSize() {
        return {
            width: TILE_WIDTH,
            height: TILE_HEIGHT
        };
    }
    
    GameTile.switchState = {
        OFF: 0,
        ON: 1
    };
    
    GameTile.typeIds = {
        HOLE: 0,
        FLOOR: 1,
        LADDER: 2,
        SWITCH: 3
    };
    
    GameTile.types = {
        0: { // Hole
            "render": function(context, loc) { }
        },
        1: { // Floor
            "_images": {
                "rock": (function() {
                    var image = new Image();
                    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAD1BMVEX///8AAACAgIDAwMD///9iTTvsAAAAAXRSTlMAQObYZgAAAFhJREFUGNNNjkkSxEAMgxDk/2+eQ08W3RBylQHMLCcAh042yKsnV+NGO4pXqzaegZdVXHk400Xpza3Q15uybzNj/6ZaOphO1zyfwjzX7jBs6rzxHn0Z9sx/PT4B+YNOt7sAAAAASUVORK5CYII=";
                    return image;
                })()
            },
            "render": function(context, loc) {
                context.drawImage(this._images.rock, loc.x, loc.y + (TILE_HEIGHT - 16));
            }
        },
        2: { // Ladder 
            "_images": {
                "ladder": (function() {
                    var image = new Image();
                    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAwCAMAAAAvgQplAAAACVBMVEX///+AgID//wAR4nKzAAAAAXRSTlMAQObYZgAAACFJREFUeAFjYGJiZIABEIdeAsgAqgIJYGgZDAKj4TEaHgCRgAI7ziC/9QAAAABJRU5ErkJggg==";
                    return image;
                })(),
                "rock": (function() {
                    var image = new Image();
                    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAD1BMVEX///8AAACAgIDAwMD///9iTTvsAAAAAXRSTlMAQObYZgAAAFhJREFUGNNNjkkSxEAMgxDk/2+eQ08W3RBylQHMLCcAh042yKsnV+NGO4pXqzaegZdVXHk400Xpza3Q15uybzNj/6ZaOphO1zyfwjzX7jBs6rzxHn0Z9sx/PT4B+YNOt7sAAAAASUVORK5CYII=";
                    return image;
                })()
            },
            "render": function(context, loc) {
                context.drawImage(this._images.ladder, loc.x, loc.y - 15);
                context.drawImage(this._images.rock, loc.x, loc.y + (TILE_HEIGHT - 16));
            }
        },
        3: { // Switch 
            "_images": {
                "switch_off": (function() {
                    var image = new Image();
                    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAcCAMAAABifa5OAAAAFVBMVEX/AAD///8AAACAgIDAwMD/AAD////b+LSAAAAAAnRSTlMAAHaTzTgAAABLSURBVHgBpc1BCsAgEEPRid96/yO3xKBQcFH6V/Nmk0IrCugzKIkklapfjnrg28o/+g8t8R6VcJKRjmCiO4IxBhutHQBsuE8gGbsbDfYD3++M4vgAAAAASUVORK5CYII=";
                    return image;
                })(),
                "switch_on": (function() {
                    var image = new Image();
                    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAcCAMAAABifa5OAAAAElBMVEX///8AAAAA/wCAgIDAwMD///9N0QIsAAAAAXRSTlMAQObYZgAAAERJREFUeNqlzTEOgEAMA0Efm/z/yyjBIroCCcRU3spCNwTEBSRhKnE0vF3erv8xxX5aaHoHtWg4MpOJtR4CmCjfAtPuBLhDAlLoQTwFAAAAAElFTkSuQmCC";
                    return image;
                })(),
                "rock": (function() {
                    var image = new Image();
                    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAD1BMVEX///8AAACAgIDAwMD///9iTTvsAAAAAXRSTlMAQObYZgAAAFhJREFUGNNNjkkSxEAMgxDk/2+eQ08W3RBylQHMLCcAh042yKsnV+NGO4pXqzaegZdVXHk400Xpza3Q15uybzNj/6ZaOphO1zyfwjzX7jBs6rzxHn0Z9sx/PT4B+YNOt7sAAAAASUVORK5CYII=";
                    return image;
                })()
            },
            "render": function(context, loc, state) {
                if(state) {
                    context.drawImage(this._images.switch_on, loc.x + 2, loc.y);
                }
                else {
                    context.drawImage(this._images.switch_off, loc.x + 2, loc.y);
                }
                context.drawImage(this._images.rock, loc.x, loc.y + (TILE_HEIGHT - 16));
            }
        }
    };

    
    return GameTile;
});