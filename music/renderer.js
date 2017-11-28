const {
  webFrame
} = require('electron');
const applescript = require('osascript-promise')
const parse = require('parse-duration')
const moment = require('moment')

webFrame.setZoomLevelLimits(1, 1);

const config = require('../config.json')
var text = "textContent" in document.body ? "textContent" : "innerText";
/*document.getElementById('details')[text] = config.textConfig.details
document.getElementById('state')[text] = config.textConfig.state
document.getElementById('stext')[text] = config.imageConfig.smallText
document.getElementById('ltext')[text] = config.imageConfig.largeText
document.getElementById('skey')[text] = config.imageConfig.smallKey
document.getElementById('lkey')[text] = config.imageConfig.largeKey
*/
var oldID
var openTimestamp

async function setText() {
applescript(`tell application "iTunes"	if player state is playing or player state is paused then		set tname to (get name of the current track)
                set tdur to (get duration of the current track)
set tartist to (get artist of the current track)
set tid to (get id of the current track)		return { name: tname, duration: tdur, artist:tartist, id: tid }	end ifend tell`)
          .then((rtn) => {
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

setInterval(() => {
    setText();
  }, 1000);