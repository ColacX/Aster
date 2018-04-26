const debug = console.log.bind(console);
const error = console.error.bind(console);
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
let lastTime;

function requestFile(url) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status !== 200) {
          reject(request);
        }

        resolve(request.response);
      }
    };

    request.send(null);
  });
}

async function startProgram() {
  if (!gl) {
    throw "failed to get gl context. your browser may does support webgl";
  }

  loadShaderProgram(await requestFile("hello.vert.glsl"), await requestFile("hello.frag.glsl"));
  window.requestAnimationFrame(firstFrame);
}

function loadVertexShader(sourceCode) {
  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  return shader;
}

function loadFragmentShader(sourceCode) {
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  return shader;
}

function loadShaderProgram(vertexSource, fragmentSource) {
  const vertexShader = loadVertexShader(vertexSource);
  const fragmentShader = loadFragmentShader(fragmentSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    debug(gl.getProgramInfoLog(shaderProgram));
  }

  return shaderProgram;
}

function firstFrame(nowTime) {
  lastTime = nowTime;
  window.requestAnimationFrame(renderFrame);
}

function renderFrame(nowTime) {
  const elapsedTime = nowTime - lastTime;
  // debug(elapsedTime);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.5, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  simulateWorld(elapsedTime);
  renderScene();

  lastTime = nowTime;
  window.requestAnimationFrame(renderFrame);
}

function renderScene() {
}

function simulateWorld(elapsedTime) {
}

startProgram();
