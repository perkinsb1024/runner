define([
    'jquery',
    'mout/array/forEach',
    'utilities/game-tile',
    'utilities/addon'
], function (
    $,
    forEach,
    GameTile,
    Addon
) {
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    
    /**
     * Validate a level object
     */
    var validateLevel = function(level, size) {
        return validateMap(level.map, size) && !!level.background && !!level.music;
    };
    
    /**
     * Validate a map object
     */
    var validateMap = function(map, size) {
        return map.length === size;
    };
    
    /**
     * Create a new GameBoard
     * @class
     */
    var GameBoard = function GameBoard(context, level, cols, rows) {
        var scope = this;
        this._context = context;
        this._level = level;
        this._board = [];
        this._rows = rows;
        this._cols = cols;
        this._backgroundImage = new Image();
        this._backgroundImage.src = level.background.imageData;
        
        
        this._board.length = (rows * cols);
        
        if(!validateLevel(level, rows * cols)) {
            throw new Error('Invalid level!');
        }
        
        forEach(level.map, function(type, index) {
            var col = index % cols;
            var row = (index - col) / cols;
            var tile = new GameTile(context, col, row, type, level.floorTypeId);
            scope._board[index] = tile;
        });
    };
    
    /**
     * Prints GameBoard type string
     */
    GameBoard.prototype.toString = function() { return "[GameBoard object]"; };
    GameBoard.prototype.getTile = function getTile(col, row) {
        return this._board[row * this._cols + col];
    };
    GameBoard.prototype.getSize = function getSize() {
        return {
            cols: this._cols,
            rows: this._rows
        };
    };
    GameBoard.prototype.getCols = function getCols() {
        return this._cols;
    };
    GameBoard.prototype.getRows = function getRows() {
        return this._rows;
    };
    GameBoard.prototype.getRandomPosition = function getRandomPosition() {
        return {
            x: Math.floor(Math.random() * this._cols),
            y: Math.floor(Math.random() * this._rows)
        };
    };
    GameBoard.prototype.allSwitchesActive = function allSwitchesActive() {
        var allSwitchesActive = true;
        forEach(this._board, function(tile) {
            if(tile.getType() === GameTile.typeIds.SWITCH && tile.getState() === GameTile.switchState.OFF) {
                allSwitchesActive = false;
                return false;
            }
        });
        return allSwitchesActive;
    };
    
    /**
     * Destroy the first door found
     */
    GameBoard.prototype.destroyDoor = function destroyDoor() {
        var doorDestroyed = false;
        forEach(this._board, function(tile) {
            var addons = tile.getAddons();
            forEach(addons, function(addon) {
                if(addon.getType() === Addon.typeIds.DOOR) {
                    tile.removeAddon(addon);
                    delete addon;
                    doorDestroyed = true;
                    return false; // break out of loop
                };
            });
            if(doorDestroyed) {
                return false; // break out of loop
            }
        });
        return doorDestroyed;
    };
    
    /**
     * Render the board
     */
    GameBoard.prototype.render = function render() {
        var scope = this;
        var drawBackground = function() {
            var x, y;
            var context = scope._context;
            var backgroundImage = scope._backgroundImage;
            var backgroundWidth = scope._level.background.size.width;
            var backgroundHeight = scope._level.background.size.height;
            var width = scope._cols * tileWidth;
            var height = scope._rows * tileHeight - backgroundHeight;
            for(y = 0; y < height; y += backgroundHeight) {
                for(x = 0; x < width; x += backgroundWidth) {
                    context.drawImage(backgroundImage, x, y);
                }
            }
        };
        
        var drawTiles = function() {  
            forEach(scope._board, function(tile) {
                tile.render(); 
            });
        };
        
        drawBackground();
        drawTiles();
    };

    return GameBoard;
});