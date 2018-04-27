const debug = console.log.bind(console);
const error = console.error.bind(console);
const canvas = document.querySelector("canvas");

// https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html
const gl = canvas.getContext("webgl2");

const shaders = {};
const models = {};
const entities = {};

let lastTime;
let rotation = 0;

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

async function startGame() {
  if (!gl) {
    throw "failed to get gl context. your browser may does support webgl";
  }

  shaders.hello = await loadShader_Hello();
  models.cube = loadModelCube(await requestFile("cube.dae"));
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
    debug('program', gl.getProgramInfoLog(shaderProgram));
    debug('vertex', gl.getShaderInfoLog(vertexShader));
    debug('fragment', gl.getShaderInfoLog(fragmentShader));
  }

  return shaderProgram;
}

function getAttribute(program, key) {
  const v = gl.getAttribLocation(program, key);
  if (v === -1) error(key, v);
  return v;
}

function getUniform(program, key) {
  const v = gl.getUniformLocation(program, key);
  if (v === -1) error(key, v);
  return v;
}

async function loadShader_Hello() {
  const program = loadShaderProgram(await requestFile("hello.vert.glsl"), await requestFile("hello.frag.glsl"));

  const shader = {
    program,
    position: getAttribute(program, "position"),
    mvp: getUniform(program, "mvp"),
  };
  return shader;
}

function loadModelCube(sourceCode) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(sourceCode, "text/xml");
  const verticesData = xml.querySelector("#Cube-mesh-positions-array").innerHTML.split(" ").map(i => Number.parseInt(i));
  const indicesData = xml.querySelector("geometry mesh triangles p").innerHTML.split(" ").map(i => Number.parseFloat(i));

  var bufferPosition = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesData), gl.STATIC_DRAW);

  var bufferIndices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesData), gl.STATIC_DRAW);

  const model = {
    bufferPosition,
    bufferIndices
  };
  return model;
}

function firstFrame(nowTime) {
  lastTime = nowTime;
  window.requestAnimationFrame(renderFrame);
}

function resizeCanvas() {
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width != displayWidth || canvas.height != displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function renderFrame(nowTime) {
  const elapsedTime = nowTime - lastTime;
  // debug(elapsedTime);

  resizeCanvas();
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.529, 0.808, 0.922, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  stepGame(elapsedTime);
  renderScene();

  lastTime = nowTime;
  window.requestAnimationFrame(renderFrame);
}

function renderScene() {
  gl.useProgram(shaders.hello.program);
  // gl.drawArrays(gl.POINTS, 0, 1);

  // http://glmatrix.net/docs/module-mat4.html
  const mvp = mat4.create();
  mat4.perspective(mvp, Math.PI / 2, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.0001, 1000.0);
  mat4.translate(mvp, mvp, vec3.fromValues(0, 0, -3));
  let r = mat4.fromYRotation(mat4.create(), rotation += 0.001);
  mat4.multiply(mvp, mvp, r);

  gl.uniformMatrix4fv(shaders.hello.mvp, false, mvp);

  gl.enableVertexAttribArray(shaders.hello.position);
  gl.vertexAttribPointer(shaders.hello.position, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, models.cube.bufferPosition);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.cube.bufferIndices);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function stepGame(elapsedTime) {
}

startGame();
