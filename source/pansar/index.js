const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

function createScene() {

  // Create the scene space
  var scene = new BABYLON.Scene(engine);

  // Add a camera to the scene and attach it to the canvas
  var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Add lights to the scene
  var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(10, 10, 0), scene);
  var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 10, -10), scene);


  // Add and manipulate meshes in the scene
  // var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);


  var assetsManager = new BABYLON.AssetsManager(scene);
  var meshTask = assetsManager.addMeshTask("monkey task", "", "", "monkey.babylon");
  meshTask.onSuccess = function (task) {
    task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
  }

  assetsManager.load();

  return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});


window.addEventListener("resize", function () {
  engine.resize();
});