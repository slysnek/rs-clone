import './main.scss';
import './assets/fonts/fonts.scss'
import Phaser from 'phaser';

const audio = new Audio;

audio.src = './assets/test-folder/music/test_music.mp3'
audio.controls = true;

document.body.append(audio)