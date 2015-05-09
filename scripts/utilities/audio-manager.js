define([

], function (

) {
    // todo: Integrate background music in here as well
    
    /* Utility functions */
    var newSoundEffect = function newSoundEffect(path) {
        var audio = new Audio();
        if(audio) {
            audio.src = path;
        };
        return audio;
    };
    /* End utility function */
    
    var AudioManager = {};
    
    AudioManager._muted = false;
        
    AudioManager.playSound = function playSound(soundName) {
        var sound = this._sounds[soundName];
        if(sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        };
    }
    
    AudioManager.mute = function mute() {
        this._muted = true;
    }
    
    AudioManager.unmute = function unmute() {
        this._muted = false;
    }
    
    AudioManager.isMuted = function isMuted() {
        return this._muted;
    }

    AudioManager.soundNames = {
        JUMP: 0,
        DROP: 1,
        FALL: 2,
        TELEPORT: 3,
        CAN: 4,
        SWITCH_ON: 5,
        SWITCH_OFF: 6
    };
    
    AudioManager._sounds = {};
    AudioManager._sounds[AudioManager.soundNames.JUMP] = newSoundEffect('audio/effects/jump.mp3');
    AudioManager._sounds[AudioManager.soundNames.DROP] = newSoundEffect('audio/effects/drop.mp3');
    AudioManager._sounds[AudioManager.soundNames.FALL] = newSoundEffect('audio/effects/fall.mp3');
    AudioManager._sounds[AudioManager.soundNames.TELEPORT] = newSoundEffect('audio/effects/teleport.mp3');
    AudioManager._sounds[AudioManager.soundNames.CAN] = newSoundEffect('audio/effects/can.mp3');
    AudioManager._sounds[AudioManager.soundNames.SWITCH_ON] = newSoundEffect('audio/effects/switch_on.mp3');
    AudioManager._sounds[AudioManager.soundNames.SWITCH_OFF] = newSoundEffect('audio/effects/switch_off.mp3');
    
    return AudioManager;
});