define([
    'jquery',
    'mout/array/remove',
    'mout/array/forEach',
    'mout/array/filter',
    'mout/object/forOwn',
    'mout/queryString/getParam',
    'utilities/game-board',
    'utilities/game-tile',
    'utilities/audio-manager',
    'utilities/addon',
    'utilities/player'
], function (
    $,
    remove,
    forEach,
    filter,
    forOwn,
    getParam,
    GameBoard,
    GameTile,
    AudioManager,
    Addon,
    Player
) {
    // To do: Centralize drawing splash, game over and time expired image
    
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    
    var TIME_SCALE_FACTOR = 1;
    var AUTO_PLAY_MUSIC = true;
    var RELOAD_LEVEL_DELAY = 1000;
    var SPLASH_DELAY = 2500;
    var MAX_TOTAL_NEUTRINO_CANS = 1;
    var MAX_ACTIVE_DOORS = 1;
    var MAX_ACTIVE_TELEPODS = 1;
    var MAX_ACTIVE_MARBLES = 1;
    var MAX_TELEPODS = 5;
    var DEFAULT_TELEPOD_PROBABILITY = 0.96;
    var TELEPOD_PROBABILITY_DECAY = 1.6;
    var LADDER_OFFSET = 0.5; // Fraction of ladder per climb
       
    /**
     * Creates a new GameState
     * @class
     * todo: finish this JSDoc
     */
    var GameState = function(opts) {
        var scope = this;
        var canvas = opts.canvas;// || throw new Error("No `canvas` provided!");
        var $gameStats = opts.$gameStats;// || throw new Error("No `$gameStats` provided!");
        var $progressBar = opts.$progressBar;
        var $extraLives = opts.$extraLives;
        var $telepods = opts.$telepods;
        var eventEmitter = opts.eventEmitter;// || throw new Error("No `eventEmitter` provided!");
        var levels = opts.levels;// || throw new Error("No `level` provided!");
        var currentLevel = opts.currentLevel || 0;
        var level = levels[currentLevel];
        var paused = opts.paused || false;
        var size = opts.size;// || throw new Error("No `size` provided!");
        var cols = size.cols || 40; // || throw new Error("Size had no `cols` property!");
        var rows = size.rows || 8; // || throw new Error("Size had no `rows` property!");
        var players = opts.players || {};
        var duration = opts.duration || 100 * 1000;
        var context;
        canvas = canvas.length ? canvas[0] : canvas;
        context = canvas.getContext('2d');
        
        this._canvas = canvas;
        this._$gameStats = $gameStats;
        this._$progressBar = $progressBar;
        this._$extraLives = $extraLives;
        this._$telepods = $telepods;
        this._eventEmitter = eventEmitter;
        this._context = context;
        this._cols = cols;
        this._rows = rows;
        this._levels = levels;
        this._currentLevel = currentLevel;
        this._preLevel = undefined;
        this._preLevelTimer = undefined;
        this._paused = paused;
        this._gameOver = false;
        this._players = players;
        this._duration = duration;
        this._remainingTime = duration;
        this._telepodProbability = DEFAULT_TELEPOD_PROBABILITY;
        this._numActiveTelepods = 0;
        this._numTotalNeutrinoCans = 0;
        this._numActiveDoors = 0;
        this._activeMarbles = [];
        this._gameOverImage = new Image();
        this._gameOverImage.src = ('images/src/game_over.png');
        this._timeExpiredImage = new Image();
        this._timeExpiredImage.src = ('images/src/time_expired.png');
        if(!AUTO_PLAY_MUSIC) {
            AudioManager.disableBackgroundMusic();
        }
        
        canvas.width = cols * tileWidth;
        canvas.height = rows * tileHeight;
        
        eventEmitter.on('playerMoveRequest', function(event) {
            scope._processMove.call(scope, event);
        });
        eventEmitter.on('aiInfoRequest', function(event) {
            scope._getAiInfo.call(scope, event);
        });
                
        this._loadLevel(level);
        // To do: eventEmitter doesn't get aiInfoRequest until the second call to loadLevel. Fix that
        this._loadLevel(level);
    }
    
    GameState.prototype._enableTimer = function _enableTimer() {
        var scope = this;
        if(!this._interval) {   
            this._interval = setInterval(function() {
                scope.decrementTime.call(scope, Addon.updateInterval);
                scope._intervalLogic.call(scope);
            }, Addon.updateInterval / TIME_SCALE_FACTOR);
        }
    };
    
    GameState.prototype._disableTimer = function _disableTimer() {
        clearInterval(this._interval);
        this._interval = null;
    };
    
    /**
     * Render the game
     */
    GameState.prototype.render = function render() {
        var scope = this;
        if(!this._gameOver && !this._paused) {
            this._board.render();
            forOwn(this._players, function(player) {
                player.render(scope._context);
            });
        }
    };
    
    GameState.prototype.resume = function resume() {
        if(this._preLevelTimer) {
            // Prevent the level from automatically starting
            clearTimeout(this._preLevelTimer);
            this._preLevelTimer = undefined;
        }
        if(!this._gameOver && this._paused) {
            AudioManager.playBackgroundMusic();
            if(this._preLevel) {
                this._startLevel();
            }
            else {
                this._paused = false;
                this._enableTimer();
                forEach(this._activeMarbles, function(marble) {
                    marble.enableUpdateTimer();
                });
            }
        }
    };
    
    GameState.prototype.pause = function pause() {
        if(this._preLevelTimer) {
            // Prevent the level from automatically starting
            clearTimeout(this._preLevelTimer);
            this._preLevelTimer = undefined;
        }
        if(!this._paused) {
            AudioManager.pauseBackgroundMusic();
            this._disableTimer();
            this._paused = true;
            forEach(this._activeMarbles, function(marble) {
                marble.disableUpdateTimer();
            });
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
        var percent;
        var scope = this;
        var image = this._timeExpiredImage;
        var $progressBar = this._$progressBar;
        var remainingTime = this._remainingTime;
        var duration = this._duration;
        if(typeof amount === 'undefined') {
            amount = 1000;
        }
        remainingTime += amount;
        if(remainingTime > duration) {
            remainingTime = duration;
        }
        percent = (100 * remainingTime / duration);
        $progressBar.css('width', percent + '%');
        $progressBar.toggleClass('low', percent <= 10).toggleClass('medium', percent > 10 && percent <= 40).toggleClass('high', percent > 40);
        
        if(remainingTime <= 0) {
            this._context.drawImage(
                image,
                this._canvas.width / 2 - image.width / 2,
                this._canvas.height / 2 - image.height / 2
            );
            forOwn(this._players, function(player) {
                if(player.getType() === Player.types.HUMAN) {
                    scope.loseLife(player);
                };
            });
        }
        this._remainingTime = remainingTime;
    };
    
    GameState.prototype.loseLife = function loseLife(player) {
        var scope = this;
        var level = this._level;
        var lives = player.getNumExtraLives();
        
        if(player.getType() === Player.types.HUMAN) {
            if(lives === 0) {
                this.endGame();
            }
            else {
                --lives;
                player.setNumExtraLives(lives);
                this.updateExtraLives(lives);
                setTimeout(function() {
                    scope._loadLevel.call(scope, level);
                }, RELOAD_LEVEL_DELAY);
                this.pause();
            }
        }
    };
    
    GameState.prototype.setLevel = function setLevel(levelIndex) {
        var level = this._levels[levelIndex];
        if(!!level) {
            this._currentLevel = levelIndex;
            this._loadLevel(level);
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
        this._eventEmitter.emit('renderRequest');
    };
    
    /**
     * Add a player to the game
     * todo: finish this JSDoc
     */
    GameState.prototype.addPlayer = function addPlayer(opts) {
        var player = new Player(opts);
        this._players[player.getId()] = player;
    };
    
    GameState.prototype._loadLevel= function _loadLevel(level) {
        var scope = this;
        var players = this._players;
        var activeMarbles = this._activeMarbles;
        var canvas = this._canvas;
        var context = this._context;
        var cols = this._cols;
        var rows = this._rows;
        var duration = this._duration;
                
        // Make sure the game is paused
        this.pause();
        
        // Reset variables
        this._telepodProbability = DEFAULT_TELEPOD_PROBABILITY;
        this._numActiveTelepods = 0;
        this._numTotalNeutrinoCans = 0;
        this._numActiveDoors = 0;
        this._activeMarbles = [];
        this._board = new GameBoard(context, level, cols, rows);
        this._level = level;
        this._preLevel = true;
        this.incrementTime(duration);
        
        // Reset background music
        AudioManager.setBackgroundMusicSource(level.music);
        
        // Reset players
        forOwn(players, function(player, index, players) {
            if(player.getType() === Player.types.HUMAN) {
                // Humans have state, so must be maintained, just reset their position to the initial position
                player.resetPosition();
                player.setNumTelepods(0);
                player.setNumNeutrinoCans(0);
                player.setIsAlive(true);
                scope.updateTelepods(0);
            }
            else if(player.getType() === Player.types.OPPONENT) {
                // Opponents are stateless and generated from the level object, so can be deleted
                // Prevent the timers and listeners from running after they're removed
                player.destruct();
                delete players[index];
            }
        });
        
        // Create opponenets
        forEach(level.opponents, function(opponentInfo, index) {
            scope.addPlayer({
                name: 'Opponent ' + (index + 1),
                eventEmitter: scope._eventEmitter,
                movementStrategy: 'AI',
                initialPosition: opponentInfo.position,
                intelligence: opponentInfo.intelligence,
                type: Player.types.OPPONENT
            });
        });
        
        // Load the level splash image
        this._loadSplashImage(level.splashImage);
        
        this._preLevelTimer = setTimeout(function() {
            // Remove splash screen and begin level
            scope._startLevel();
        }, SPLASH_DELAY);
    };
    
    GameState.prototype._loadSplashImage = function _loadSplashImage(splashImage) {
        var scope = this;
        var tileSize = GameTile.getTileSize();
        var image = new Image();
        var size = splashImage.size;
        
        // Hide game stats
        this._$gameStats.hide();
        
        // Draw splash image
        image.onload = function() {
            scope._context.drawImage(image, 0, 0, size.width, size.height);
        };
        image.src = splashImage.path;
    };
    
    GameState.prototype._startLevel = function _startLevel() {
        this._preLevel = undefined;
        this._preLevelTimer = undefined;
        
        // Show game stats
        this._$gameStats.show();
        
        // Clear canvas
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        
        // Play background music
        AudioManager.playBackgroundMusic();
        this.resume();
    };
    
    GameState.prototype._processMove = function _processMove(event) {
        var playerId = event.player;
        var player = this._players[playerId];
        var move = event.move;
        if(this._paused || !player) {
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
            case Player.moves.DIE:
                this._die(player);
                break;
        }
    };
    
    GameState.prototype._getAiInfo = function _getAiInfo(event) {
        var position, offset, currentAction, info;
        var scope = this;
        var playerId = event.player;
        var player = this._players[playerId];
        var board = this._board;
        
        var distanceBetween = function distanceBetween(a, b) {
            return Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y));
        };
        
        var getNearestHuman = function getNearestHuman(position) {
            var closest = null;
            var nearestHuman = null;
            forOwn(scope._players, function(player) {
                var distance;
                if(player.getIsAlive() && player.getType() === Player.types.HUMAN) {
                    distance = distanceBetween(player.getPosition, position);
                    if(!nearestHuman || (distance < closest)) {
                        closest = distance;
                        nearestHuman = player.getPosition();
                    }
                }
            });
            return nearestHuman;
        };
        
        var getLaddersOnRow = function getLaddersOnRow(row) {
            var tile;
            var ladders = [];
            if(row < board.getRows()) {
                for(var col = 0; col < board.getCols(); col++) {
                    tile = board.getTile(col, row);
                    if(tile.getType() === GameTile.typeIds.LADDER) {
                        ladders.push({
                            x: col,
                            y: row
                        });
                    }
                }
            }
                        
            return ladders;
        };
        
        if(player && !this._paused) {
            position = player.getPosition();
            offset = player.getOffset();
            currentAction = player.getCurrentAction();
            info = {
                Player: {
                    // to do: this just makes me feel dirty all over
                    // But ai can't require Player because of circular dependency
                    actions: Player.actions
                },
                player: playerId,
                position: position,
                offset: offset,
                currentAction: currentAction,
                nearestHuman: getNearestHuman(position),
                laddersOnThisRow: getLaddersOnRow(position.y),
                laddersOnLowerRow: getLaddersOnRow(position.y + 1)
            };
            
            this._eventEmitter.emit('aiInfo', info);
        }
    };
    
    GameState.prototype._getNewTelepod = function _getNewTelepod(player) {
        var numTelepods = player.getNumTelepods();
        ++numTelepods;
        player.setNumTelepods(numTelepods);
        this.updateTelepods(numTelepods);
    };
    
    GameState.prototype._getNewTelepodIfPossible = function _getNewTelepodIfPossible(player) {
        var numTelepods = player.getNumTelepods();
        if(player.getType() === Player.types.HUMAN) {
            if(numTelepods < MAX_TELEPODS && this._telepodProbability > Math.random()) {
                this._telepodProbability /= TELEPOD_PROBABILITY_DECAY;
                this._getNewTelepod(player);
            }
        }
    };
    
    GameState.prototype._createDoorIfPossible = function _createDoorIfPossible(player) {
        var position, door, tile, addons;
        var board = this._board;
        var context = this._context;
        var eventEmitter = this._eventEmitter;
        var numNeutrinoCans = player.getNumNeutrinoCans();
        var doorTypeId = Addon.typeIds.DOOR;
        if(!(this._numActiveDoors < MAX_ACTIVE_DOORS && // Must have fewer than max number of allowed doors
            player.getType() === Player.types.HUMAN && // Active player (player who flipped switch) must be human 
            numNeutrinoCans >= MAX_TOTAL_NEUTRINO_CANS && // Active player must have enough neutrino cans
            board.allSwitchesActive())) // All switchs must be active
        {
            // Conditions not met to create door
            return false;
        }
        
        do {
            position = board.getRandomPosition();
            tile = board.getTile(position.x, position.y);
            addons = tile.getAddons();
        }
        while(addons.length > 0 || tile.getType() != GameTile.typeIds.FLOOR);
        
        door = new Addon(context, eventEmitter, position.x, position.y, doorTypeId);
        tile.addAddon(door);
        ++(this._numActiveDoors);
        return true;
    };
    
    GameState.prototype._destroyDoorIfPossible = function _destroyDoorIfPossible(player) {
        var board = this._board;
        if(!(this._numActiveDoors > 0 && // Must have at least one door active
            player.getType() === Player.types.OPPONENT && // Active player (player who flipped switch) must be opponent 
            !board.allSwitchesActive())) // At least one switch must be inactive
        {
            // Conditions not met to destroy door
            return false;
        }
        
        board.destroyDoor();
        --(this._numActiveDoors);
        
        // Recursively check if there are any more doors to destroy
        this._destroyDoorIfPossible(player); 
        
        return true;
    };
    
    GameState.prototype._createNeutrinoCanIfPossible = function _createNeutrinoCanIfPossible() {
        var position, neutrinoCan, tile, addons;
        var context = this._context;
        var eventEmitter = this._eventEmitter;
        var board = this._board;
        var neutrinoCanTypeId = Addon.typeIds.NEUTRINO_CAN;
        var neutrinoCanProbability = 1 - (1.1 * this._remainingTime / this._duration);
        // Create neutrino can if we haven't reached max and if probability allows it
        if(this._numTotalNeutrinoCans < MAX_TOTAL_NEUTRINO_CANS && neutrinoCanProbability > Math.random()) {
            do {
                position = board.getRandomPosition();
                tile = board.getTile(position.x, position.y);
                addons = tile.getAddons();
            }
            while(addons.length > 0 || tile.getType() != GameTile.typeIds.FLOOR);
            
            neutrinoCan = new Addon(context, eventEmitter, position.x, position.y, neutrinoCanTypeId);
            tile.addAddon(neutrinoCan);
            ++(this._numTotalNeutrinoCans);
            return true;
        }
        return false;
    };
    
    GameState.prototype._createMarbleIfPossible = function _createMarbleIfPossible() {
        var marbleType, marbleRandomValue, marble, postion, tile;
        var level = this._level;
        var board = this._board;
        var context = this._context;
        var eventEmitter = this._eventEmitter;
        var activeMarbles = this._activeMarbles;
        var marbleProbability = this._level.marbleProbability;    
        var marbleTypeCumulativeProbability = level.marbleTypeCumulativeProbability;
        
        // Create marble if was haven't reached max number and probability allows it
        var random = Math.random();
        if(activeMarbles.length < MAX_ACTIVE_MARBLES && marbleProbability > random) {
            marbleRandomValue = Math.random();
            if(marbleRandomValue < marbleTypeCumulativeProbability[Addon.subTypeIds.RED_MARBLE]) {
                marbleType = Addon.subTypeIds.RED_MARBLE;
            }
            else if(marbleRandomValue < marbleTypeCumulativeProbability[Addon.subTypeIds.PURPLE_MARBLE]) {
                marbleType = Addon.subTypeIds.PURPLE_MARBLE
            }
            else if(marbleRandomValue < marbleTypeCumulativeProbability[Addon.subTypeIds.LIGHT_GRAY_MARBLE]) {
                marbleType = Addon.subTypeIds.LIGHT_GRAY_MARBLE;
            }
            else {
                marbleType = Addon.subTypeIds.DARK_GRAY_MARBLE;
            }
            position = board.getRandomPosition();
            position.x = 0;
            tile = board.getTile(position.x, position.y);
            marble = new Addon(context, eventEmitter, position.x, position.y, Addon.typeIds.MARBLE, marbleType);
            activeMarbles.push(marble);
            tile.addAddon(marble);
        }
    };
    
    GameState.prototype._deleteMarble = function _deleteMarble(marble) {
        var board = this._board;
        var activeMarbles = this._activeMarbles;
        var position = marble.getPosition();
        var tile = board.getTile(position.x, position.y);
        tile.removeAddon(marble);
        remove(activeMarbles, marble);
        marble.destruct();
        marble = undefined;
    };
    
    GameState.prototype._updateMarbles = function _updateMarbles() {
        var position, tile, playerPosition;
        var scope = this;
        var board = this._board;
        var players = this._players;
        var activeMarbles = this._activeMarbles;
        forEach(activeMarbles, function(marble) {
            position = marble.getPosition();
            tile = board.getTile(position.x, position.y);
            tile.removeAddon(marble);
            if(position.x < board.getCols() - 1) { 
                // Marble still has room to go
                ++position.x;
                tile = board.getTile(position.x, position.y); // New tile
                marble.setPosition(position);
                tile.addAddon(marble);
                forOwn(players, function(player) {
                    playerPosition = player.getPosition();
                    if(playerPosition.x === position.x && playerPosition.y === position.y) {
                        scope._handleMarble(player, tile, marble);
                    }
                });
                // To do: This audio sounds AWFUL. Why is it so bad?
//                 AudioManager.playSound(AudioManager.soundNames.MARBLE);
            }
            else {
                // Marble is at far right of screen
                scope._deleteMarble(marble);
            }
        });
    };
        
    GameState.prototype._handleMarble = function _handleMarble(player, tile, marble) {
        var marbleType = marble.getSubType();
        var position = player.getPosition();
        var duration = this._duration;
        var board = this._board;

        switch(marbleType) {
            case Addon.subTypeIds.RED_MARBLE:
                if(player.getType() === Player.types.HUMAN) {
                    this.decrementTime(Math.floor(duration * 0.1));
                }
                break;
            case Addon.subTypeIds.PURPLE_MARBLE:
                if(player.getType() === Player.types.HUMAN) {
                    this.incrementTime(Math.floor(duration * 0.1));
                }
                break;
            case Addon.subTypeIds.LIGHT_GRAY_MARBLE:
                if(player.getType() === Player.types.HUMAN) {
                    this._getNewTelepod(player);
                }
                break;
            case Addon.subTypeIds.DARK_GRAY_MARBLE:
                this._teleportPlayer(player);
                break;
        }
        this._deleteMarble(marble);
        return false;
    };
    
    GameState.prototype._handleTelepod = function _handleTelepod(player, tile, telepod) {
        var position = player.getPosition();

        if(player.getType() === Player.types.OPPONENT) {
            tile.removeAddon(telepod);
            telepod = null;
            --(this._numActiveTelepods);
            this._teleportPlayer(player);
            return true;
        }
        return false;
    };
    
    GameState.prototype._handleNeutrinoCan = function _handleNeutrinoCan(player, tile, neutrinoCan) {
        var position = player.getPosition();
        var board = this._board;
        var numPlayerNeutrinoCans = player.getNumNeutrinoCans();

        if(player.getType() === Player.types.HUMAN) {
            ++numPlayerNeutrinoCans;
            tile.removeAddon(neutrinoCan);
            neutrinoCan = null;
            player.setNumNeutrinoCans(numPlayerNeutrinoCans);
            AudioManager.playSound(AudioManager.soundNames.CAN);
            this._createDoorIfPossible(player);
        }
        return false;
    };
    
    GameState.prototype._handleDoor = function _handleDoor(player, tile, neutrinoCan) {
        var scope = this;
        var position = player.getPosition();
        if(player.getType() === Player.types.HUMAN) {
            AudioManager.playSound(AudioManager.soundNames.TELEPORT);
            position.posture = Player.postures.GONE;
            position.direction = Player.directions.BACKWARD;
            player.setPosition(position);
            this.pause();
            while(this._numActiveDoors > 0) {
                this._board.destroyDoor();
                --(this._numActiveDoors);
            }
            this._eventEmitter.emit('renderRequest');

            setTimeout(function() {
                var levels = scope._levels;
                var currentLevel = scope._currentLevel;
                ++currentLevel;
                
                if(currentLevel < levels.length) {
                    scope._currentLevel = currentLevel;
                    scope._loadLevel.call(scope, levels[currentLevel]);
                }
                else {
                    console.log('You win!');
                    scope.endGame();
                    return true;
                }
            }, RELOAD_LEVEL_DELAY);
            this.pause();
        }
        return false;
    };
    
    GameState.prototype._handleAddons = function _handleAddons(player, tile, position) {
        var scope = this;
        var addons = tile.getAddons();
        forEach(addons, function(addon) {
            var type = addon.getType();
            switch(type) {
                case Addon.typeIds.MARBLE:
                    return scope._handleMarble(player, tile, addon);
                    break;
                case Addon.typeIds.TELEPOD:
                    return scope._handleTelepod(player, tile, addon)
                    break;
                case Addon.typeIds.NEUTRINO_CAN:
                    return scope._handleNeutrinoCan(player, tile, addon)
                    break;
                case Addon.typeIds.DOOR:
                    return scope._handleDoor(player, tile, addon);
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
                this._getNewTelepodIfPossible(player);
                this._createDoorIfPossible(player);
            } else if(tile.getState() === GameTile.switchState.ON && player.getType() === Player.types.OPPONENT) {
                AudioManager.playSound(AudioManager.soundNames.SWITCH_OFF);
                tile.setState(GameTile.switchState.OFF);
                this._destroyDoorIfPossible(player);
            }
        }
        return false;
    };
    
    GameState.prototype._handleOpponent = function _handleOpponent(player, tile, position) {
        var playerType = player.getType();
        var otherType = (playerType === Player.types.HUMAN ? Player.types.OPPONENT : Player.types.HUMAN);
        var playerWhoDied = null;
        forOwn(this._players, function(tempPlayer) {
            var tempPosition = tempPlayer.getPosition();
            if(tempPlayer.getType() === otherType) {
                if(tempPosition.x === position.x && tempPosition.y === position.y) {
                    if(playerType === Player.types.HUMAN) {
                        player.die();
                        playerWhoDied = player;
                        // Break out of loop
                        return false;
                    }
                    else {
                        tempPlayer.die();
                        playerWhoDied = tempPlayer;
                        // Break out of loop (to do: if there are ever multiple humans, this logic will need to change)
                        return false;
                    }
                }
            }
        });
        if(!!playerWhoDied) {
            this.loseLife(playerWhoDied);
        }
        return false;
    };
    
    GameState.prototype._handleHole = function _handleHole(player, tile, position) {
        var board = this._board;
        if(tile.getType() === GameTile.typeIds.HOLE && position.y < board.getRows() - 1) {
            position.y++;
            position.posture = Player.postures.FALL;
            position.direction = Player.directions.FORWARD;
            player.setPosition(position);
            // Check if the player is still falling
            tile = board.getTile(position.x, position.y);
            if(tile.getType() === GameTile.typeIds.HOLE) {
                player.setCurrentAction(Player.actions.FALLING);
            }
            else {
                player.setCurrentAction(Player.actions.NONE);
            }
        }
        return false;
    };
    
    GameState.prototype._evaluatePlayerPosition = function _evaluatePlayerPosition(player, position) {
        // todo: only do one thing?
        // Instead of taking tile as a parameter, get it based on the new position since
            // position could have changed since we last retrieved tile
        var scope = this;
        var functions = [this._handleOpponent, this._handleSwitch, this._handleAddons, this._handleHole];
        var tile = this._board.getTile(position.x, position.y);
        var needsEvaluationAgain = false;
        forEach(functions, function(fn) {
            needsEvaluationAgain = fn.call(scope, player, tile, position);
            if(needsEvaluationAgain) {
                return false; // break out of loop
            }
        });
        if(needsEvaluationAgain) {
            // The player's position has changed, so evaluate new state
            
            // todo: instead of evaluating right away, mark the player as dirty and evaluate again on the next move, block moves while player is dirty
            this._evaluatePlayerPosition(player, player.getPosition());
        }
        this._eventEmitter.emit('renderRequest');
    };

    GameState.prototype._teleportPlayer = function _teleportPlayer(player, position) {
        var board = this._board;
        if(!position) {
            position = board.getRandomPosition();
        }
        player.setPosition(position);
        player.setCurrentAction(Player.actions.NONE);
        player.setOffset(Player.defaultOffset);
        AudioManager.playSound(AudioManager.soundNames.TELEPORT);
        this._evaluatePlayerPosition(player, position);
    };
        
    GameState.prototype._stand = function _stand(player) {
        var position = player.getPosition();
        var currentAction = player.getCurrentAction();
        // To do: This is terribly un-DRY, repeating this in every move function. Clean this up
        if(currentAction === Player.actions.CLIMBING) {
            // Don't want to reset image if climbing
            return;
        }
        else if(currentAction === Player.actions.FALLING) {
            // Make sure the player keeps falling even if not trying to move
            return this._evaluatePlayerPosition(player, position);
        }
        position.direction = Player.directions.FORWARD;
        position.posture = Player.postures.STAND;
        
        player.setPosition(position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._moveLeft = function _moveLeft(player) {
        var tile;
        var position = player.getPosition();
        var board = this._board;
        var currentAction = player.getCurrentAction();
        if(currentAction === Player.actions.CLIMBING) {
            return;
        }
        else if(currentAction === Player.actions.FALLING) {
            // Not allowed to move while actively falling
            return this._evaluatePlayerPosition(player, position);
        }
        // Move player left, if possible
        if(position.x > 0) {
            position.direction = Player.directions.LEFT;
            position.posture = Player.postures.RUN;
            position.x--;
        }
        tile = board.getTile(position.x, position.y);
        player.setPosition(position);
        
        this._evaluatePlayerPosition(player, position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._moveRight = function _moveRight(player) {
        var tile;
        var position = player.getPosition();
        var board = this._board;
        var currentAction = player.getCurrentAction();
        if(currentAction === Player.actions.CLIMBING) {
            return;
        }
        else if(currentAction === Player.actions.FALLING) {
            // Not allowed to move while actively falling
            return this._evaluatePlayerPosition(player, position);
        }
        // Move player right, if possible
        if(position.x < board.getCols() - 1) {
            position.direction = Player.directions.RIGHT;
            position.posture = Player.postures.RUN;
            position.x++;
        }
        tile = board.getTile(position.x, position.y);
        player.setPosition(position);
        
        this._evaluatePlayerPosition(player, position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._climbUp = function _climbUp(player) {
        var position = player.getPosition();
        var board = this._board;
        var tile = board.getTile(position.x, position.y);
        var offset = player.getOffset();
        var currentAction = player.getCurrentAction();
        if(currentAction === Player.actions.NONE) {
            // Player has not started climbing yet)
            if(position.y > 0 && tile && tile.getType() == GameTile.typeIds.LADDER) {
                position.posture = Player.postures.CLIMB;
                position.direction = Player.directions.BACKWARD;
                player.setPosition(position);
                // Indicate the player is currently climbing
                player.setCurrentAction(Player.actions.CLIMBING);
                // Put the player partway down the ladder
                offset.y = LADDER_OFFSET;
                player.setOffset(offset);
            }
        }
        else if(currentAction === Player.actions.CLIMBING) {
            offset.y += LADDER_OFFSET;
            if(offset.y < 1) {
                // Hasn't finished climbing ladder
                player.setOffset(offset);
                // Still need to set position to update the alternate image index
                position.posture = Player.postures.CLIMB;
                position.direction = Player.directions.BACKWARD;
                player.setPosition(position);
            }
            else {
                // Reset the offset
                offset.y = 0;
                player.setOffset(offset);
                // Set the position
                position.y--;
                position.posture = Player.postures.CLIMB;
                position.direction = Player.directions.BACKWARD;
                player.setPosition(position);
                // Indicate that the player is done climbing
                player.setCurrentAction(Player.actions.NONE);
                this._evaluatePlayerPosition(player, position);
            }
        }
        else if(currentAction === Player.actions.FALLING) {
            // Not allowed to move while actively falling
            return this._evaluatePlayerPosition(player, position);
        }
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._climbDown = function _climbDown(player) {
        var position = player.getPosition();
        var board = this._board;
        var tile = board.getTile(position.x, position.y + 1);
        var offset = player.getOffset();
        var currentAction = player.getCurrentAction();
        if(currentAction === Player.actions.NONE) {
            if(position.y < board.getRows() - 1 && tile && tile.getType() == GameTile.typeIds.LADDER) {
                position.y++;
                position.posture = Player.postures.CLIMB;
                position.direction = Player.directions.BACKWARD;
                player.setPosition(position);
                // Indicate the player is currently climbing
                player.setCurrentAction(Player.actions.CLIMBING);
                // Put the player partway down the ladder
                offset.y = 1 - LADDER_OFFSET;
                player.setOffset(offset);
            }
        }
        else if(currentAction === Player.actions.CLIMBING) {
            offset.y -= LADDER_OFFSET;
            if(offset.y > 0) {
                // Hasn't finished climbing ladder
                player.setOffset(offset);
                // Still need to set position to update the alternate image index
                position.posture = Player.postures.CLIMB;
                position.direction = Player.directions.BACKWARD;
                player.setPosition(position);
            }
            else {
                // Reset the offset
                offset.y = 0;
                player.setOffset(offset);
                // Set the position
                position.posture = Player.postures.CLIMB;
                position.direction = Player.directions.BACKWARD;
                player.setPosition(position);
                // Indicate that the player is done climbing
                player.setCurrentAction(Player.actions.NONE);
                this._evaluatePlayerPosition(player, position);
            }
        }
        else if(currentAction === Player.actions.FALLING) {
            // Not allowed to move while actively falling
            return this._evaluatePlayerPosition(player, position);
        }
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._jump = function _jump(player) {
        var tile;
        var position = player.getPosition();
        var board = this._board;
        var didJump = false;
        var currentAction = player.getCurrentAction();
        if(currentAction === Player.actions.CLIMBING) {
            return;
        }
        else if(currentAction === Player.actions.FALLING) {
            // Not allowed to move while actively falling
            return this._evaluatePlayerPosition(player, position);
        }
        if(position.direction === Player.directions.LEFT && position.x > 1) {
            position.posture = Player.postures.JUMP;
            position.x -= 2;
            didJump = true;
        } else if(position.direction === Player.directions.RIGHT && position.x < board.getCols() - 2) {
            position.posture = Player.postures.JUMP;
            position.x += 2;
            didJump = true;
        }

        player.setPosition(position);
        
        if(didJump) {
            AudioManager.playSound(AudioManager.soundNames.JUMP);
            // If they jumped, onto a hole we need to mark them as falling
            // If we did _evaluatePlayerPosition instead, they would fall immediately which makes gameplay feel broken
            tile = board.getTile(position.x, position.y);
            if(tile.getType() === GameTile.typeIds.HOLE) {
                player.setCurrentAction(Player.actions.FALLING);
            };
        }
        
        //this._evaluatePlayerPosition(player, position);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._die = function _die(player) {
        var position = player.getPosition();
        var board = this._board;
        
        position.posture = Player.postures.DEAD;
	    position.direction = Player.directions.FORWARD;
        position.y = board.getRows() - 1;
        player.setPosition(position);
        player.setOffset(Player.defaultOffset);
        
        AudioManager.playSound(AudioManager.soundNames.DIE);
        this._eventEmitter.emit('renderRequest');
    };
    
    GameState.prototype._drop = function _drop(player) {
        var numTelepods = player.getNumTelepods();
        var position = player.getPosition();
        if(numTelepods > 0 && this._numActiveTelepods < MAX_ACTIVE_TELEPODS) {
            // To do: pass player offset into _createTelepod
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
        var eventEmitter = this._eventEmitter;
        var col = position.x;
        var row = position.y;
        var typeId = Addon.typeIds.TELEPOD;
        var telepod = new Addon(context, eventEmitter, col, row, typeId);
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
    
    GameState.prototype._intervalLogic = function _intervalLogic() {
        this._updateMarbles();
        this._createNeutrinoCanIfPossible();
        this._createMarbleIfPossible();
    };
    
    return GameState;
});