define([
    './game-tile'
], function (
    GameTile
) {
    var DEFAULT_TYPE = 0; // Marble
    var DEFAULT_SUB_TYPE = 0; // Red
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    var imageDir = 'images/src/';
    
    var Addon = function Addon(context, col, row, typeId, subTypeId) {
        // These shoudln't take col, row - They should not be aware of the game board. Just draw and return themself
            // Figure out how to return a canvas-drawable section like that
        this._context = context;
        this._col = col;
        this._row = row;
        this._typeId = typeId;
        this._type = Addon.types[typeId] || Addon.types[DEFAULT_TYPE];
        if(typeId === Addon.typeIds.MARBLE) {
            this._subTypeId = subTypeId || DEFAULT_SUB_TYPE;
        }
    };
        
    Addon.prototype.render = function() {
        this._type.render(
            this._context,
            {
                "x": this._col * tileWidth,
                "y": this._row * tileHeight
            },
            this._subTypeId
        );
    };
    
    Addon.prototype.removeAddon = function removeAddon(addon) {
        return remove(this._addons, addon);
    };
    
    Addon.prototype.getType = function getType() {
        return this._typeId;
    };
    
    Addon.prototype.getSubType = function getSubType() {
        return this._subTypeId;
    };
    
    Addon.prototype.getPosition = function getPosition() {
        var scope = this;
        return {
            "x": scope._col,
            "y": scope._row
        };
    };
    
    Addon.prototype.setPosition = function setPosition(position) {
        this._col = position.x;
        this._row = position.y;
    };
    
    Addon.getTileSize = function getTileSize() {
        return {
            width: tileWidth,
            height: tileHeight
        };
    }
    
    Addon.switchState = {
        OFF: 0,
        ON: 1
    };
    
    Addon.typeIds = {
        MARBLE: 0,
        TELEPOD: 1,
        NEUTRINO_CAN: 2,
        DOOR: 3//,
        //WIZARD: 4
    };
    
    Addon.subTypeIds = {
        RED_MARBLE: 0,
        PURPLE_MARBLE: 1,
        LIGHT_GRAY_MARBLE: 2,
        DARK_GRAY_MARBLE: 3
    };
    
    Addon.types = {
        0: { // Marble
            "_images": {
                0: (function() { // Red marble
                    var image = new Image();
                    image.src = imageDir + 'marble_red.png';
                    return image;
                })(),
                1: (function() { // Purple marble
                    var image = new Image();
                    image.src = imageDir + 'marble_purple.png';
                    return image;
                })(),
                2: (function() { // Light gray marble
                    var image = new Image();
                    image.src = imageDir + 'marble_dark_gray.png';
                    return image;
                })(),
                3: (function() { // Dark gray marble
                    var image = new Image();
                    image.src = imageDir + 'marble_light_gray.png';
                    return image;
                })(),
            },
            "render": function(context, loc, subTypeId) {
                context.drawImage(this._images[subTypeId], loc.x + 4, loc.y + (tileHeight - 16 - 8));
            }
        },
        1: { // Telepod
            "_images": {
                "telepod": (function() {
                    var image = new Image();
                    image.src = imageDir + 'telepod.png';
                    return image;
                })()
            },
            "render": function(context, loc) {
                context.drawImage(this._images.telepod, loc.x + 2, loc.y + (tileHeight - 16 - 16));
            }
        },
        2: { // Neutrino can 
            "_images": {
                "can": (function() {
                    var image = new Image();
                    image.src = imageDir + 'can.png'
                    return image;
                })()
            },
            "render": function(context, loc) {
                context.drawImage(this._images.can, loc.x + 4, loc.y + (tileHeight - 16 - 12));
            }
        },
        3: { // Door 
            "_images": {
                "door": (function() {
                    var image = new Image();
                    image.src = imageDir + 'door.png';
                    return image;
                })()
            },
            "render": function(context, loc) {
                context.drawImage(this._images.door, loc.x, loc.y);
            }
        }
    };

    
    return Addon;
});