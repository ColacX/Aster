const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas, true);
const Vec3 = BABYLON.Vector3;

window.addEventListener("resize", function () {
  engine.resize();
});

const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new Vec3(0, -9.82, 0), new BABYLON.CannonJSPlugin());

const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 2, new Vec3(0, 10, 10), scene);
camera.attachControl(canvas, true);

const light1 = new BABYLON.HemisphericLight("light1", new Vec3(10, 10, 0), scene);
const light2 = new BABYLON.PointLight("light2", new Vec3(0, 10, -10), scene);

var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameterX: 1 }, scene);
sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
sphere.position = new Vec3(0, 5, 0);

function loadAssets() {
  return new Promise((resolve, reject) => {
    var assetsManager = new BABYLON.AssetsManager(scene);
    var meshTask = assetsManager.addMeshTask("monkey task", "", "", "monkey.babylon");

    meshTask.onSuccess = function (task) {
      task.loadedMeshes[0].position = new Vec3(0, 10, 0.1);
      task.loadedMeshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(task.loadedMeshes[0], BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
      resolve();
    }

    assetsManager.load();
  });
}

function startGame() {
  engine.runRenderLoop(function () {
    scene.render();
  });
}

// https://www.html5rocks.com/en/tutorials/websockets/basics/
function startNetwork() {
  var connection = new WebSocket(`ws://${location.host}:9102`);

  connection.onopen = function () {
    connection.send('Ping');
  };

  connection.onerror = function (error) {
    console.error(error);
  };

  connection.onmessage = function (e) {
    console.log('server message: ', e);
  };
}

(async () => {
  await loadAssets();
  startGame();
  startNetwork();
})();
