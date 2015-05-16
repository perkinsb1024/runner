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
    var DEBUG = false;
    var STARTING_TELEPODS = 0;
    var STARTING_EXTRA_LIVES = 3;
    
    var scope = this;
    var url = document.location.href;
    var canvas = $('#runner')[0];
    var $playPauseMusic = $('.playPauseMusic');
    var $playPauseGame = $('.playPauseGame');
    var $progressFill = $('.progressBar .fill');
    var $extraLives = $('.extraLives');
    var $telepods = $('.telepods');
    var eventEmitter = new EventEmitter2();
    var level = level1;
    var game;
    
    
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
        window.eventEmitter = eventEmitter;
        window.Player = Player;
        $(canvas).on('click', function(event) {
            var x = Math.floor((event.pageX - $(this).position().left) / 16);
            var y = Math.floor((event.pageY - $(this).position().top) / 48);
            var player = game._players[1];
            var position = {
                x: x,
                y: y
            }
            game._teleportPlayer(player, position);
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
    
    $playPauseMusic.on('click', function() {
        if($playPauseMusic.text() === "Music: Off") {
            $playPauseMusic.text("Music: On");
            game.playMusic();
        } else {
            $playPauseMusic.text("Music: Off");
            game.pauseMusic();
        }
        return false;
    });
    
    $playPauseGame.on('click', function() {
        if($playPauseGame.text() === "Resume game") {
            $playPauseGame.text("Pause game");
            game.resume();
        } else {
            $playPauseGame.text("Resume game");
            game.pause();
        }
        return false;
    });
    
    // Debugging
    window.game = game;
});
