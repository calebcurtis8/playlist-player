/**
 * @name PlaylistPlayer
 * @description HTML5 dependency free Playlist Player
 * @constructor
 * @param {list} JSON - JSON list of tracks
 * @param {target} HTMLElement - where to output the transport
 * @param {separator} String - separator between Track Artist and Album
 * @param {strings} Object - Icons with keys corresponding to button names - 'play', 'pause', 'stop', 'prev', 'next', 'mute'
 */

const selectors = {
  buttonActive: 'button.active'
}

const classes = {
  active: 'active',
  hide: 'hidden',
  stamp: 'stamp',
  visible: 'visible'
}

const events = {
  canplay: 'canplay',
  click: 'click',
  ended: 'ended',
  timeupdate: 'timeupdate'
}
export class PlaylistPlayer {
  constructor (list, target, separator, strings) {
    target.player = this
    this.playerElm = target
    this.playerElm.classList.add('playlist-player', 'grid', 'grid-cols-2', 'md:grid-cols-3', 'mx-auto', 'text-text_color', 'bg-bg_color', 'max-w-5xl')
    this.src = JSON.parse(list.innerText)
    this.album = this.src.album || 'ALBUM TITLE'
    this.artist = this.src.artist || 'ARTIST NAME'
    this.artwork = this.src.artwork || null
    this.list = this.src.tracks
    this.debug = this.src.debug
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

  build () {
    this.buildDisplay().then(() => {
      this.setIndex(0)
      this.updateTrackDisplay()
    })
  }

  buildDisplay () {
    return new Promise((resolve, reject) => {
      this.display = this.createElement({
        type: 'div',
        parentElm: this.playerElm,
        cls: ['player-display', 'grid', 'col-span-1', 'md:col-span-2', 'p-4'],
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
        cls: ['list-decimal']
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

      this.audioPlayer.addEventListener(events.timeupdate, this.updateTimeDisplay.bind(this))
      this.audioPlayer.addEventListener(events.ended, this.next.bind(this))
      this.audioPlayer.addEventListener(events.canplay, this.renderStamps.bind(this))

      const divs = ['song', 'artist', 'album', 'progress', 'progressContainer']
      divs.forEach(div => {
        this.display[div] = document.createElement('div')
        this.display[div].setAttribute('data-label', div)
        this.display.appendChild(this.display[div])
      })

      this.buildControls()

      this.list.forEach((track, i) => {
        const item = this.layoutTrack(track, i)
        Promise.resolve(item).then(item => {
          this.listElm.insertBefore(item, this.listElm.childNodes[i])
        })
      })
      resolve(true)
    })
  }

  buildControls () {
    this.display.progressContainer = this.createElement({
      type: 'div',
      parentElm: this.display,
      cls: ['progress-container', 'border-solid', 'border', 'border-border_color', 'w-full', 'cursor-pointer', 'relative', 'my-4', 'h-10']
    })

    this.display.currentTime = this.createElement({
      type: 'div',
      parentElm: this.display.progressContainer,
      cls: ['time']
    })

    this.display.progress = this.createElement({
      type: 'div',
      parentElm: this.display.progressContainer,
      cls: ['h-full', 'inline-block', 'transition-all', 'duration-200', 'pointer-events-none', 'border-r', 'border-border_color', 'z-10', 'bg-gradient-to-r', 'from-blue-200', 'to-blue-300']
    })

    const controlGroup = this.createElement({
      type: 'div',
      parentElm: this.display,
      cls: ['controls']
    })

    const btns = ['play', 'pause', 'stop', 'prev', 'next', 'mute']

    btns.forEach(btn => {
      this[`${btn}Btn`] = this.createElement({
        type: 'button',
        innerHTML: this.strings[btn],
        parentElm: controlGroup,
        attrs: {
          'data-action': btn
        }
      })
      this[`${btn}Btn`].addEventListener(events.click, this[btn].bind(this))
    })
    this.pauseBtn.classList.add(classes.hide)

    // display listeners for seeking and playlist item click
    this.display.progressContainer.addEventListener(events.click, this.seek.bind(this))
    const _this = this
    this.listElm.addEventListener(events.click, (e) => {
      _this.playIndex(e.target.getAttribute('data-index'))
    })
  }

  clearActiveButtons () {
    const buttons = this.listElm.querySelectorAll(selectors.buttonActive)
    buttons.forEach(btn => {
      btn.classList.remove(classes.active)
    })
  }

  setActiveButton (i) {
    const activeTrackButton = this.listElm.querySelector(`button[data-index="${i}"]`)
    if (activeTrackButton) activeTrackButton.classList.add(classes.active)
  }

  mute () {
    this.audioPlayer.savedVolume = this.audioPlayer.volume || 1
    this.audioPlayer.volume = this.audioPlayer.volume > 0 ? 0 : this.audioPlayer.savedVolume
  }

  playIndex (i) {
    this.setIndex(i)
    this.play()
  }

  setIndex (i) {
    this.index = parseInt(i)
    this.clearActiveButtons()
    this.setActiveButton(this.index)
  }

  togglePlayPause ({ playing } = {}) {
    if (playing) {
      this.playBtn.classList.add(classes.hide)
      this.pauseBtn.classList.remove(classes.hide)
      return
    }
    this.playBtn.classList.remove(classes.hide)
    this.pauseBtn.classList.add(classes.hide)
  }

  setTrack () {
    this.audioPlayer.src = this.list[this.index].file
    this.updateTimeDisplay()
    this.updateTrackDisplay()
  }

  play (e) {
    if (!this.audioPlayer.src || !e) this.setTrack()
    this.audioPlayer.play()
    this.togglePlayPause({ playing: true })
  }

  pause () {
    this.audioPlayer.pause()
    this.togglePlayPause({ playing: false })
  }

  stop () {
    this.pause()
    this.audioPlayer.currentTime = 0
  }

  prev () {
    this.setIndex(this.normalizeIndex(this.index - 1))
    this.play()
  }

  next () {
    this.setIndex(this.normalizeIndex(this.index + 1))
    this.play()
  }

  seek (e) {
    let target = e.target
    if (target.classList.contains(classes.stamp)) target = target.parentElement
    const rect = target.getClientRects()[0]
    const seek = ((e.clientX - rect.left) / target.offsetWidth) * this.audioPlayer.duration
    this.audioPlayer.currentTime = seek
  }

  normalizeIndex (i) {
    const rem = i % this.list.length
    return rem > 0 ? rem : 0
  }

  layoutTrack (track, i) {
    const item = document.createElement('li')
    item.innerHTML =
     `<button data-index="${i}"> <span class="title">${track.title}</span>
     <div class="ml-4 inline-block text-gray-300">
      <span class="artist">${track.artist || this.artist}</span>${this.separator}<span class="album">${track.album || this.album}</span>
     </div>
     </button>`
    return item
  }

  updateTrackDisplay () {
    const display = this.display
    const index = this.index
    const list = this.list
    display.song.innerText = list[index].title
    display.artist.innerText = list[index].artist || this.artist
    display.album.innerText = list[index].album || this.album
    display.artwork.src = list[index].artwork || this.artwork
  }

  updateTimeDisplay () {
    const display = this.display
    display.currentTime.innerText = `${timeFormat(this.audioPlayer.currentTime)} / ${timeFormat(this.audioPlayer.duration)}`
    display.progress.style.width = ((this.audioPlayer.currentTime / this.audioPlayer.duration) * 100) + '%'

    if (this.audioPlayer.hasStamps) this.checkStampsForDisplay()
  }

  checkStampsForDisplay () {
    const song = this.list[this.index]
    if (!song.stamps) return
    const curTime = this.audioPlayer.currentTime
    song.stamps.forEach(stamp => {
      // 5 second window for displaying
      let visibleTime = 5
      if (stamp.duration) {
        visibleTime = stamp.duration
      }
      if (curTime >= stamp.time && curTime <= stamp.time + visibleTime) {
        stamp.elm.classList.add(classes.visible)
      } else {
        stamp.elm.classList.remove(classes.visible)
      }
    })
  }

  renderStamps () {
    this.eraseStamps()
    const song = this.list[this.index]
    if (!song.stamps) return
    this.audioPlayer.hasStamps = true
    song.stamps.forEach(stamp => {
      stamp.elm = this.createElement({
        type: 'span',
        cls: [classes.stamp],
        parentElm: this.display.progressContainer,
        attrs: {
          'data-label': stamp.message
        }
      })
      stamp.elm.style.left = (stamp.time / this.audioPlayer.duration) * 100 + '%'
      if (stamp.duration) {
        stamp.elm.style.width = (stamp.duration / this.audioPlayer.duration) * 100 + '%'
      }
    })
  }

  eraseStamps () {
    this.audioPlayer.hasStamps = false
    const stamps = this.display.progressContainer.querySelectorAll(`.${classes.stamp}`)
    stamps.forEach(stamp => {
      stamp.remove()
    })
  }

  createElement (opts) {
    const elm = document.createElement(opts.type)
    if (opts.cls) elm.classList.add(...opts.cls)
    if (opts.attrs) {
      for (const [key, value] of Object.entries(opts.attrs)) {
        elm.setAttribute(key, value)
      }
    }
    if (opts.innerHTML) elm.innerHTML = opts.innerHTML
    if (opts.parentElm) opts.parentElm.appendChild(elm)
    return elm
  }
}

window.PlaylistPlayer = PlaylistPlayer

function timeFormat (duration) {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600)
  const mins = ~~((duration % 3600) / 60)
  const secs = ~~duration % 60

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = ''

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '')
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '')
  ret += '' + secs
  return ret
}
