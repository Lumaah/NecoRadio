let currentMode = 'mode1';
let songsList = [];
let playedSongs = [];
const audioPlayer = document.getElementById('radio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const volumeSlider = document.getElementById('volume-slider');

function setMode(mode) {
    currentMode = mode;
    fetchSongsList().then(() => {
        playedSongs = [];
        playRandomSong();
    }).catch(error => {
        console.error('Error fetching songs list:', error);
    });
}

function fetchSongsList() {
    return fetch(`${currentMode}.json`)
        .then(response => response.json())
        .then(data => {
            songsList = data;
        });
}

function playRandomSong() {
    if (songsList.length > 0) {
        // Get a list of unplayed songs
        const unplayedSongs = songsList.filter(song => !playedSongs.includes(song));
        
        // If all songs have been played, reset the playedSongs array
        if (unplayedSongs.length === 0) {
            playedSongs = [];
        }
        
        // Choose a random song from the unplayed songs list
        const randomIndex = Math.floor(Math.random() * unplayedSongs.length);
        const selectedSong = unplayedSongs[randomIndex];
        
        // Add the selected song to the playedSongs array
        playedSongs.push(selectedSong);
        
        // Set and play the selected song
        audioPlayer.src = selectedSong;
        audioPlayer.play().catch(error => {
            console.log('Playback error:', error);
        });
        playPauseBtn.textContent = 'Pause';
    }
}

audioPlayer.addEventListener('ended', playRandomSong);

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.log('Playback error:', error);
        });
        playPauseBtn.textContent = 'Pause';
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = 'Play';
    }
}

function skipSong() {
    playRandomSong();
}

function setVolume(volume) {
    audioPlayer.volume = volume;
}

// Set the initial volume to 50%
volumeSlider.value = 0.5;
setVolume(0.5);
