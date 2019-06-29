const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Station = require('@kefir100/radio-engine');
const fs = require('fs');
const station = new Station.Station({
  error: (...args) => { }
});

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set("views", __dirname + "/views");
app.use("/assets", express.static(__dirname + '/public'));
const files = fs.readdirSync('./Musics');
files.forEach(item => {
  station.addTrack({ path: './Musics', file: item });
});

app.get('/stream', (req, res) => {
  station.connectListener(req, res);
});

app.get('/', (req, res) => {
  res.render("index", { data: getInfo() });
});

io.on('connection', function (socket) {
  socket.once("loaded", () => {
    socket.emit("music_updated", getInfo());
  })
});

let currentTrack;
station.on('nextTrack', track => {
  currentTrack = track;
  io.emit("music_updated", getInfo())
  console.log(currentTrack);
});

app.get('/info', (req, res) => {
  res.json(getInfo());
});

station.start({
  shuffle: true,
});

server.listen(1543, () => {
  console.log("Server On");
});

function getInfo() {
  const raw = currentTrack.getMeta().raw;
  const data = {};
  data.playlist = station.playlist.map(el => {
    return {
      name: el.track.fsStats.name,
      duration: el.track.fsStats.duration
    }
  });
  const array = currentTrack.fsStats.name.split(".mp3");
  const title = array[0] + ` - [${secToHHMMSS(currentTrack.fsStats.duration / 1000)}]`
  if (raw.APIC) {
    data.nowplaying = {
      title: title,
      track: currentTrack,
      raw: {
        TIT2: raw.TIT2
      },
      image: {
        type: raw.APIC.mime,
        data: raw.APIC.imageBuffer.toString("base64")
      }
    }
    return data;
  } else {
    data.nowplaying = {
      title: title,
      track: currentTrack,
      raw: raw,
      image: null
    };
    return data;
  }
}

function secToHHMMSS(second) {
  if (isNaN(second)) return "Live";
  if (second === 0 || second === "0") return "00:00";
  let sec_num = parseInt(second, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);
  if (hours < 10) {hours = "0" + hours;}
  if (minutes < 10) {minutes = "0" + minutes;}
  if (seconds < 10) {seconds = "0" + seconds;}
  if (hours <= 0) {return minutes + ':' + seconds;} else {return hours + ':' + minutes + ':' + seconds;}
} 