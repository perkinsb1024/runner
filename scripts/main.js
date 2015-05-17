// to do: BUG! Jump over a switch or addon, it does not activate

require([
    'jquery',
    'eventemitter2',
    'mout/array/forEach',
    'mout/queryString/getParam',
    'utilities/game-state',
    'utilities/player',
    'levels/level1',
    'levels/level2',
    'levels/level3'
], function(
    $,
    EventEmitter2,
    forEach,
    getParam,
    GameState,
    Player,
    level1,
    level2,
    level3
) {
    var DEBUG = true;
    var STARTING_TELEPODS = 0;
    var STARTING_EXTRA_LIVES = 3;
    
    var game, $activeMenu;
    var scope = this;
    var url = document.location.href;
    var $html = $('html');
    var $activeArea = $('.window div:not(.menuBar)')
    var $inactiveArea = $('html,.menuBar')
    var $window = $('.window');
    var $gameContainer = $('.gameContainer');
    var $canvas = $('#runner');
    var $playPauseMusic = $('.playPauseMusic');
    var $playPauseGame = $('.playPauseGame');
    var $progressFill = $('.progressBar .fill');
    var $extraLives = $('.extraLives');
    var $telepods = $('.telepods');
    var canvas = $canvas[0];
    var eventEmitter = new EventEmitter2();
    var level = level1;
    
    var processMenuItem = function processMenuItem($target) {
        var checked;
        var menuItem = $target.data('menu-item');
        switch(menuItem) {
            case 'sound':
                $target.toggleClass('checked');
                if($target.hasClass('checked')) {
                    game.unmuteSoundEffects();
                }
                else {
                    game.muteSoundEffects();
                }
                break;
            case 'music':
                $target.toggleClass('checked');
                if($target.hasClass('checked')) {
                    game.playMusic();
                }
                else {
                    game.pauseMusic();
                }
                break;
        }
    };
    
    var processUiClick = function processUiClick(event) {
        var $menu;
        var $target = $(event.target);
        if($target.closest('.window').length) {
            // Clicked somewhere in the virtual window
            $window.removeClass('inactive');
            $menu = $target.closest('.menuBar')
            if($menu.length) {
                // Clicked somewhere on the virtual menu bar
                game.pause();
                if($target.is('.menu li')) {
                    processMenuItem($target);
                }
                /*
                // To do: Disable menu after clicking again
                // This solution sort of works, but is a little glithy
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
                game.resume();
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
        $progressBar: $progressFill,
        $extraLives: $extraLives,
        $telepods: $telepods,
        eventEmitter: eventEmitter,
        paused: false,
        duration: 100 * 1000,
        level: level,
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
            var player = game._players[0];
            var position = {
                x: x,
                y: y
            }
            player.setPosition(position);
            game._evaluatePlayerPosition(player, position);
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
    
    forEach(level.opponents, function(opponentInfo, index) {
        game.addPlayer({
            name: 'Opponent ' + (index + 1),
            eventEmitter: eventEmitter,
            movementStrategy: 'AI',
            initialPosition: opponentInfo.position,
            intelligence: opponentInfo.intelligence,
            type: Player.types.OPPONENT
        });
    });
    
    game.updateTelepods(STARTING_TELEPODS);
    game.updateExtraLives(STARTING_EXTRA_LIVES);
    
    eventEmitter.on('renderRequest', function() {
        game.render();
    });
    
    setTimeout(function() {
        game.render();
    }, 250);
});
