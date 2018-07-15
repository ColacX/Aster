const canvas = document.querySelector("#canvas");
const engine = new BABYLON.Engine(canvas, true);
const Vec3 = BABYLON.Vector3;

let monkey = null;

document.addEventListener("keydown", function (e) {
  console.log('keydown', e.keyCode, e);

  // https://doc.babylonjs.com/api/classes/babylon.physicsimpostor#applyimpulse
  console.log(monkey);

  switch(e.keyCode){
    case 87: 
      monkey.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0, +1), monkey.getAbsolutePosition());
      break;
    case 83:
      monkey.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0, -1), monkey.getAbsolutePosition());
      break;
    case 65:
      monkey.physicsImpostor.applyImpulse(new BABYLON.Vector3(+1, 0, 0), monkey.getAbsolutePosition());
      break;
    case 68:
      monkey.physicsImpostor.applyImpulse(new BABYLON.Vector3(-1, 0, 0), monkey.getAbsolutePosition());
      break;
    default:
      break;
  }
}, false);

document.addEventListener("keyup", function (e) {
  console.log('keyup', e.keyCode, e);
}, false);

document.addEventListener('mousemove', function(e) {
  if (document.pointerLockElement !== canvas && document.mozPointerLockElement !== canvas) {
    return;
  };
  console.log('mousemove', e);
});

window.addEventListener("resize", function (e) {
  engine.resize();
});

// http://www.pixelcodr.com/tutos/shooter/shooter.html
canvas.addEventListener("click", function(evt) {
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
  if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
  }
}, false);

function pointerLockChange(event) {
  console.log(event);
};

document.addEventListener("pointerlockchange", pointerLockChange, false);
document.addEventListener("mspointerlockchange", pointerLockChange, false);
document.addEventListener("mozpointerlockchange", pointerLockChange, false);
document.addEventListener("webkitpointerlockchange", pointerLockChange, false);

engine.loadingScreen = {
  displayLoadingUI: function () {
    console.log('loading');
  },
  hideLoadingUI: function () {
    console.log('loaded');
  }
};

const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new Vec3(0, -9.82, 0), new BABYLON.CannonJSPlugin());

const camera = new BABYLON.FreeCamera("Camera", new Vec3(0, 0, 0), scene);

const light1 = new BABYLON.HemisphericLight("light1", new Vec3(10, 10, 0), scene);
const light2 = new BABYLON.PointLight("light2", new Vec3(0, 10, -10), scene);

var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameterX: 1 }, scene);
sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
sphere.position = new Vec3(0, 5, 0);

scene.actionManager = new BABYLON.ActionManager(scene);

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
  {
    trigger: BABYLON.ActionManager.OnKeyDownTrigger,
    parameter: 'r'
  },
  function () { console.log('r button was pressed'); }
));

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
  {
    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
    parameter: 'r'
  },
  function () { console.log('r button was released'); }
));

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
  {
    trigger: BABYLON.ActionManager.OnEveryFrameTrigger,
  },
  function () { console.log('frame'); }
));

function loadAssets() {
  return new Promise((resolve, reject) => {
    var assetsManager = new BABYLON.AssetsManager(scene);
    var meshTask = assetsManager.addMeshTask("monkey task", "", "", "monkey.babylon");

    meshTask.onSuccess = function (task) {
      task.loadedMeshes[0].position = new Vec3(0, 10, 0.1);
      task.loadedMeshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(task.loadedMeshes[0], BABYLON.PhysicsImpostor.SphereImpostor, {
        mass: 1,
        restitution: 0
      }, scene);
      task.loadedMeshes[0].actionManager = new BABYLON.ActionManager(scene);
      monkey = task.loadedMeshes[0];
      camera.parent = monkey;
      resolve();
    }

    assetsManager.load();
  });
}

async function startGame() {
  engine.runRenderLoop(function () {
    scene.render();
  });

  await loadAssets();

  startNetwork();
}


let socket = null;

// https://www.html5rocks.com/en/tutorials/websockets/basics/
function startNetwork() {
  socket = new WebSocket(`ws://${location.hostname}:9102`);

  socket.onopen = function () {
    console.log('socket connected');
  };

  socket.onerror = function (error) {
    console.error('socket error', error);
  };

  socket.onmessage = function (e) {
    const m = JSON.parse(e.data);
    switch (m.to) {
      case 'chat':
        console.log('chat', m.message);
        break;
      default:
        console.error('incorrect destination', m);
        break;
    }
  };
}

function sendJson(s, o) {
  s.send(JSON.stringify(o));
}

function help() {
  console.log('help() //displays help');
  console.log('chat(message) //sends a chat message to all connected');
}

function chat(message) {
  sendJson(socket, {
    to: 'chat',
    message: message,
  });
}

startGame();