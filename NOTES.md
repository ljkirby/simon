
IF I WERE TO RE-DO THIS INTERVIEW:

I would take a more object oriented approach to the Simon and Echo
functionalities. This would allow me to better protect all the global
variables I used and would allow me to better control/access functions.
Of course, this is all speculation as I did not actually implement the
functionalities as objects.

The approach I took to this implementation involved adding additional
code to the Notebox clickhandlers that was built specifically for the
simon and echo functions - an approach that I understand has room for improvement.

----------------------------------------------------------------------

ECHO Functionality:

- I actually found that implementing this functionality was more challenging than
implementing the Simon game - since it was classified as the 'easy' task,
I know that there is probably a much much easier way of successfully getting
this mode to work, and I love to find out what the creator of this interview
had in mind when assigning the easy task

- I wasn't sure if this was a requirement, so I think it may be worth
noting that this functionality will not only echo the sequence of
notes that a user plays, but it will also mimic the TIMING of the sequence.

- Main encountered difficulty: It was easy to get the note to replay itself
after being clicked - the challenge for me was in making the program wait
for the user to not play a note for 2.5 seconds. To constantly check for new
user input within the 2.5 second 'wait', I made the echo() function recursively
call itself w/ setTimeout() and check the user's last click time.
This admittedly took a bit of thinking on my part since I'm still getting used
to the the ASYNCHRONOUS execution of functions like setTimeout().

---------------------------------------------------------------------

SIMON Functionality:

- The simon functionality was fairly easy to implement. I copied the given
example of playing all notes in an array and used it to play back all the
notes in an array of random notes (the 'simon sequence').
When it is the user's turn to play back the sequence, I use the Noteboxes'
clickhandlers to increment a count of the users' clicks. I then compare the
clicked note to the corresponding note stored in the simon sequence, using
the click count as the index of the simon sequence array.
