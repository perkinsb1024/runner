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
    var scope = this;
    var url = document.location.href;
    var canvas = $('#runner')[0];
    var $playPauseMusic = $('.playPauseMusic');
    var $playPauseGame = $('.playPauseGame');
    var $progressFill = $('.progressBar .fill');
    var $extraLives = $('.extraLives');
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
        eventEmitter: eventEmitter,
        paused: false,
        duration: 100 * 1000,
        level: level,
        size: {
            cols: 40,
            rows: 8
        }
    });
    
    game.addPlayer({
        name: 'Player 1',
        eventEmitter: eventEmitter,
        movementStrategy: 'ARROW_KEYS',
        initialPosition: {
            x: 1,
            y: 7
        },
        type: Player.types.HUMAN
    });
    
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
