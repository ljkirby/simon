var KEYS = ['c', 'd', 'e', 'f'];
var NOTE_DURATION = 1000;
var lastClickTime = 0;
var noteSequence = [];
var clickTimes = [0];
var delayBeforeEcho = 2500;

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

	//sets the box to echo sound if clicked
	// this.echo = function() {
	// 	if(new Date() - lastClickTime > 2500) this.play();
	// 	else setTimeout(this.echo, 5);
	// }.bind(this)

	// Call this NoteBox's clickHandler and play the note.
	this.clickHandler = function () {
		if (!enabled) return;

		this.onClick(this.key);
        this.play();
		lastClickTime = new Date();
        clickTimes.push(lastClickTime);
		noteSequence.push(this.key);
	}.bind(this)

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

function disableAllNoteboxes() {
    KEYS.forEach(function (key) {
        notes[key].disable();
    });
}

function enableAllNoteboxes() {
    KEYS.forEach(function (key) {
        notes[key].enable();
    });
}

/*
This function 'echoes' a clicked note
after a 2500 ms delay. If the user plays multiple
notes within 2500 ms, the program will wait until the user stops clicking for
at least 2500 ms,and then will echo the sequence they played.

@param: none
@returns: none
 */
function echo() {

	//waits until 2.5 seconds have passed since user's last click
    if(new Date() - lastClickTime > delayBeforeEcho && lastClickTime != 0) {
		disableAllNoteboxes();
    	var playSequence = function(){

    		if(noteSequence == undefined || noteSequence.length == 0){
                lastClickTime = 0;
                clickTimes = [];
                clickTimes.push(lastClickTime);
                enableAllNoteboxes();
                echo();
			}
			else{
                var currentNote  = noteSequence.shift();
                clickTimes.shift();
                notes[currentNote].play();
                setTimeout(playSequence, clickTimes[1] - clickTimes[0]);
			}

		}
		playSequence();
	}

	//if 2.5 seconds has not passed since last click, keep waiting
    else setTimeout(echo, 5);
}

echo();

//
// KEYS.concat(KEYS.slice().reverse()).forEach(function(key, i) {
// 	setTimeout(notes[key].play.bind(null, key), i * NOTE_DURATION);
// });
