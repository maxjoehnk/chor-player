const fileUpload = document.getElementById('fileSelect');
const balanceFader = document.getElementById('balance');

const context = new AudioContext();
const source = context.createBufferSource();
const split = context.createChannelSplitter(2);
const leftGain = context.createGain();
const rightGain = context.createGain();
const merge = context.createChannelMerger(2);

split.connect(leftGain, 0, 0);
split.connect(rightGain, 1, 0);

leftGain.connect(merge, 0, 0);
rightGain.connect(merge, 0, 1);

merge.connect(context.destination);

function decodeAudio() {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(fileUpload.files[0]);
    fileReader.onload = event => {
        context.decodeAudioData(event.target.result)
            .then(buffer => {
                source.buffer = buffer;
                source.connect(split);
                source.start(0);
            }, err => console.error(err));
    };
    fileReader.onerror = err => console.error(err);
}

function balanceAudio() {
    const value = parseInt(balanceFader.value);
    const leftChannelGain = Math.min(100, 100 - value);
    const rightChannelGain = Math.min(100, 100 + value);

    console.log(value, leftChannelGain, rightChannelGain);

    leftGain.gain.setValueAtTime(leftChannelGain / 100, context.currentTime);
    rightGain.gain.setValueAtTime(rightChannelGain / 100, context.currentTime);
}

fileUpload.addEventListener('change', decodeAudio);
balanceFader.addEventListener('input', balanceAudio);
