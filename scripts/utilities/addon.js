define([
    'mout/lang/clone',
    './game-tile'
], function (
    clone,
    GameTile
) {
    var DEFAULT_TYPE = 0; // Marble
    var DEFAULT_SUB_TYPE = 0; // Red
    var OUTER_INTERVAL = 500; // mS between setPosition calls
    var UPDATE_INTERVAL = 125; // mS between redraws for internal motion
    var UPDATE_FRACTION = UPDATE_INTERVAL / OUTER_INTERVAL; // Inverse of updates between setPosition calls
    
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    var imageDir = 'images/src/';
    
    var Addon = function Addon(context, eventEmitter, col, row, typeId, subTypeId) {
        this._context = context;
        this._eventEmitter = eventEmitter;
        this._col = col;
        this._row = row;
        this._typeId = typeId;
        this._type = Addon.types[typeId] || Addon.types[DEFAULT_TYPE];
        this._offsets = clone(this._type.offsets);
        this._offsetIndex = 0;
        if(typeId === Addon.typeIds.MARBLE) {
            this._subTypeId = subTypeId || DEFAULT_SUB_TYPE;
            this.enableUpdateTimer();
        }
    };
        
    Addon.prototype.render = function() {
        var offset = this._offsets[this._offsetIndex] || {};
        var offsetX = Math.round(offset.x);
        var offsetY = Math.round(offset.y);
        this._type.render(
            this._context,
            {
                "x": this._col * tileWidth + offsetX,
                "y": this._row * tileHeight + offsetY
            },
            this._subTypeId
        );
    };
    
    Addon.prototype.destruct = function destruct() {
        this.disableUpdateTimer();
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
        this._offsetIndex = 0;
    };
    
    Addon.prototype._update = function() {
        this._offsetIndex += Math.floor(this._offsets.length * UPDATE_FRACTION) % this._offsets.length;
        if(this._offsetIndex >= this._offsets.length) {
            this._offsetIndex = this._offsets.length - 1;
        }
        this._eventEmitter.emit('renderRequest');
    };
    
    Addon.prototype.enableUpdateTimer = function enableUpdateTimer() {
        var scope = this;
        if(!this._updateTimer) {
            this._updateTimer = setInterval(function() {
                scope._update.call(scope)
            }, UPDATE_INTERVAL);
        }
    };
    
    Addon.prototype.disableUpdateTimer = function disableUpdateTimer() {
        if(!!this._updateTimer) {
            clearInterval(this._updateTimer);
            this._updateTimer = null;
        }
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
                    image.src = imageDir + 'marble_light_gray.png';
                    return image;
                })(),
                3: (function() { // Dark gray marble
                    var image = new Image();
                    image.src = imageDir + 'marble_dark_gray.png';
                    return image;
                })(),
            },
            "offsets": [
                {"x": -8, "y": -1},
                {"x": -7, "y": -2},
                {"x": -6, "y": -3},
                {"x": -5, "y": -4},
                {"x": -4, "y": -5},
                {"x": -3, "y": -4},
                {"x": -2, "y": -3},
                {"x": -1, "y": -2},
                {"x": 0, "y": -1},
                {"x": 1, "y": 0}
            ],
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
            "offsets": [{"x": 0, "y": 0}],
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
            "offsets": [{"x": 0, "y": 0}],
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
            "offsets": [{"x": 0, "y": 0}],
            "render": function(context, loc) {
                context.drawImage(this._images.door, loc.x, loc.y);
            }
        }
    };
    
    Addon.updateInterval = OUTER_INTERVAL;
  
    
    return Addon;
});