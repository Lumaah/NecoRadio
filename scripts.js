let currentMode = 'mode1';
let songsList = [];
let playedSongs = [];
const audioPlayer = document.getElementById('radio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const volumeSlider = document.getElementById('volume-slider');
const visualizer = document.getElementById('visualizer');
const gif = document.getElementById('playing-gif');

const canvasCtx = visualizer.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audioPlayer);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

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
        const unplayedSongs = songsList.filter(song => !playedSongs.includes(song));
        
        if (unplayedSongs.length === 0) {
            playedSongs = [];
        }
        
        const randomIndex = Math.floor(Math.random() * unplayedSongs.length);
        const selectedSong = unplayedSongs[randomIndex];
        
        playedSongs.push(selectedSong);
        
        audioPlayer.src = selectedSong;
        audioPlayer.play().catch(error => {
            console.log('Playback error:', error);
        });
        playPauseBtn.textContent = 'Pause';
        gif.style.display = 'block';
        audioCtx.resume().then(() => {
            drawVisualizer();
        });
    }
}

audioPlayer.addEventListener('ended', () => {
    gif.style.display = 'none';
    playRandomSong();
});

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.log('Playback error:', error);
        });
        playPauseBtn.textContent = 'Pause';
        gif.style.display = 'block';
        audioCtx.resume();
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = 'Play';
        gif.style.display = 'none';
    }
}

function skipSong() {
    playRandomSong();
}

function setVolume(volume) {
    audioPlayer.volume = volume;
}

volumeSlider.value = 0.5;
setVolume(0.5);

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    
    analyser.getByteFrequencyData(dataArray);
    
    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
    
    const barWidth = (visualizer.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(x, visualizer.height - barHeight / 2, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}
