// to do: BUG! Jump over a switch or addon, it does not activate

require([
    'jquery',
    'eventemitter2',
    'mout/array/forEach',
    'mout/object/forOwn',
    'mout/object/merge',
    'mout/queryString/getParam',
    'utilities/audio-manager',
    'utilities/game-state',
    'utilities/player',
    'levels/level1',
    'levels/level2',
    'levels/level3'
], function(
    $,
    EventEmitter2,
    forEach,
    forOwn,
    merge,
    getParam,
    AudioManager,
    GameState,
    Player,
    level1,
    level2,
    level3
) {
    var DEBUG = false;
    var STARTING_TELEPODS = 0;
    var STARTING_EXTRA_LIVES = 2;
    
    var game, $activeMenu;
    var scope = this;
    var url = document.location.href;
    var $html = $('html');
    var $activeArea = $('.window div:not(.menuBar)')
    var $inactiveArea = $('html,.menuBar')
    var $window = $('.window');
    var $windowContent = $('.windowContent');
    var $gameContainer = $('.gameContainer');
    var $backToGame = $('.backToGame');
    var $musicMenuItem = $('.menu .music');
    var $effectsMenuItem = $('.menu .effects');
    var $canvas = $('#runner');
    var $gameStats = $('.stats');
    var $savedGameList = $('.savedGames .gameList');
    var $progressFill = $('.progressBar .fill');
    var $extraLives = $('.extraLives');
    var $telepods = $('.telepods');
    var canvas = $canvas[0];
    var levels = [level1, level2, level3];
    
    var createGame = function createGame(opts, playerOpts) {
        var game, defaultPlayerOpts;
        var numTelepods = 0;
        var numExtraLives = 0;
        var eventEmitter = (opts && opts.eventEmitter) || new EventEmitter2();
        var defaultOpts = {
            canvas: canvas,
            $gameStats: $gameStats,
            $progressBar: $progressFill,
            $extraLives: $extraLives,
            $telepods: $telepods,
            eventEmitter: eventEmitter,
            duration: 100 * 1000,
            levels: levels,
            currentLevel: 0,
            size: {
                cols: 40,
                rows: 8
            }
        };
        var defaultPlayerOpts = {
            name: 'Player 1',
            eventEmitter: eventEmitter,
            movementStrategy: 'ARROW_KEYS',
            initialPosition: {
                x: 1,
                y: 7
            },
            type: Player.types.HUMAN,
            numExtraLives: STARTING_EXTRA_LIVES,
            numTelepods: STARTING_TELEPODS
        };
        opts = merge(defaultOpts, opts);
        playerOpts = merge(defaultPlayerOpts, playerOpts);
        
        if(game) {
            // Destroy any previous game
            game.destruct();
        }
        
        game = new GameState(opts);
        game.addPlayer(playerOpts);
        
        game.updateTelepods(playerOpts.numTelepods);
        game.updateExtraLives(playerOpts.numExtraLives);
    
        eventEmitter.on('renderRequest', function() {
            game.render();
        });
        
        return game;
    };
    
    var attemptRestart = function attemptRestart() {
        game.pause();
        $window.addClass('inactive');
        if(confirm("Are you sure you want to completely restart?")) {
            game.destruct();
            game = createGame();
            $window.removeClass('inactive');
        }
    };
    
    var readGamesFromLocalStorage = function readGamesFromLocalStorage() {
        var games;
        if(!localStorage) {
            return false;
        }
        else {
            games = localStorage && localStorage.getItem('savedGames');
            
            try {
                games = JSON.parse(games);
            }
            catch(error) {
                games = null;
            }
            if(!(games instanceof Array)) {
                games = [];
            }
            return games;
        }
    };
    
    var writeGamesToLocalStorage = function writeGamesToLocalStorage(games) {
        if(!localStorage){
            return false;
        }
        else {
            localStorage.setItem('savedGames', JSON.stringify(games));
        }
    };
    
    var readMutePreferencesFromLocalStorage = function readMutePreferencesFromLocalStorage() {
        var mutePreferences;
        if(!localStorage) {
            return false;
        } 
        else {
            try {
                mutePreferences = JSON.parse(localStorage.getItem('mute'));
            }
            catch(error) {
                mutePreferences = null;
            }
        }
        return mutePreferences || {};
    };
    
    var writeMutePreferencesToLocalStorage = function writeMutePreferencesToLocalStorage(mutePreferences) {
        if(!localStorage) {
            return false;
        }
        else {
            localStorage.setItem('mute', JSON.stringify(mutePreferences));
        }
    };
    
    var storeMutePreference = function storeMutePreference(type, isMuted) {
        var mutePreferences = readMutePreferencesFromLocalStorage();
        if(!!mutePreferences) {
            mutePreferences[type] = isMuted;
        }
        writeMutePreferencesToLocalStorage(mutePreferences);
    };
    
    var loadMutePreferences = function loadMutePreferences() {
        var mutePreferences = readMutePreferencesFromLocalStorage();
        if(!!mutePreferences) {
            if(mutePreferences.music) {
                AudioManager.disableBackgroundMusic();
                $musicMenuItem.removeClass('checked');
            }
            if(mutePreferences.effects) {
                AudioManager.disableSoundEffects();
                $effectsMenuItem.removeClass('checked');
            }
        }
    };
    
    var saveGame = function saveGame() {
        var games, gameName, player, savedGame;
        $window.addClass('inactive');
        games = readGamesFromLocalStorage();
        if(!games) {
            return alert("Unable to save game! Please upgrade your browser");
        }
        else {
            gameName = prompt("The game will be saved from the beginning of this level.\nPlease enter a name for this saved game:");
            if(!gameName) {
                return;
            }
            else {
                savedGame = {
                    _: "Modifying saved game data makes kittens cry :'(",
                    name: gameName,
                    date: Date.now(),
                    opts: {
                        currentLevel: game.getLevel()
                    },
                    playerOpts: game.getHumanPlayerState()
                };
                games.push(savedGame);
                writeGamesToLocalStorage(games);
            }
        }
    };
    
    var pickSavedGame = function pickSavedGame() {
        var games;
        games = readGamesFromLocalStorage();
        if(!games) {
            return alert("Unable to save game! Please upgrade your browser");
        }
        else {
            $savedGameList.html('');
            if(!games.length) {
                var $li = $('<li>');
                $li.append("No saved games");
                $savedGameList.append($li);
            }
            else {
                forEach(games, function(game, index) {
                    var $li = $('<li>');
                    var $load = $('<a href="javascript:void(0);">');
                    var $delete = $('<a href="javascript:void(0);">');
                    
                    $load.addClass('loadGame').data('gameId', index).append('Load');
                    $delete.addClass('deleteGame').data('gameId', index).append('Delete');
                    $li.append(game.name, " - ", $load, " - ", $delete);
                    $savedGameList.append($li);
                });
            }
            
            showWindow('savedGames');
        }
    };
    
    var loadGame = function(gameIndex) {
        var savedGame;
        var games = readGamesFromLocalStorage();
        if(games) {
            savedGame = games[gameIndex];
            if(savedGame) {
                game = createGame(savedGame.opts, savedGame.playerOpts);
                showWindow('gameContainer');
            }
        }
        
    };
    
    var deleteGame = function(gameIndex) {
        var games;
        if(confirm("Are you sure you want to delete this saved game?")) {
            games = readGamesFromLocalStorage();
            if(!!games && games.length > gameIndex) {
                games.splice(gameIndex, 1);
                writeGamesToLocalStorage(games);
                pickSavedGame();
            }
        }
    };
    
    var showWindow = function showWindow(className) {
        $windowContent.addClass('hidden');
        $windowContent.filter('.' + className).removeClass('hidden');
    };
    
    var processMenuItem = function processMenuItem($target, $menuItem) {
        var checked;
        var menuItem = $target.data('menu-item');
        switch(menuItem) {
            case 'save':
                saveGame();
                $menuItem.blur();
                break;
            case 'load':
                pickSavedGame();
                $menuItem.blur();
                break;
            case 'restart':
                attemptRestart();
                $menuItem.blur();
                break;
            case 'sound':
                $target.toggleClass('checked');
                if($target.hasClass('checked')) {
                    storeMutePreference('effects', false);
                    AudioManager.enableSoundEffects();
                }
                else {
                    storeMutePreference('effects', true);
                    AudioManager.disableSoundEffects();
                }
                break;
            case 'music':
                $target.toggleClass('checked');
                if($target.hasClass('checked')) {
                    storeMutePreference('music', false);
                    AudioManager.enableBackgroundMusic();
                }
                else {
                    storeMutePreference('music', true);
                    AudioManager.disableBackgroundMusic();
                }
                break;
            case 'about':
                showWindow('about');
                $menuItem.blur();
                break;
            case 'instructions':
                showWindow('instructions');
                $menuItem.blur();
                break;
            default:
                $menuItem.blur();
                break;
        }
    };
    
    var processUiClick = function processUiClick(event) {
        var $menuItem;
        var $target = $(event.target);
        if($target.closest('.window').length) {
            // Clicked somewhere in the virtual window
            $window.removeClass('inactive');
            $menuItem = $target.closest('.menuBar li:focus')
            if($menuItem.length) {
                // Clicked somewhere on the virtual menu bar
                game.pause();
                if($target.is('.menu li')) {
                    processMenuItem($target, $menuItem);
                }
                /*
                // To do: Disable menu after clicking again
                // This solution sort of works, but is a little glitchy
                if($activeMenu) {
                    $activeMenu.blur();
                    $activeMenu = null;
                }
                else {
                    $activeMenu = $menu.find(':focus');
                }
                */
            }
            else if($target.is('.loadGame')) {
                loadGame($target.data('gameId'));
            }
            else if($target.is('.deleteGame')) {
                deleteGame($target.data('gameId'));
            }
            else {
                if(!$gameContainer.hasClass('hidden')) {
                    game.resume();
                }
            }
        }
        else {
            $window.addClass('inactive');
            game.pause();
        }
    };
    
    $html.on('click', processUiClick);
    
    if(getParam(url, 'level') == 2) {
       level = level2; 
    }
    else if(getParam(url, 'level') == 3) {
       level = level3; 
    }
    
    // This is where the magic happens. Actually create the game
    game = createGame(game);
    // Load effects/music settings from last local storage
    loadMutePreferences();
    
    if(DEBUG) {
        window.game = game;
        $(canvas).on('click', function(event) {
            var x = Math.floor((event.pageX - $(this).position().left) / 16);
            var y = Math.floor((event.pageY - $(this).position().top) / 48);
            var position = {
                x: x,
                y: y
            }
            forOwn(game._players, function(player) {
                if(player.getType() === Player.types.HUMAN) {
                    player.setPosition(position);
                    player.setCurrentAction(Player.actions.NONE);
                    player.setOffset(Player.defaultOffset);
                    game._evaluatePlayerPosition(player, position);
                }
            });
        });
    }
    
    $backToGame.on('click', function(event) {
        showWindow('gameContainer');
    });
});
