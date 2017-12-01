/*var imdb = require('imdb');

imdb('tt3659388', function(err, data) {
  if(err)
    console.log(err.stack);

  if(data)
    console.log(data);
});*/

const nodeSpotifyWebhelper = require('node-spotify-webhelper')
const spotify = new nodeSpotifyWebhelper.SpotifyWebHelper()

spotify.getStatus(function(err, res) {
  if (err) return console.error(err);
  console.log(res)
})
