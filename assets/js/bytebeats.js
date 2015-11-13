// MIT Licensed (https://martyn.pw/projects/bytebeats/LICENSE)
// Inspired by viznut: http://countercomplex.blogspot.nl/2011/10/algorithmic-symphonies-from-one-line-of.html

var musicObjects = [];
var canvas = document.getElementById('visualizer'),
  context = canvas.getContext('2d');

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

function musicObj(a, f, d) {
  this.audio = a;
  this.formula = f;
  this.data = d;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

function updateCanvas(obj) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  var i;
  var counter = 0;
  var step = canvas.width / 65535;
  for (i = 0; i < obj.data.length; i += 30) {
    context.beginPath();
    // at 8 seconds fullscreen is used thus 16 seconds is x / 2
    context.arc((step * i) / 2, Math.floor((Math.random() * canvas.height) + 1), (obj.data[i] / canvas.height) / 2, 0, 2 * Math.PI, false);
    context.fillStyle = '#' + obj.data[i].toString(16);
    context.fill();
    counter++;
  }
}

function play() {
  var audio = new Audio();
  var wave = new RIFFWAVE();
  var data = [];
  var f = getFormula();
  var formula = getFormula().toString();

  var obj = new musicObj("", formula, "");

  // Only make new audio file if formula is different than those already in cache
  if (!audioCached(obj, musicObjects)) {

    var frequency = 8000;
    var seconds = 16;

    wave.header.sampleRate = frequency;
    wave.header.bitsPerSample = 16;

    for (var t = 0; t < frequency * seconds; t++) {
      var sample = (f(t)) & 0xff;
      sample *= 256;
      if (sample < 0) sample = 0;
      if (sample > 65535) sample = 65535;

      data[t] = sample;
    }

    // add random 'version' to stop chrome corrupting cache
    data[data.length] = Math.floor((Math.random() * 100) + 1);

    wave.Make(data);

    audio.src = wave.dataURI;
    obj.data = data;
    obj.audio = audio;

    musicObjects.push(obj);
    updateCanvas(obj);
    playMusic(obj);
  } else {
    console.log("audio already exists, playing from cache");

    var obj = audioCached(obj, musicObjects);
    updateCanvas(obj);
    playMusic(obj);
  }
}

function getFormula() {
  var formula = document.getElementById('formula').value;

  formula = formula.replace(/sin/g, "Math.sin");
  formula = formula.replace(/cos/g, "Math.cos");
  formula = formula.replace(/tan/g, "Math.tan");
  formula = formula.replace(/log/g, "Math.log");
  formula = formula.replace(/random/g, "Math.random");
  formula = formula.replace(/floor/g, "Math.floor");
  formula = formula.replace(/ceil/g, "Math.ceil");

  eval("var f = function (t) { return " + formula + "}");
  return f;
}

function audioCached(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].formula === obj.formula) {
      return list[i];
    }
  }
  return false;
}

function playMusic(musicObj) {
  // stop all playing music first
  stopMusic();
  musicObj.audio.play();
}

function stopMusic() {
  var i;
  for (i = 0; i < musicObjects.length; i++) {
    musicObjects[i].audio.pause();
    musicObjects[i].audio.currentTime = 0;
  }
}