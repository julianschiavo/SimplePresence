const { webFrame } = require('electron');
const snek = document.getElementById('snek');
const counter = document.getElementById('boops');

webFrame.setZoomLevelLimits(1, 1);

window.boops = 0;
function boop() {
  window.boops++;
  counter.innerHTML = `${window.boops} BOOPS`;
}

const config = require('../config.json')
console.log(config.defaultText.details)
console.log(config.defaultText.state)
console.log(config.defaultText.imageSmallText)
var text = "textContent" in document.body ? "textContent" : "innerText";
document.getElementById('two')[text] = config.defaultText.details
document.getElementById('three')[text] = config.defaultText.state
document.getElementById('four')[text] = config.defaultText.imageSmallText
document.getElementById('one')[text] = config.defaultText.imageLargeText