// to do: BUG! Jump over a switch or addon, it does not activate

require([
    'jquery',
    'eventemitter2',
    'mout/array/forEach',
    'mout/object/forOwn',
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
    var $canvas = $('#runner');
    var $gameStats = $('.stats');
    var $progressFill = $('.progressBar .fill');
    var $extraLives = $('.extraLives');
    var $telepods = $('.telepods');
    var canvas = $canvas[0];
    var eventEmitter = new EventEmitter2();
    var levels = [level1, level2, level3];
    
    var attemptRestart = function attemptRestart() {
        game.pause();
        $window.addClass('inactive');
        if(confirm("Are you sure you want to completely restart?")) {
            document.location.reload();
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
            case 'restart':
                attemptRestart();
                $menuItem.blur();
                break;
            case 'sound':
                $target.toggleClass('checked');
                if($target.hasClass('checked')) {
                    AudioManager.enableSoundEffects();
                }
                else {
                    AudioManager.disableSoundEffects();
                }
                break;
            case 'music':
                $target.toggleClass('checked');
                if($target.hasClass('checked')) {
                    AudioManager.enableBackgroundMusic();
                }
                else {
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
    var game = new GameState({
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
    });
    
    if(DEBUG) {
        window.game = game;
        window.eventEmitter = eventEmitter;
        window.Player = Player;
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
    
    game.addPlayer({
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
    });
    
    game.updateTelepods(STARTING_TELEPODS);
    game.updateExtraLives(STARTING_EXTRA_LIVES);
    
    $backToGame.on('click', function(event) {
        showWindow('gameContainer');
    });
    
    eventEmitter.on('renderRequest', function() {
        game.render();
    });
    
    setTimeout(function() {
        game.render();
    }, 250);
});
