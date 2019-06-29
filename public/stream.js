'use strict';
var io = io.connect();

io.on("music_updated", async (data) => {
    console.log(data);
    audio.src = "/stream";
    await audio.load();
    // await audio.play(); -- REMOVE FOR PAUSED SUPPORT
    document.querySelector("#btn_group > button.titlebtn").innerText = data.nowplaying.title;
});
var myVar;
async function myFunction() {
    var audio = document.getElementById("audio");
    audio.src = "/stream";
    await audio.load();
    var context = new AudioContext();
    audio.crossOrigin = "anonymous";
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();
    myVar = setTimeout(function () { showPage(context) }, 1000);
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 8192;

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = (WIDTH / bufferLength)+3;
    var barHeight;
    var x = 0;

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        x = 0;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            // ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            ctx.fillStyle = "#7289DA";
            ctx.fillRect(x, barHeight / HEIGHT, barWidth, barHeight / 3);

            x += barWidth + 1;
        }
    }
    renderFrame();
};

function showPage(context) {
    document.getElementById("loader").style.display = "none";
    document.getElementById("main").style.display = "table";
    var audio = document.getElementById("audio");
    const promise = audio.play();
    if (promise !== undefined) {
        promise.then(_ => {
            console.log("Autoplay Started");
        }).catch(error => {
            location.reload();
        });
    }
    context.resume().then(() => {
        io.emit("loaded");
        console.log('Playback resumed successfully');
    });
}

function changePauseStatus() {
    var audio = document.getElementById("audio");
    if (audio.paused) {
        document.querySelector("#btn_group > button").innerHTML = '<i class="fas fa-pause"></i>'
        audio.play();
    } else {
        document.querySelector("#btn_group > button").innerHTML = '<i class="fas fa-play"></i>'
        audio.pause();
    }
}
