const fileUpload = document.getElementById('fileSelect');
const balanceFader = document.getElementById('balance');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const statusBar = document.getElementById('status');

const context = new AudioContext();
const split = context.createChannelSplitter(2);
const leftGain = context.createGain();
const rightGain = context.createGain();
const merge = context.createChannelMerger(2);

let file;

split.connect(leftGain, 0, 0);
split.connect(rightGain, 1, 0);

leftGain.connect(merge, 0, 0);
rightGain.connect(merge, 0, 1);

merge.connect(context.destination);

function decodeAudio() {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(fileUpload.files[0]);
    fileReader.onload = event => {
        statusBar.innerText = 'Loading...';
        if (file != null) {
            file.node.disconnect();
            file = null;
        }
        context.decodeAudioData(event.target.result)
            .then(buffer => {
                file = {
                    buffer,
                    node: context.createBufferSource()
                };
                setupNode(file.node, file.buffer);
                pauseBtn.removeAttribute('disabled');
                restartBtn.removeAttribute('disabled');
                statusBar.innerText = 'Playing';
            }, err => {
                statusBar.innerText = 'Loading failed';
                console.error(err);
            });
    };
    fileReader.onerror = err => {
        statusBar.innerText = 'Loading failed';
        console.error(err);
    };
}

function balanceAudio() {
    const value = parseInt(balanceFader.value);
    const leftChannelGain = Math.min(100, 100 - value);
    const rightChannelGain = Math.min(100, 100 + value);

    leftGain.gain.setValueAtTime(leftChannelGain / 100, context.currentTime);
    rightGain.gain.setValueAtTime(rightChannelGain / 100, context.currentTime);
}

function controlPlay() {
    pauseBtn.removeAttribute('disabled');
    playBtn.setAttribute('disabled', '');
    context.resume();
}

function controlPause() {
    playBtn.removeAttribute('disabled');
    pauseBtn.setAttribute('disabled', '');
    context.suspend();
}

function controlRestart() {
    file.node.disconnect();
    file.node = context.createBufferSource();
    setupNode(file.node, file.buffer);
}

function setupNode(node, buffer) {
    node.buffer = buffer;
    node.connect(split);
    node.start(0);
}

fileUpload.addEventListener('change', decodeAudio);
balanceFader.addEventListener('input', balanceAudio);
playBtn.addEventListener('click', controlPlay);
pauseBtn.addEventListener('click', controlPause);
restartBtn.addEventListener('click', controlRestart);
