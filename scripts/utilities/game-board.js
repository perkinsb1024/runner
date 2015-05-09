define([
    'jquery',
    'mout/array/forEach',
    'utilities/game-tile'
], function (
    $,
    forEach,
    GameTile
) {
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    
    /**
     * Validate a level object
     * todo: finish this JSDoc
     */
    var validateLevel = function(level, size) {
        return validateMap(level.map, size) && !!level.background && !!level.music;
    };
    
    /**
     * Validate a map object
     * todo: finish this JSDoc
     */
    var validateMap = function(map, size) {
        return map.length === size;
    };
    
    /**
     * Create a new GameBoard
     * @class
     * todo: finish this JSDoc
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
            // Todo: Shouldn't need col, row - see comment in game-tile.js :: GameTile()
            scope._board[index] = new GameTile(context, col, row, type)
        });
    };
    
    /**
     * Prints GameBoard type string
     * todo: finish this JSDoc
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
//     GameBoard.prototype.setBoard = function(board) { this._board = board; };
//     GameBoard.prototype.getBoard = function() { return this._board; };

    /**
     * Render the board
     */
    GameBoard.prototype.render = function() {
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