if (require('../config.json').serviceConfig.serviceType == 'apple') {
  const {
    webFrame
  } = require('electron');
  const applescript = require('osascript-promise');
  const parse = require('parse-duration')
  const moment = require('moment')
  const os = require('os');
  if (os.type() !== 'Darwin') {
    document.body.style.backgroundColor = '#4C4C4C'
  }

  webFrame.setZoomLevelLimits(1, 1);

  var text = "textContent" in document.body ? "textContent" : "innerText";
  var oldID
  var openTimestamp

  async function setApple() {
    applescript(`tell application "iTunes"
    	             if player state is playing or player state is paused then
    	               set tname to (get name of the current track)
    	               set tdur to (get duration of the current track)
    	               set tartist to (get artist of the current track)
    	               set tid to (get id of the current track)
    	               set pos to player position
    	             end if
    	           end tell

tell application "iTunes" to tell artwork 1 of current track
	set srcBytes to raw data
	if format is «class PNG » then
		set ext to ".png"
	else
		set ext to ".jpg"
	end if
end tell

set fileName to (((path to temporary items) as text) & "tmp" & ext)
set outFile to open for access file fileName with write permission
set eof outFile to 0
write srcBytes to outFile
close access outFile

set location to "file://" & POSIX path of (path to temporary items) & "tmp" & ext

return { name: tname, duration: tdur, artist:tartist, id: tid, position:pos, artwork:location }`)
      .then((rtn) => {
        document.getElementById('artwork').src = rtn.artwork
        if (document.getElementById('artwork').src) {
          document.getElementById('hide').style.display = 'none'
        }
        document.getElementById('name')[text] = rtn.name
        document.getElementById('artist')[text] = rtn.artist
        if (!oldID) {
          oldID = rtn.id
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((rtn.duration / 60)) + 'm').toString()
        }
        if (oldID !== rtn.id) {
          oldID = rtn.id
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((rtn.duration / 60)) + 'm').toString()
        }

      })
      .catch((error) => {
        console.log('error:', error);
      });
  }

  //document.getElementById('service')[text] = "Apple Music"
  setInterval(() => {
    setApple();
  }, 1000);
}
