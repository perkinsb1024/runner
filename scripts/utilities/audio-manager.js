define([

], function (

) {    
    /* Utility functions */
    var newAudio = function newAudio(path) {
        var audio = new Audio();
        if(audio && path) {
            audio.src = path;
        };
        return audio;
    };
    /* End utility function */
    
    var AudioManager = {};
    
    AudioManager._isEnabled = {
        backgroundMusic: true,
        soundEffects: true
    };
        
    AudioManager.playSound = function playSound(soundName) {
        var sound = this._sounds[soundName];
        if(this._isEnabled.soundEffects && sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        };
    }
    
    AudioManager.setBackgroundMusicSource = function setBackgroundMusicSource(path) {
        this._backgroundMusic.src = path;
    };
    
    AudioManager.resetBackgroundMusicPlayback = function resetBackgroundMusicPlayback() {
        this._backgroundMusic.currentTime = 0;
    };
    
    AudioManager.pauseBackgroundMusic = function pauseBackgroundMusic() {
        this._backgroundMusic.pause();
    };
    
    AudioManager.playBackgroundMusic = function playBackgroundMusic() {
        if(this._isEnabled.backgroundMusic) {
            this._backgroundMusic.play();
        }
    };
    
    AudioManager.disableBackgroundMusic = function disableBackgroundMusic() {
        this._isEnabled.backgroundMusic = false;
        this.pauseBackgroundMusic();
    };
    
    AudioManager.enableBackgroundMusic = function enableBackgroundMusic() {
        this._isEnabled.backgroundMusic = true;
    };
    
    AudioManager.disableSoundEffects = function disableSoundEffects() {
        this._isEnabled.soundEffects = false;
    };
    
    AudioManager.enableSoundEffects = function enableSoundEffects() {
        this._isEnabled.soundEffects = true;
    };
    
    AudioManager.getBackgroundMusicIsEnabled = function getBackgroundMusicIsEnabled() {
        return this._isEnabled.backgroundMusic;
    };
    
    AudioManager.getSoundEffectsAreEnabled = function getSoundEffectsAreEnabled() {
        return this._isEnabled.soundEffects;
    };

    AudioManager.soundNames = {
        JUMP: 0,
        DROP: 1,
        DIE: 2,
        TELEPORT: 3,
        CAN: 4,
        MARBLE: 5,
        SWITCH_ON: 6,
        SWITCH_OFF: 7
    };
    
    AudioManager._backgroundMusic = newAudio();
    AudioManager._backgroundMusic.loop = true;
    AudioManager._backgroundMusic.volume = 0.8;
    
    AudioManager._sounds = {};
    AudioManager._sounds[AudioManager.soundNames.JUMP] = newAudio('audio/effects/jump.mp3');
    AudioManager._sounds[AudioManager.soundNames.DROP] = newAudio('audio/effects/drop.mp3');
    AudioManager._sounds[AudioManager.soundNames.DIE] = newAudio('audio/effects/die.mp3');
    AudioManager._sounds[AudioManager.soundNames.TELEPORT] = newAudio('audio/effects/teleport.mp3');
    AudioManager._sounds[AudioManager.soundNames.CAN] = newAudio('audio/effects/can.mp3');
    AudioManager._sounds[AudioManager.soundNames.MARBLE] = newAudio('audio/effects/marble.mp3');
    AudioManager._sounds[AudioManager.soundNames.SWITCH_ON] = newAudio('audio/effects/switch_on.mp3');
    AudioManager._sounds[AudioManager.soundNames.SWITCH_OFF] = newAudio('audio/effects/switch_off.mp3');
    
    return AudioManager;
});