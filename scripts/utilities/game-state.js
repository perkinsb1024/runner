define([
    'jquery',
    'mout/array/forEach',
    'mout/object/forOwn',
    'utilities/game-board',
    'utilities/game-tile',
    'utilities/audio-manager',
    'utilities/addon',
    'utilities/player'
], function (
    $,
    forEach,
    forOwn,
    GameBoard,
    GameTile,
    AudioManager,
    Addon,
    Player
) {
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    
    var AUTO_PLAY_MUSIC = false;
    var MAX_ACTIVE_TELEPODS = 1;
    var MAX_TELEPODS = 5;
    var TELEPOD_PROBABILITY_DECAY = 1.6;
       
    /**
     * Creates a new GameState
     * @class
     * todo: finish this JSDoc
     */
    var GameState = function(opts) {
        var scope = this;
        var canvas = opts.canvas;// || throw new Error("No `canvas` provided!");
        var $progressBar = opts.$progressBar;
        var $extraLives = opts.$extraLives;
        var $telepods = opts.$telepods;
        var eventEmitter = opts.eventEmitter;// || throw new Error("No `eventEmitter` provided!");
        var level = opts.level;// || throw new Error("No `level` provided!");
        var paused = opts.paused || false;
        var size = opts.size;// || throw new Error("No `size` provided!");
        var rows = size.rows;// || throw new Error("Size had no `rows` property!");
        var cols = size.cols;// || throw new Error("Size had no `cols` property!");
        var players = opts.players || [];
        var duration = opts.duration || 100 * 1000;
        var music = new Audio();
        var context;
        canvas = canvas.length ? canvas[0] : canvas;
        context = canvas.getContext('2d');
        // todo: make sure to disable retina rendering (2x the memory for the exact same output)
        
        this._canvas = canvas;
        this._$progressBar = $progressBar;
        this._$extraLives = $extraLives;
        this._$telepods = $telepods;
        this._eventEmitter = eventEmitter;
        this._context = context;
        this._board = new GameBoard(context, level, cols, rows);
        this._paused = paused;
        this._gameOver = false;
        this._rows = rows;
        this._cols = cols;
        this._players = players;
        this._duration = duration;
        this._remainingTime = duration;
        this._telepodProbability = 0.96;
        this._numActiveTelepods = 0;
        this._gameOverImage = new Image();
        this._gameOverImage.src = ('images/src/game_over.png');
        this._backgroundMusic = music;
        music.loop = true;
        music.volume = 0.6;
        music.src = level.music;
        if(AUTO_PLAY_MUSIC) {
            this.playMusic();
        }
        
        canvas.width = cols * tileWidth;
        canvas.height = rows * tileHeight;
        
        eventEmitter.on('playerMoveRequest', function(event) {
            scope._processMove.call(scope, event);
        });
        
        this.enableTimer();
    }
    
    /**
     * Render the game
     */
    GameState.prototype.enableTimer = function enableTimer() {
        var scope = this;
        this._interval = setInterval(function() {
            scope.decrementTime.call(scope, 1000)
        }, 1000);
    };
    
    GameState.prototype.disableTimer = function disableTimer() {
        clearInterval(this._interval);
    };
    
    GameState.prototype.render = function render() {
        var scope = this;
        this._board.render();
        forEach(this._players, function(player) {
            player.render(scope._context);
        });
    };
    
    GameState.prototype.pause = function pause() {
        this.disableTimer();
        this._musicWasPlaying = this.isMusicPlaying();
        this.pauseMusic();
        this._paused = true;
    };
    
    GameState.prototype.resume = function resume() {
        if(!this._gameOver) {
            this.enableTimer();
            this._paused = false;
            if(this._musicWasPlaying) {
                this.playMusic();
                delete this._musicWasPlaying;
            }
        }
    };
    
    GameState.prototype.isMusicPlaying = function isMusicPlaying() {
        var music = this._backgroundMusic;
        if(music) {
            return !music.paused;
        }
        return false;
    };
    
    GameState.prototype.playMusic = function playMusic() {
        var music = this._backgroundMusic;
        if(music) {
            if(this._paused) {
                // Game paused, so flag music to start when we resume
                this._musicWasPlaying = true;
            }
            else {
                music.play();
            }
        }
    };
    
    GameState.prototype.pauseMusic = function pauseMusic() {
        var music = this._backgroundMusic;
        if(music) {
            if(this._paused) {
                // Game paused, so erase flag that music should resume when game resumes
                delete this._musicWasPlaying;
            }
            // Even if the game was paused, pause the music, just in case
            music.pause();
        }
    };
    
    GameState.prototype.updateTelepods = function updateTelepod(numTelepods) {
        this._$telepods.html('');
        for(var i = 0; i < numTelepods; i++) {
            this._$telepods.append($('<div class="telepod">'));
        }
    };
    
    GameState.prototype.updateExtraLives = function updateExtraLives(numExtraLives) {
        this._$extraLives.html('');
        for(var i = 0; i < numExtraLives; i++) {
            this._$extraLives.append($('<div class="life">'));
        }
    };
    
    GameState.prototype.decrementTime = function decrementTime(amount) {
        if(typeof amount === 'undefined') {
            amount = 1000;
        }
        this.incrementTime(-1 * amount);
    };
    
    GameState.prototype.incrementTime = function incrementTime(amount) {
        var $progressBar = this._$progressBar;
        var percent;
        if(typeof amount === 'undefined') {
            amount = 1000;
        }
        this._remainingTime += amount;
        percent = (100 * this._remainingTime / this._duration);
        $progressBar.css('width', percent + '%');
        $progressBar.toggleClass('low', percent <= 10).toggleClass('medium', percent > 10 && percent <= 40).toggleClass('high', percent > 40);
        
        if(this._remainingTime <= 0) {
            this.endGame();
        }
    };
    
    GameState.prototype.endGame = function endGame() { 
        var image = this._gameOverImage;       
        this._gameOver = true;
        this.pause();
        
        this._context.drawImage(
            image,
            this._canvas.width / 2 - image.width / 2,
            this._canvas.height / 2 - image.height / 2
        );
    };
    
    /**
     * Add a player to the game
     * todo: finish this JSDoc
     */
    GameState.prototype.addPlayer = function addPlayer(opts) {
        var player = new Player(opts);
        this._players[player.getId()] = player;
    };
    
    GameState.prototype._processMove = function _processMove(event) {
        var playerId = event.player;
        var player = this._players[playerId];
        var position = player.getPosition();
        var move = event.move;
        if(this._paused) {
            return;
        }
        switch(move) {
            case Player.moves.STAND:
                this._stand(player);
                break;
            case Player.moves.LEFT:
                this._moveLeft(player);
                break;
            case Player.moves.RIGHT:
                this._moveRight(player);
                break;
            case Player.moves.CLIMB_UP:
                this._climbUp(player);
                break;
            case Player.moves.CLIMB_DOWN:
                this._climbDown(player);
                break;
            case Player.moves.JUMP:
                this._jump(player);
                break;
            case Player.moves.DROP:
                this._drop(player);
                break;
        }
    };
    
    GameState.prototype._getNewTelepod = function _getNewTelepod(player) {
        var numTelepods = player.getNumTelepods();
        if(player.getType() === Player.types.HUMAN) {
            if(numTelepods < MAX_TELEPODS && this._telepodProbability > Math.random()) {
                this._telepodProbability /= TELEPOD_PROBABILITY_DECAY;
                ++numTelepods;
                player.setNumTelepods(numTelepods);
                this.updateTelepods(numTelepods);
            }
        }
    };
    
    GameState.prototype._handleTelepod = function _handleTelepod(player, tile, telepod) {
        var position = player.getPosition();
        var board = this._board;

        player.setPosition(position);
        if(player.getType() === Player.types.OPPONENT) {
            tile.removeAddon(telepod);
            delete telepod;
            --(this._numActiveTelepods);
            position.x = Math.floor(Math.random() * board.getCols());
            position.y = Math.floor(Math.random() * board.getRows());
            player.setPosition(position);
        };
    };
    
    GameState.prototype._handleAddons = function _handleAddons(player, tile, position) {
        var scope = this;
        var addons = tile.getAddons();
        forEach(addons, function(addon) {
            var type = addon.getType();
            switch(type) {
                case Addon.typeIds.MARBLE:
                    break;
                case Addon.typeIds.TELEPOD:
                    scope._handleTelepod(player, tile, addon)
                    break;
                case Addon.typeIds.NEUTRINO_CAN:
                    break;
                case Addon.typeIds.DOOR:
                    break;
            }
        });
    };
    
    GameState.prototype._handleSwitch = function _handleSwitch(player, tile, position) {
        // todo: Handle jumping over a switch
        if(tile.getType() === GameTile.typeIds.SWITCH) {
            if(tile.getState() === GameTile.switchState.OFF && player.getType() === Player.types.HUMAN) {
                AudioManager.playSound(AudioManager.soundNames.SWITCH_ON);
                tile.setState(GameTile.switchState.ON);
                this._getNewTelepod(player);
            } else if(tile.getState() === GameTile.switchState.ON && player.getType() === Player.types.OPPONENT) {
                AudioManager.playSound(AudioManager.soundNames.SWITCH_OFF);
                tile.setState(GameTile.switchState.OFF);
            }
        }
    };
    
    GameState.prototype._handleHole = function _handleHole(player, tile, position) {
        var board = this._board;
        if(tile.getType() === GameTile.typeIds.HOLE && position.y < board.getRows() - 1) {
            position.y++;
            position.posture = Player.postures.FALL;
            position.direction = Player.directions.FORWARD;
        }
        player.setPosition(position);
    };
    
    GameState.prototype._evaluatePlayerPosition = function _evaluatePlayerPosition(player, tile, position) {
        // todo: only do one thing?
        this._handleHole(player, tile, position);
        this._handleSwitch(player, tile, position);
        this._handleAddons(player, tile, position);
    };
    
    GameState.prototype._stand = function _stand(player) {
        var position = player.getPosition();
        position.direction = Player.directions.FORWARD;
        position.posture = Player.postures.STAND;
        
        player.setPosition(position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._moveLeft = function _moveLeft(player) {
        var position = player.getPosition();
        var board = this._board;
        var tile, switchState;
        // Move player left, if possible
        if(position.x > 0) {
            position.direction = Player.directions.LEFT;
            position.posture = Player.postures.RUN;
            position.x--;
        }
        tile = board.getTile(position.x, position.y);
        player.setPosition(position);
        
        this._evaluatePlayerPosition(player, tile, position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._moveRight = function _moveRight(player) {
        var position = player.getPosition();
        var board = this._board;
        var tile, switchState;
        // Move player right, if possible
        if(position.x < board.getCols() - 1) {
            position.direction = Player.directions.RIGHT;
            position.posture = Player.postures.RUN;
            position.x++;
        }
        tile = board.getTile(position.x, position.y);
        player.setPosition(position);
        
        this._evaluatePlayerPosition(player, tile, position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._climbUp = function _climbUp(player) {
        var position = player.getPosition();
        var board = this._board;
        var tile = board.getTile(position.x, position.y);
        if(position.y > 0 && tile && tile.getType() == GameTile.typeIds.LADDER) {
            position.y--;
            position.posture = Player.postures.CLIMB;
            position.direction = Player.directions.BACKWARD;
            player.setPosition(position);
            
            tile = board.getTile(position.x, position.y);
            this._evaluatePlayerPosition(player, tile, position);
            this._eventEmitter.emit('renderRequest');
        }
    };
    
    GameState.prototype._climbDown = function _climbDown(player) {
        var position = player.getPosition();
        var board = this._board;
        var tile = board.getTile(position.x, position.y + 1);
        if(position.y < board.getRows() - 1 && tile && tile.getType() == GameTile.typeIds.LADDER) {
            position.y++;
            position.posture = Player.postures.CLIMB;
            position.direction = Player.directions.BACKWARD;
            player.setPosition(position);
            
            tile = board.getTile(position.x, position.y);
            this._evaluatePlayerPosition(player, tile, position);
            this._eventEmitter.emit('renderRequest');
        }
    };
    
    GameState.prototype._jump = function _jump(player) {
        var position = player.getPosition();
        var board = this._board;
        var didFall = false;
        var didJump = false;
        var tile;
        if(position.direction === Player.directions.LEFT && position.x > 1) {
            position.posture = Player.postures.JUMP;
            position.x-=2;
            didJump = true;
        } else if(position.direction === Player.directions.RIGHT && position.x < this._board.getCols() - 2) {
            position.posture = Player.postures.JUMP;
            position.x+=2;
            didJump = true;
        }
        tile = board.getTile(position.x, position.y);
        if(position.y < board.getRows() - 1 && tile.getType() === GameTile.typeIds.HOLE) {
            position.y++;
            didFall = true;
        }

        player.setPosition(position);
        
        if(didJump) {
            AudioManager.playSound(AudioManager.soundNames.JUMP);
        }
        
        this._evaluatePlayerPosition(player, tile, position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._drop = function _drop(player) {
        var numTelepods = player.getNumTelepods();
        var position = player.getPosition();
        if(numTelepods > 0 && this._numActiveTelepods < MAX_ACTIVE_TELEPODS) {
            if(this._createTelepod(position)) {
                --numTelepods;
                ++(this._numActiveTelepods);
                player.setNumTelepods(numTelepods);
                this.updateTelepods(numTelepods);
                AudioManager.playSound(AudioManager.soundNames.DROP);
            }
        }
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._createTelepod = function _createTelepod(position) {
        var context = this._context;
        var col = position.x;
        var row = position.y;
        var typeId = Addon.typeIds.TELEPOD;
        var telepod = new Addon(context, col, row, typeId);
        var tile = this._board.getTile(col, row);
        var addons = tile.getAddons();
        var shouldAdd = true;
        forOwn(addons, function(addon) {
            if(addon.getType === Addon.typeIds.TELEPOD) {
                shouldAdd = false;
            }
        });
        
        if(shouldAdd) {
            tile.addAddon(telepod);
            return true;
        }
        return false;
    };
    
    return GameState;
});