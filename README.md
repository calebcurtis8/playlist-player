# playlist-player
 Lightweight JS HTML5 no-dependency responsive mp3 playlist player

# Playlist Player
* Plays a series of mp3s, defined in JSON, as a playlist.
* Lightweight (9kb JS, 3kb CSS), flexible, and responsive.
* No dependencies, light and dark themes.
* Supports timestamped comments to provide more info on a moment or section of the audio.
* Set the theme with class `.theme-dark` or `.theme-light` on the `#PlaylistPlayer`

## ToDo:
* Module export
* Check if provided JSON is already an object, as it would be when used in a module

## Example Installation:
```
<script id="Playlist" type="application/json">
{
  "artist": "Example Artist",
  "album": "First Album",
  "artwork": "./artwork/tree.jpg",
  "tracks":
  [
    {
      "title": "WahOoh",
      "artist": "Saxophone Sketches",
      "file": "./mp3/wahooh.mp3",
      "artwork": "./artwork/tree.jpg",
      "stamps": [
        {
          "time": 13,
          "message": "flutes"
        }
      ]
    },
    {
      "title": "Forest",
      "artist": "Saxophone Sketches",
      "file": "./mp3/saxophone-forest.mp3",
      "artwork": "./artwork/plants.jpg"
    },
    {
      "title": "Phrygian",
      "album": "From another album",
      "artist": "Saxophone Sketches and Friends",
      "file": "./mp3/phrygian-sax.mp3",
      "artwork": "./artwork/sunny.jpg",
      "stamps": [
        {
          "time": 15,
          "message": "A quick message"
        },
        {
          "time": 92,
          "duration": 20,
          "message": "A longer section, marked"
        }
      ]
    }
  ]
}
</script>
<link rel="stylesheet" href="../dist/player.min.css">
<div id="PlaylistPlayer" class="theme-light"></div>
<script src="../dist/player.min.js" charset="utf-8"></script>
<script>
  var Playlist = document.getElementById('Playlist')
  var Player = document.getElementById('PlaylistPlayer')

  /*
    PlaylistPlayer(JSONPlaylist, Element, Separator, Strings/Icons)
  */
  let myplaylist = new PlaylistPlayer(Playlist, Player, ': ',{
    play: '&#9654;',
    pause: '&#x23F8;&#xFE0E;',
    stop: '&#11035;',
    next: '&#x23ED;&#xFE0E;',
    prev: '&#x23EE;&#xFE0E;',
    mute: '&#128263;'
  })
</script>
```
