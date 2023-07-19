import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "lil-gui";
import { gsap } from "gsap";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object3.position.x = 2;

scene.add(object1, object2, object3);

object1.updateMatrixWorld();
object2.updateMatrixWorld();
object3.updateMatrixWorld();

// Raycaster
const raycaster = new THREE.Raycaster();
// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);
// rayDirection.normalize();

// raycaster.set(rayOrigin, rayDirection);

// const intersect = raycaster.intersectObject(object1);

// console.log("intersetct", intersect);

// const intersects = raycaster.intersectObjects([object1, object2, object3]);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Mouse cursor
const cursor = new THREE.Vector2();

window.addEventListener("mousemove", (evt) => {
  cursor.x = (evt.clientX / sizes.width) * 2 - 1;
  cursor.y = -(evt.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("click", (evt) => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log("Click on object 1");
        break;
      case object2:
        console.log("Click on object 2");
        break;
      case object3:
        console.log("Click on object 3");
        break;
    }
  }
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Load model
const ambientLight = new THREE.AmbientLight("#ffffff", 0.3);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight("#ffffff", 0.1);
directionalLight.position.set(0, 2, 0);
scene.add(directionalLight);

const modelLoader = new GLTFLoader();

let model = null;

modelLoader.load("/models/Duck/glTF-Binary/Duck.glb", (gltf) => {
  model = gltf.scene;
  scene.add(model);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

let currentIntersect = null;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  object1.position.y = Math.sin(elapsedTime * 0.5) * 2;
  object2.position.y = Math.sin(elapsedTime * 0.2) * 2;
  object3.position.y = Math.sin(elapsedTime * 0.8) * 2;

  // const rayOrigin = new THREE.Vector3(-3, 0, 0);
  // const rayDirection = new THREE.Vector3(10, 0, 0);
  // rayDirection.normalize();
  // raycaster.set(rayOrigin, rayDirection);

  // const objectToTest = [object1, object2, object3];
  // const intersects = raycaster.intersectObjects(objectToTest);
  // objectToTest.forEach((object) => {
  //   object.material.color.set("#ff0000");
  // });
  // intersects.forEach((intersect) => {
  //   intersect.object.material.color.set("#0000ff");
  // });

  raycaster.setFromCamera(cursor, camera);

  const objectToTest = [object1, object2, object3];

  const intersects = raycaster.intersectObjects(objectToTest);

  objectToTest.forEach((object) => {
    object.material.color.set("#ff0000");
    object.rotation.y = elapsedTime;
  });
  intersects.forEach((intersect) => {
    intersect.object.material.color.set("#0000ff");
  });

  if (intersects.length) {
    if (!currentIntersect) {
      console.log("mouseenter");
    }
    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log("mouseleave");
    }
    currentIntersect = null;
  }

  if (model) {
    model.scale.set(1, 1, 1);
    const intersect = raycaster.intersectObject(model);
    if (intersect.length) {
      intersect[0].object.rotation.y = elapsedTime;
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
