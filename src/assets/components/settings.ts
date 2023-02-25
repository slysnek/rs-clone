export const settings = document.createElement('div');

const musicSetting = document.createElement('p');
const audioWrapper = document.createElement('div');
const playButton = document.createElement('div');
const volumeInput = document.createElement('input');
volumeInput.type = 'range';
volumeInput.min = '0';
volumeInput.max = '100';
volumeInput.value = '30';
volumeInput.step = '10';
console.log(volumeInput.value);
musicSetting.textContent = 'Music';
audioWrapper.classList.add('audio-wrapper');
playButton.classList.add('play');
volumeInput.classList.add('volume-input');

const audio = new Audio();
const menu = document.querySelector('.menu') as HTMLElement;
menu.appendChild(audio);

audio.src = '../../assets/music/test_music.mp3';
audio.volume = 0.3;
audio.loop = true;
audio.classList.add('audio');

audioWrapper.appendChild(musicSetting);
audioWrapper.appendChild(playButton);
audioWrapper.appendChild(volumeInput);
settings.appendChild(audioWrapper);

playButton.addEventListener('click', () => {
  if (!audio.paused) {
    audio.pause();
    playButton.classList.remove('pause');
    playButton.classList.add('play');
  } else {
    audio.play();
    playButton.classList.remove('play');
    playButton.classList.add('pause');
  }
});

volumeInput.addEventListener('change', () => {
  audio.volume = Number(volumeInput.value) / 100;
});