
//functionality settings
var echoEnabled;
var echoCalled = false;
var simonEnabled;

var KEYS = ['c', 'd', 'e', 'f'];
var NOTE_DURATION = 700;

//echo functionality variables
var DELAY_BEFORE_ECHO = 2500;
var lastClickTime = 0;
var echoSequence = [];
var clickTimestamps = [0];

//simon functionality variables
var clickCount = 0;
var gameOver = false;
var simonSequence = [];

/*
Mode Buttons
These allow the user to select the noteboxes' mode (echo or simon).
 */
var normalButton = document.getElementById('normal_mode');
var simonButton = document.getElementById('simon_mode');
var echoButton = document.getElementById('echo_mode');

normalButton.addEventListener('click', function() {
    normalButton.style.border = '1px solid white';
    echoButton.style.border = 'none';
    simonButton.style.border = 'none';
    simonEnabled = false;
    echoEnabled = false;
});

simonButton.addEventListener('click', function() {
	simonButton.style.border = '1px solid white';
    normalButton.style.border = 'none';
	echoButton.style.border = 'none';
	simonEnabled = true;
	echoEnabled = false;
	simonSequence = [];
	simon();
});

echoButton.addEventListener('click', function() {
    echoButton.style.border = '1px solid white';
    normalButton.style.border = 'none';
    simonButton.style.border = 'none';
    simonEnabled = false;
    echoEnabled = true;
    //prevents echo() from being called multiple times if user
    //clicks "ECHO MODE" more than once
    if(!echoCalled) echo();
});


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

        if (echoEnabled === true) {
        lastClickTime = new Date();
        clickTimestamps.push(lastClickTime);
        echoSequence.push(this.key);
         }

        // - each time user clicks, compare clicked note to corresponding index in echoSequence
        // - if played key != echoSequence[i], game over: restart game
        // - if user's click count == echoSequence.length, go back to beginning step
    	if(simonEnabled === true){
        	clickCount++;
            if(this.key !== simonSequence[clickCount - 1]){
            	gameOver = true;
            	setTimeout(simon, 100);
            }
            else if(clickCount === simonSequence.length){
                clickCount = 0;
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
 This function stops the Noteboxes from playing when clicked by the user.
 */
function disableAllNoteboxes() {
    KEYS.forEach(function (key) {
        notes[key].disable();
    });
}

/*
 This function enables the Noteboxes to play when clicked by the user.
 */
function enableAllNoteboxes() {
    KEYS.forEach(function (key) {
        notes[key].enable();
    });
}

/*
 This function 'echoes' a clicked note
 after a 2500 ms delay. If the user plays multiple
 notes within 2500 ms, the program will wait until
 the user stops clicking for at least 2500 ms, and
 then will echo the sequence and timing of the notes
 that they played.
 */
function echo() {
    echoCalled = true;
    var keepWaiting = setTimeout(echo, 10);
    var playEchoSequence = function() {
        disableAllNoteboxes();
        //if done playing echo sequence, reset all variables, re-enable all
        // noteboxes, and keep
        // checking for user input by calling echo()
        if(echoSequence === undefined || echoSequence.length === 0){
            lastClickTime = 0;
            clickTimestamps = [0];
            enableAllNoteboxes();
            echo();
        }
        else{
            //set a timer to play note at the beginning of echoSequence
            //shift echosequence so that on next call, next note will be
            //at the beginning of echoSequence and will be played
            var currentNote = echoSequence.shift();
            notes[currentNote].play();
            //use the difference in click times to set the delay before each
            //note is played - shift clickTimestamps to match shift in echoSequence
            clickTimestamps.shift();
            setTimeout(playEchoSequence, clickTimestamps[1] - clickTimestamps[0]);
        }
    }
    //waits until 2.5 seconds have passed since user's last click
    if((new Date() - lastClickTime > DELAY_BEFORE_ECHO) && lastClickTime != 0) {
        clearTimeout(keepWaiting);
    	playEchoSequence();
    }
}

/*
This function launches a game of simon in which the user must
copy a randomly generated sequence of notes that increases in
length each level.
 */
function simon() {
    if(gameOver === true){
        //reset simon sequence and level, alert the user that the game is over
        //and restart the game automatically
        clickCount = 0;
        simonSequence = [];
        alert("G A M E   O V E R! \nPress OK to play again.");
        gameOver = false;
    }

    //returns a random note from the KEYS array
    var randomNote = function() {
        var randomIndex = Math.floor(Math.random() * KEYS.length);
        return KEYS[randomIndex];
    }

    var playSimonSequence = function() {
        //disable all noteboxes while the simon sequence is playing
        disableAllNoteboxes();
        //array to store note timers
        var timers = [];
        //play out each note in the simon sequence
        simonSequence.forEach(function(key, i) {
            timers[i] = setTimeout(notes[key].play.bind(null, key), i * NOTE_DURATION);
        });
        //enable all noteboxes to accept user clicks after simon sequence has finished playing
        setTimeout(enableAllNoteboxes, simonSequence.length * NOTE_DURATION);
        //prevents simon sequence from playing if user
        //switches functionalities before sequence begins playing
        if(simonEnabled === false){
            enableAllNoteboxes();
            for(var i=0; i<timers.length; i++) clearTimeout(timers[i]);
        }
    }

    simonSequence.push(randomNote());
    playSimonSequence();
}


