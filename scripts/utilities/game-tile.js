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
    
    var imageDir = 'images/src/';
    
    var GameTile = function GameTile(context, col, row, typeId, subTypeId) {
        // These shoudln't take col, row - They should not be aware of the game board. Just draw and return themself
            // Figure out how to return a canvas-drawable section like that
        this._context = context;
        this._col = col;
        this._row = row;
        this._typeId = typeId;
        this._type = GameTile.types[typeId] || GameTile.types[DEFAULT_TYPE];
        this._subTypeId = subTypeId || GameTile.subTypeIds.ROCK;
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
            this._subTypeId,
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
    
    GameTile.prototype.getState = function getState() {
        return this._state;
    };
    
    GameTile.prototype.getType = function getType() {
        return this._typeId;
    };
    
    GameTile.prototype.setSubType = function setSubType(subTypeId) {
        return this._subTypeId = subTypeId;
    };
    
    GameTile.prototype.getSubType = function getSubType() {
        return this._subTypeId;
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
    
    GameTile.subTypeIds = {
        ROCK: 0,
        BRICK: 1
    };
    
    GameTile.types = {
        0: { // Hole
            "render": function(context, loc) { }
        },
        1: { // Floor
            "_images": {
                "rock": (function() {
                    var image = new Image();
                    image.src = imageDir + 'rock.png';
                    return image;
                })(),
                "brick": (function() {
                    var image = new Image();
                    image.src = imageDir + 'brick.png';
                    return image;
                })()
            },
            "render": function(context, loc, subTypeId) {
                if(subTypeId === GameTile.subTypeIds.ROCK) {
                    context.drawImage(this._images.rock, loc.x, loc.y + (TILE_HEIGHT - 16));
                }
                else if(subTypeId === GameTile.subTypeIds.BRICK) {
                    context.drawImage(this._images.brick, loc.x, loc.y + (TILE_HEIGHT - 16));
                }
            }
        },
        2: { // Ladder 
            "_images": {
                "ladder": (function() {
                    var image = new Image();
                    image.src = imageDir + 'ladder.png';
                    return image;
                })(),
                "rock": (function() {
                    var image = new Image();
                    image.src = imageDir + 'rock.png';
                    return image;
                })(),
                "brick": (function() {
                    var image = new Image();
                    image.src = imageDir + 'brick.png';
                    return image;
                })()
            },
            "render": function(context, loc, subTypeId) {
                context.drawImage(this._images.ladder, loc.x, loc.y - 15);
                if(subTypeId === GameTile.subTypeIds.ROCK) {
                    context.drawImage(this._images.rock, loc.x, loc.y + (TILE_HEIGHT - 16));
                }
                else if(subTypeId === GameTile.subTypeIds.BRICK) {
                    context.drawImage(this._images.brick, loc.x, loc.y + (TILE_HEIGHT - 16));
                }
            }
        },
        3: { // Switch 
            "_images": {
                "switch_off": (function() {
                    var image = new Image();
                    image.src = imageDir + 'switch_off.png';
                    return image;
                })(),
                "switch_on": (function() {
                    var image = new Image();
                    image.src = imageDir + 'switch_on.png';
                    return image;
                })(),
                "rock": (function() {
                    var image = new Image();
                    image.src = imageDir + 'rock.png';
                    return image;
                })(),
                "brick": (function() {
                    var image = new Image();
                    image.src = imageDir + 'brick.png';
                    return image;
                })()
            },
            "render": function(context, loc, subTypeId, state) {
                if(state === GameTile.switchState.ON) {
                    context.drawImage(this._images.switch_on, loc.x + 2, loc.y);
                }
                else if(state === GameTile.switchState.OFF){
                    context.drawImage(this._images.switch_off, loc.x + 2, loc.y);
                }
                if(subTypeId === GameTile.subTypeIds.ROCK) {
                    context.drawImage(this._images.rock, loc.x, loc.y + (TILE_HEIGHT - 16));
                }
                else if(subTypeId === GameTile.subTypeIds.BRICK) {
                    context.drawImage(this._images.brick, loc.x, loc.y + (TILE_HEIGHT - 16));
                }
            }
        }
    };

    
    return GameTile;
});