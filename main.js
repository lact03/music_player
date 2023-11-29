// create audio element
const sourceEl = document.createElement("source");
const currentTrack = document.createElement("audio");

currentTrack.appendChild(sourceEl);

// songData elements
const imgEl = document.querySelector(".song-img-container > img");
const titleEl = document.querySelector(".song-title-container > h4");
const artistNameEl = document.querySelector(".song-artist-name-container > p");

// catalog contents elements
const lyricsContentEl = document.getElementById("lyrics-el");
const albumsContentEl = document.getElementById("albums-el");
const artistsContentEl = document.getElementById("artists-el");
const catalogContent = [lyricsContentEl, albumsContentEl, artistsContentEl];

// tab buttons
const tabs = document.querySelectorAll(".tab-buttons-container > a");
tabs.forEach((tab) => {
  tab.addEventListener("click", switchTab);
});
function switchTab(e) {
  catalogContent.forEach((catalog) => {
    catalog.classList.add("d-none");
    if (catalog.id === e.target.ariaLabel) {
      catalog.classList.remove("d-none");
    }
  });
}

// music controls elements
const playPauseBtn = document.querySelector(".play-pause-button");
const nextBtn = document.querySelector(".fa-forward-step");
const prevBtn = document.querySelector(".fa-backward-step");

// Add an event listener for the buttons: spaceBar, leftArrowKey, rightArrowKey
document.addEventListener("keydown", (event) => {
  // Check if the event target is not an input element
  if (!event.target.tagName.toLowerCase().match(/input|textarea/)) {
    switch (event.code) {
      case "Space": // Spacebar for playing the current track
        event.preventDefault(); // Prevent the default behavior of scrolling the page down when pressing spacebar
        playPauseTrack(); // Call a function to play the current track
        break;
      case "ArrowLeft": // Left arrow key for moving to the previous track
        event.preventDefault(); // Prevent the default behavior of navigating back in the browser
        prevTrack(); // Call a function to move to the previous track
        break;
      case "ArrowRight": // Right arrow key for moving to the next track
        event.preventDefault(); // Prevent the default behavior of navigating forward in the browser
        nextTrack(); // Call a function to move to the next track
        break;
    }
  }
});

// input[type="range"] and music time elements
const progressBar = document.querySelector(".progress-bar");
const currentTimeEl = document.querySelector(".current-time");
const totalDurationEl = document.querySelector(".total-duration");

let trackIndex = 0;
let isPlaying = false;
let updateTimeInterval;

// stored data
const musicList = [
  {
    title: "",
    audioLink: "https://audio.jukehost.co.uk/fgehcEedXugYdgH1yNLHJQ6nBcCuIgy0",
    songId: "9393794",
    artistId: "45dkTj5sMRSjrmBSBeiHym",
    artistName: "",
    imgUrl: "",
    lyrics: "",
    albums: [],
    relatedArtists: [],
  },
  {
    title: "",
    audioLink: "https://audio.jukehost.co.uk/NcuXammbGsxbxZ5lTBnZkmpNfKINxeVU",
    songId: "4479242",
    artistId: "4HPuFCMUiNcV4f3ew0flbZ",
    artistName: "",
    imgUrl: "",
    lyrics: "",
    albums: [],
    relatedArtists: [],
  },
  {
    title: "",
    audioLink: "https://audio.jukehost.co.uk/igeYuDDZ9fQCoU4iTIJBFLrRnfzUkpEI",
    songId: "3143252",
    artistId: "6qqNVTkY8uBg9cP3Jd7DAH",
    artistName: "",
    imgUrl: "",
    lyrics: "",
    albums: [],
    relatedArtists: [],
  },
];

// rapid api key
const rapidApiKey = "";

// fetch data
getData();
async function getData() {
  for (let i = 0; i < musicList.length; i++) {
    const {
      songApiConfig,
      lyricsApiConfig,
      albumsApiConfig,
      relatedArtistsApiConfig,
    } = apiConfig(musicList[i]);

    try {
      const [songData, lyricsData, albumsData, relatedArtistsData] =
        await Promise.all([
          axios(songApiConfig),
          axios(lyricsApiConfig),
          axios(albumsApiConfig),
          axios(relatedArtistsApiConfig),
        ]);
      console.log(songData);
      console.log(lyricsData);
      console.log(albumsData);
      console.log(relatedArtistsData);
      musicList[i] = {
        ...musicList[i],
        title: songData.data.song.title,
        artistName: songData.data.song.artist_names,
        imgUrl: songData.data.song.custom_song_art_image_url,
        lyrics: lyricsData.data.lyrics.lyrics.body.html,
        albums: albumsData.data.data.artist.discography.albums.items,
        relatedArtists: relatedArtistsData.data.artists,
      };
    } catch (err) {
      console.log(err);
    }
  }

  loadTrack(trackIndex); // load first track
}

// API CONFIG RETURN CONFIG BASED ON ID
function apiConfig({ songId, artistId }) {
  return {
    songApiConfig: {
      method: "GET",
      url: "https://genius-song-lyrics1.p.rapidapi.com/song/details/",
      params: { id: songId },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "genius-song-lyrics1.p.rapidapi.com",
      },
    },
    lyricsApiConfig: {
      method: "GET",
      url: "https://genius-song-lyrics1.p.rapidapi.com/song/lyrics/",
      params: { id: songId },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "genius-song-lyrics1.p.rapidapi.com",
      },
    },
    albumsApiConfig: {
      method: "GET",
      url: "https://spotify23.p.rapidapi.com/artist_albums/",
      params: {
        id: artistId,
        offset: "0",
        limit: "100",
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
      },
    },
    relatedArtistsApiConfig: {
      method: "GET",
      url: "https://spotify23.p.rapidapi.com/artist_related/",
      params: {
        id: artistId,
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
      },
    },
  };
}

