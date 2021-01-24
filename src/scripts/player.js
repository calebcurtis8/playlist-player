function timeFormat(duration)
{
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

export class PlaylistPlayer {
  constructor(list, target, separator, strings) {
    target.player = this
    this.playerElm = target
    this.playerElm.classList.add('playlist-player')
    this.src = JSON.parse(list.innerText)
    this.album = this.src.album || "ALBUM TITLE"
    this.artist = this.src.artist || "ARTIST NAME"
    this.artwork = this.src.artwork || null
    this.list = this.src.tracks
    this.separator = separator || ': '
    this.strings = strings || {
      play: '&#9654;',
      pause: '&#x23F8;&#xFE0E;',
      stop: '&#11035;',
      next: '&#x23ED;&#xFE0E;',
      prev: '&#x23EE;&#xFE0E;',
      mute: '&#128263;'
    }
    this.build()
  }
  mute() {
    this.log('mute')
    if(this.audioPlayer.volume > 0){
      this.audioPlayer.savedVolume = this.audioPlayer.volume
      this.audioPlayer.volume = 0
    } else {
      this.audioPlayer.volume = this.audioPlayer.savedVolume || 1
    }
  }
  build() {
    this.buildDisplay()
    this.updateTrackDisplay()
  }
  buildDisplay() {
    //display elements
    this.display = this.createElement({
      type: 'div',
      parentElm: this.playerElm,
      cls: 'player-display',
      attrs: null
    })
    this.display.artwork = this.createElement({
      type: 'img',
      cls: null,
      attrs: {
        src: this.artwork
      }
    })
    this.display.parentElement.insertBefore(this.display.artwork, this.display)

    this.listElm = this.createElement({
      type: 'ol',
      parentElm: this.display,
      cls: null
    })
    this.audioPlayer = this.createElement({
      type: 'audio',
      parentElm: this.playerElm,
      cls: null
    })
    this.currentArtist = this.createElement({
      type: 'div',
      parentElm: this.display,
      cls: null
    })

    this.audioPlayer = document.createElement('audio')
    //player listeners
    this.audioPlayer.addEventListener('timeupdate', this.updateTimeDisplay.bind(this))
    this.audioPlayer.addEventListener('ended', this.next.bind(this))
    this.audioPlayer.addEventListener('canplay', this.renderStamps.bind(this))

    let divs = ['song','artist','album','progress','progressContainer']
    let _this = this
    divs.forEach( div => {
       _this.display[div] = document.createElement('div')
       _this.display[div].setAttribute('data-label', div)
       _this.display.appendChild(_this.display[div])
    })

    this.buildControls()

    this.list.forEach( (track,i) => {
      let item = this.layoutTrack(track, i)
      Promise.resolve(item).then( item => {
        this.listElm.insertBefore(item, this.listElm.childNodes[i])
      })
    })
  }
  buildControls(){
    this.display.progressContainer = this.createElement({
      type: 'div',
      parentElm: this.display,
      cls: 'progress-container'
    })
    this.display.currentTime = this.createElement({
      type: 'div',
      parentElm: this.display.progressContainer,
      cls: 'time'
    })
    this.display.progress = this.createElement({
      type: 'div',
      parentElm: this.display.progressContainer,
      cls: 'progress'
    })

    let controlGroup = this.createElement({
      type: 'div',
      parentElm: this.display,
      cls: 'controls'
    })

    //create buttons
    let btns = ["play","pause","stop","prev","next","mute"]
    let _this = this
    btns.forEach( btn => {
      _this[`${btn}Btn`] = this.createElement({
        type: 'button',
        innerHTML: this.strings[btn],
        parentElm: controlGroup,
        attrs: {
          'data-action': btn
        }
      })
      _this[`${btn}Btn`].addEventListener('click', _this[btn].bind(_this))
    })
    this.pauseBtn.classList.add('hide')

    //display listeners for seeking and playlist item click
    this.display.progressContainer.addEventListener('click', this.seek.bind(this))
    this.listElm.addEventListener('click', (e) => {
      _this.playIndex(e.target.getAttribute('data-index'))
    })
  }
  playIndex(i) {
    i = parseInt(i) // make sure is integer
    this.setIndex(i)
    this.setTrack()
    this.play()
  }
  setIndex(i){
    this.index = i
    let activeTrackButton = this.listElm.querySelector(`button[data-index="${i}"]`)
    this.clearActiveButtons()
    activeTrackButton ? activeTrackButton.classList.add('active') : null;
  }
  clearActiveButtons(){
    let buttons = this.listElm.querySelectorAll(`button.active`)
    buttons.forEach( btn => {
      btn.classList.remove('active')
    })
  }
  setTrack(){
    this.audioPlayer.src = this.list[this.index].file
    this.updateTimeDisplay()
    this.updateTrackDisplay()
  }
  play() {
    this.log('play')
    if(!this.index) this.setIndex(0)
    if(!this.audioPlayer.src) this.setTrack()
    this.audioPlayer.play()
    this.playBtn.classList.add('hide')
    this.pauseBtn.classList.remove('hide')
  }
  pause() {
    this.log('pause')
    this.audioPlayer.pause()
    this.pauseBtn.classList.add('hide')
    this.playBtn.classList.remove('hide')
  }
  stop() {
    this.log('stop')
    this.pause()
    this.audioPlayer.currentTime = 0
  }
  prev() {
    this.log('prev')
    this.setIndex(this.normalizeIndex(this.index - 1))
    this.setTrack()
    this.play()
  }
  next() {
    this.log('next')
    this.setIndex(this.normalizeIndex(this.index + 1))
    this.setTrack()
    this.play()
  }
  seek(e){
    let target = e.target
    if(target.classList.contains('stamp')) target = target.parentElement
    let rect = target.getClientRects()[0]
    let seek = ((e.clientX - rect.left) / target.offsetWidth) * this.audioPlayer.duration
    this.audioPlayer.currentTime = seek
  }
  normalizeIndex(i){
    if(i < this.list.length && i >= 0){
      return i
    } else {
      return 0
    }
  }
  layoutTrack(track, i){
    let item = document.createElement('li')
    item.innerHTML =
     `<button data-index="${i}"> <span class="title">${track.title}</span>
     <div class="artist-album__wrapper">
      <span class="artist">${track.artist || this.artist}</span>${this.separator}<span class="album">${ track.album || this.album }</span>
     </div>
     </button>`;
    return item
  }
  updateAlbumDisplay(){
    let index = this.index || 0
    this.display.artist.innerText = this.list[index].artist || this.artist
    this.display.album.innerText = this.list[index].album || this.album
  }
  updateTrackDisplay(){
    let index = this.index || 0
    let display = this.display
    display.song.innerText = this.list[index].title
    display.artist.innerText = this.list[index].artist || this.artist
    display.album.innerText = this.list[index].album || this.album
    display.artwork.src = this.list[index].artwork || this.artwork
  }
  updateTimeDisplay(){
    let display = this.display
    display.currentTime.innerText = `${timeFormat(this.audioPlayer.currentTime)} / ${timeFormat(this.audioPlayer.duration)}`
    display.progress.style.width = ((this.audioPlayer.currentTime / this.audioPlayer.duration) * 100) + '%'

    if(this.audioPlayer.hasStamps) this.checkStampsForDisplay()
  }
  checkStampsForDisplay(){
    let song = this.list[this.index]
    if(!song.stamps) return;
    let curTime = this.audioPlayer.currentTime
    song.stamps.forEach(stamp => {
      //5 second window for displaying
      let visibleTime = 5
      if(stamp.duration){
        visibleTime = stamp.duration
      }
      if(curTime >= stamp.time && curTime <= stamp.time + visibleTime){
        stamp.elm.classList.add('visible')
      } else {
        stamp.elm.classList.remove('visible')
      }
    })

  }
  renderStamps(){
    this.eraseStamps()
    let song = this.list[this.index]
    if(!song.stamps) return
    this.audioPlayer.hasStamps = true
    song.stamps.forEach( stamp => {
      stamp.elm = this.createElement({
        type: 'span',
        cls: 'stamp',
        parentElm: this.display.progressContainer,
        attrs: {
          'data-label': stamp.message
        }
      })
      stamp.elm.style.left = (stamp.time / this.audioPlayer.duration) * 100 + '%'
      if(stamp.duration){
        stamp.elm.style.width = (stamp.duration / this.audioPlayer.duration) * 100 + '%'
      }
    })
  }
  eraseStamps(){
    this.audioPlayer.hasStamps = false
    let stamps = this.display.progressContainer.querySelectorAll('.stamp')
    stamps.forEach( stamp => {
      stamp.remove()
    })
  }
  createElement(opts){
    let elm = document.createElement(opts.type)
    if(opts.cls) elm.classList.add(opts.cls)
    if(opts.attrs){
      for (const [key, value] of Object.entries(opts.attrs)) {
        elm.setAttribute(key,value)
      }
    }
    if(opts.innerHTML) elm.innerHTML = opts.innerHTML
    if(opts.parentElm) opts.parentElm.appendChild(elm)
    return elm
  }
  destroy() {

  }
  log(msg){
    // console.log(msg)
  }
}

window.PlaylistPlayer = PlaylistPlayer
