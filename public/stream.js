
'use strict';
var io = io.connect();
var init = false;
io.on("music_updated", async (data) => {
    console.log(data);
    document.querySelector("#btn_group > button.titlebtn").innerText = data.nowplaying.title;
});
window.onload = function(){
    showPage();
}
async function myFunction() {
    
    if (!init) {
        var audio = document.getElementById("audio");
        audio.src = "/stream";
        await audio.load();
        audio.crossOrigin = "anonymous";
        var context = new AudioContext();
        var src = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();
        src.connect(analyser);
        analyser.connect(context.destination);
        analyser.fftSize = 8192;
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");



        var bufferLength = analyser.frequencyBinCount;

        var dataArray = new Uint8Array(bufferLength);

        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;

        var barWidth = (WIDTH / bufferLength) + 3;
        var barHeight;
        var x = 0;

        function renderFrame() {
            requestAnimationFrame(renderFrame);

            x = 0;

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            for (var i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                var r = barHeight + (25 * (i / bufferLength));
                var g = 250 * (i / bufferLength);
                var b = 50;

                // ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                ctx.fillStyle = "#7289DA";
                ctx.fillRect(x, barHeight / HEIGHT, barWidth, barHeight / 3);

                x += barWidth + 1;
            }
        }
        renderFrame();
        init = true;
        changePauseStatus();
        document.getElementById("play").onclick = changePauseStatus;
    }
};

async function showPage() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("main").style.display = "table";
    var audio = document.getElementById("audio");
    const promise = undefined;
    audio.oncanplaythrough = async function () {
        await audio.play();
        
    }
    if (promise !== undefined) {
        promise.then(_ => {
            console.log("Autoplay Started");
        }).catch(error => {
            console.log(error);
        });
    }
    var context = document.getElementById("audio");
    
}

async function changePauseStatus() {

    var audio = document.getElementById("audio");
    if (audio.paused) {
        document.querySelector("#btn_group > button").innerHTML = '<i class="fas fa-pause"></i>'
        audio.play();
    } else {
        document.querySelector("#btn_group > button").innerHTML = '<i class="fas fa-play"></i>'
        audio.pause();
    }
}