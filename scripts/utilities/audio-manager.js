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
    
    // To do: Put background music in here
    AudioManager._isMuted = {
        soundEffects: false
    };
        
    AudioManager.playSound = function playSound(soundName) {
        var sound = this._sounds[soundName];
        if(!this._isMuted.soundEffects && sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        };
    }
    
    AudioManager.muteSoundEffects = function muteSoundEffects() {
        this._isMuted.soundEffects = true;
    };
    
    AudioManager.unmuteSoundEffects = function unmuteSoundEffects() {
        this._isMuted.soundEffects = false;
    };
    
    AudioManager.getIsMuted = function isMuted() {
        return this._isMuted;
    }

    AudioManager.soundNames = {
        JUMP: 0,
        DROP: 1,
        DIE: 2,
        TELEPORT: 3,
        CAN: 4,
        SWITCH_ON: 5,
        SWITCH_OFF: 6
    };
    
    AudioManager._sounds = {};
    AudioManager._sounds[AudioManager.soundNames.JUMP] = newSoundEffect('audio/effects/jump.mp3');
    AudioManager._sounds[AudioManager.soundNames.DROP] = newSoundEffect('audio/effects/drop.mp3');
    AudioManager._sounds[AudioManager.soundNames.DIE] = newSoundEffect('audio/effects/die.mp3');
    AudioManager._sounds[AudioManager.soundNames.TELEPORT] = newSoundEffect('audio/effects/teleport.mp3');
    AudioManager._sounds[AudioManager.soundNames.CAN] = newSoundEffect('audio/effects/can.mp3');
    AudioManager._sounds[AudioManager.soundNames.SWITCH_ON] = newSoundEffect('audio/effects/switch_on.mp3');
    AudioManager._sounds[AudioManager.soundNames.SWITCH_OFF] = newSoundEffect('audio/effects/switch_off.mp3');
    
    return AudioManager;
});