// function for loading track
function loadTrack(trackIndex) {
  console.log("Track Loaded");
  clearInterval(updateTimeInterval);

  const {
    audioLink,
    title,
    artistName,
    imgUrl,
    lyrics,
    albums,
    relatedArtists,
  } = musicList[trackIndex]; // destructuring data from music list

  // rendering data
  sourceEl.src = audioLink;
  currentTrack.load(); // reload track especially when playing NEXT track
  isAudioReady(); // check if the audio is ready before updating time
  imgEl.src = imgUrl;
  titleEl.innerHTML = title;
  artistNameEl.innerHTML = artistName;
  lyricsContentEl.innerHTML = lyrics;
  renderAlbums(albums);
  renderArtists(relatedArtists);
}

// function for rendering albums of the current artist
function renderAlbums(albums) {
  albumsContentEl.innerHTML = "";
  albums.forEach((album) => {
    const albumDiv = document.createElement("div");
    albumDiv.className = "album";

    const anchor = document.createElement("a");
    anchor.href = album.releases.items[0].sharingInfo.shareUrl;
    anchor.target = "_blank";

    const imgDiv = document.createElement("div");
    imgDiv.className = "album-image-container";

    const img = document.createElement("img");
    img.src = album.releases.items[0].coverArt.sources[2].url;
    img.alt = "album image";

    const albumTitle = document.createElement("p");
    albumTitle.className = "album-title";
    albumTitle.innerText = album.releases.items[0].name;

    const albumDate = document.createElement("p");
    albumDate.className = "album-date";
    albumDate.innerText = album.releases.items[0].date.year;

    imgDiv.append(img);
    anchor.append(imgDiv);
    anchor.append(albumTitle);
    albumDiv.append(anchor);
    albumDiv.append(albumDate);
    albumsContentEl.append(albumDiv);
  });
}

// function for rendering related artists
function renderArtists(artists) {
  artistsContentEl.innerHTML = "";
  artists.forEach((artist) => {
    const artistDiv = document.createElement("div");
    artistDiv.className = "artist";

    const artistLink = document.createElement("a");
    artistLink.href = artist.external_urls.spotify;
    artistLink.target = "_blank";

    const artistImgDiv = document.createElement("div");
    artistImgDiv.className = "artist-image-container";

    const artistImg = document.createElement("img");
    artistImg.src = artist.images[0].url;

    const artistName = document.createElement("p");
    artistName.innerHTML = artist.name;

    artistImgDiv.append(artistImg);
    artistLink.append(artistImgDiv);
    artistDiv.append(artistLink);
    artistImgDiv.insertAdjacentElement("afterend", artistName);
    artistsContentEl.append(artistDiv);
  });
}

// play pause event listener and function
playPauseBtn.addEventListener("click", playPauseTrack);
function playPauseTrack() {
  isPlaying ? pauseTrack() : playTrack(); // determine whether the music is playing or not
}

// function to play track
function playTrack() {
  updateTimeInterval = setInterval(updateTime, 1000); // create set interval for updating time
  isPlaying = true;
  currentTrack.play();
  playPauseBtn.classList.remove("fa-circle-play");
  playPauseBtn.classList.add("fa-circle-pause");
}

// function to pause track
function pauseTrack() {
  clearInterval(updateTimeInterval);
  isPlaying = false;
  currentTrack.pause();
  playPauseBtn.classList.remove("fa-circle-pause");
  playPauseBtn.classList.add("fa-circle-play");
}

// function for checking if the audio is finished and playing next track
currentTrack.addEventListener("ended", nextTrack);

// function to play next track
nextBtn.addEventListener("click", nextTrack);
function nextTrack() {
  trackIndex += 1;
  if (trackIndex === musicList.length) {
    trackIndex = 0;
  }
  loadTrack(trackIndex);
  playTrack();
}

// function to play prev track
prevBtn.addEventListener("click", prevTrack);
function prevTrack() {
  // check if it's the first music and prevent for playing the prev track
  if (trackIndex === 0) {
    currentTrack.currentTime = 0;
  } else {
    trackIndex -= 1;
  }
  loadTrack(trackIndex);
  playTrack();
}

// function for updating time
function updateTime() {
  currentTimeEl.innerHTML = convertSecondsToMinutes(currentTrack.currentTime);
  totalDurationEl.innerHTML = convertSecondsToMinutes(currentTrack.duration);

  progressBar.value = (currentTrack.currentTime / currentTrack.duration) * 100; // update the position of the thumb
  progressBar.style.backgroundSize =
    (currentTrack.currentTime / currentTrack.duration) * 100 + "% 100%"; // update the backgroundsize of the custom track
}

// function for checking if the audio is ready before updating time because it's displaying (NaN)
function isAudioReady() {
  currentTrack.addEventListener("canplaythrough", updateTime);
}

// converting seconds to minutes
function convertSecondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// function for updating time based on input
progressBar.addEventListener("input", changeProgress);
function changeProgress(e) {
  currentTrack.currentTime = (e.target.value / 100) * currentTrack.duration;
  updateTime();
}
