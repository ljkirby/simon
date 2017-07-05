
//functionality settings
var echoEnabled = false;
var simonEnabled = true;

var KEYS = ['c', 'd', 'e', 'f'];
var NOTE_DURATION = 1000;

//echo functionality variables
var delayBeforeEchoesStart = 2500;
var lastClickTime = 0;
var clickSequence = [];
var clickTimestamps = [0];

//simon functionality variables
var clickCount = 0;
var gameOver = false;
var simonSequence = [];


// NoteBox
//
// Acts as an interface to the coloured note boxes on the page, exposing methods
// for playing audio, handling clicks,and enabling/disabling the note box.
function NoteBox(key, onClick) {
	// Create references to box element and audio element.
	var boxEl = document.getElementById(key);
	var audioEl = document.getElementById(key + '-audio');
	if (!boxEl) throw new Error('No NoteBox element with id' + key);
	if (!audioEl) throw new Error('No audio element with id' + key + '-audio');

	// When enabled, will call this.play() and this.onClick() when clicked.
	// Otherwise, clicking has no effect.
	var enabled = true;
	// Counter of how many play calls have been made without completing.
	// Ensures that consequent plays won't prematurely remove the active class.
	var playing = 0;

	this.key = key;
	this.onClick = onClick || function () {};

	// Plays the audio associated with this NoteBox
	this.play = function () {
		playing++;
		// Always play from the beginning of the file.
		audioEl.currentTime = 0;
		audioEl.play();

		// Set active class for NOTE_DURATION time
		boxEl.classList.add('active');
		setTimeout(function () {
			playing--;
			if (!playing) {
				boxEl.classList.remove('active');
			}
		}, NOTE_DURATION)
	}

	// Enable this NoteBox
	this.enable = function () {
		enabled = true;
	}

	// Disable this NoteBox
	this.disable = function () {
		enabled = false;
	}

	// Call this NoteBox's clickHandler and play the note.
	this.clickHandler = function () {
        if (!enabled) return;
        this.onClick(this.key);
        this.play();

        if (echoEnabled == true) {
        lastClickTime = new Date();
        clickTimestamps.push(lastClickTime);
        clickSequence.push(this.key);
    	}

    	else if(simonEnabled == true){
        	clickCount++;
            if(this.key != simonSequence[clickCount - 1]){
            	gameOver = true;
                clickCount = 0;
                clickSequence = [];
            	simonSequence = [];
            	setTimeout(simon, 100);
            }
            else if(clickCount == simonSequence.length){
                clickCount = 0;
                clickSequence = [];
                setTimeout(simon, 2500);
			}
		}
	}.bind(this);
	boxEl.addEventListener('mousedown', this.clickHandler);
}

// Example usage of NoteBox.
//
// This will create a map from key strings (i.e. 'c') to NoteBox objects so that
// clicking the corresponding boxes on the page will play the NoteBox's audio.
// It will also demonstrate programmatically playing notes by calling play directly.
var notes = {};

KEYS.forEach(function (key) {
	notes[key] = new NoteBox(key);
});

/*
 This function 'echoes' a clicked note
 after a 2500 ms delay. If the user plays multiple
 notes within 2500 ms, the program will wait until
 the user stops clicking for at least 2500 ms, and
 then will echo the sequence and timing of the notes
 that they played.

 @param: none
 @returns: none
 */
function echo() {
    //waits until 2.5 seconds have passed since user's last click
    if((new Date() - lastClickTime > delayBeforeEchoesStart) && lastClickTime != 0) {
        disableAllNoteboxes();
        playEchoSequence();
    }
    //if 2.5 seconds has not passed since last click, keep waiting
    else setTimeout(echo, 5);
}

/*
This function stops the Noteboxes from playing when clicked by the user.
 */
function disableAllNoteboxes() {
    KEYS.forEach(function (key) {
        notes[key].disable();
    });
}

/*
 This function enables the noteboxes to play when clicked by the user.
 */
function enableAllNoteboxes() {
    KEYS.forEach(function (key) {
        notes[key].enable();
    });
}

/*
This function plays the sequence of notes clicked on by the user.
 */
function playEchoSequence() {

    if(clickSequence == undefined || clickSequence.length == 0){
        lastClickTime = 0;
        clickTimestamps = [];
        clickTimestamps.push(lastClickTime);
        enableAllNoteboxes();
        echo();
    }
    else{
        var currentNote  = clickSequence.shift();
        clickTimestamps.shift();
        notes[currentNote].play();
        setTimeout(playEchoSequence, clickTimestamps[1] - clickTimestamps[0]);
    }
}


function simon() {

	/*
	 - pick random note from KEYS array and append it to clickSequence
	 - disable noteboxes and play sequence
	 - have counter for number of times a user has clicked
	 - each time user clicks, compare clicked note to corresponding index in clickSequence
	 - if played key != clickSequence[i], game over: reset arrays, restart game
	 - if user's click count == clickSequence.length, go back to beginning step
	 */

    if(gameOver == true){
        alert("G A M E   O V E R");
        gameOver = false;
    }
    simonSequence.push(randomNote());
    playSimonSequence();
}


function playSimonSequence() {
	disableAllNoteboxes();
	simonSequence.forEach(function(key, i) {
 	setTimeout(notes[key].play.bind(null, key), i * NOTE_DURATION);
});
	//enable all noteboxes to accept user clicks after simon sequence has finished playing
    setTimeout(enableAllNoteboxes, simonSequence.length * NOTE_DURATION);
}

/*
This function returns a random note from the KEYS array.
 */
function randomNote(){
	var randomIndex = Math.floor(Math.random() * KEYS.length);
	return KEYS[randomIndex];
}

if(echoEnabled == true) echo();
else if(simonEnabled == true) simon();

