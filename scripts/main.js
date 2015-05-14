// to do: BUG! Jump and land on a hole, you fall two levels!
// to do: BUG! Jump over a switch or addon, it does not activate


require([
    'jquery',
    'eventemitter2',
    'mout/queryString/getParam',
    'utilities/game-state',
    'utilities/player',
    'levels/level1',
    'levels/level2'
], function(
    $,
    EventEmitter2,
    getParam,
    GameState,
    Player,
    level1,
    level2
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
        $(canvas).on('click', function(event) {
            var x = Math.floor((event.pageX - $(this).position().left) / 16);
            var y = Math.floor((event.pageY - $(this).position().top) / 48);
            var nearestTile = game._board.getTile(x, y);
            var player = game._players[0];
            var position = player.getPosition();
            position.x = x;
            position.y = y;
            game._players[0].setPosition(position);
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
