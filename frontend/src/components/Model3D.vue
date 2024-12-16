<template>
  <div class="model-container" ref="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const container = ref(null);
const canvas = ref(null);
let scene, camera, renderer, controls;

// Initialize Three.js scene
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1d2d');

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 3, 5);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x4080ff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Create greenhouse model
  createGreenhouseModel();
};

// Create basic greenhouse structure
const createGreenhouseModel = () => {
  // Base
  const baseGeometry = new THREE.BoxGeometry(4, 0.1, 6);
  const baseMaterial = new THREE.MeshPhongMaterial({
    color: 0x252a3d,
    transparent: true,
    opacity: 0.8,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  scene.add(base);

  // Walls
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0x4080ff,
    transparent: true,
    opacity: 0.2,
  });

  // Front wall
  const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 0.1),
    wallMaterial
  );
  frontWall.position.set(0, 1, 3);
  scene.add(frontWall);

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 0.1),
    wallMaterial
  );
  backWall.position.set(0, 1, -3);
  scene.add(backWall);

  // Roof
  const roofGeometry = new THREE.CylinderGeometry(2, 2, 6, 32, 1, true, 0, Math.PI);
  const roofMaterial = new THREE.MeshPhongMaterial({
    color: 0x4080ff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 2;
  scene.add(roof);

  // Grid helper
  const gridHelper = new THREE.GridHelper(10, 10, 0x4080ff, 0x252a3d);
  scene.add(gridHelper);
};

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

// Handle window resize
const handleResize = () => {
  if (!container.value || !camera || !renderer) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// Lifecycle hooks
onMounted(() => {
  initScene();
  animate();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (controls) controls.dispose();
  if (renderer) renderer.dispose();
});
</script>

<style scoped>
.model-container {
  width: 100%;
  height: 300px;
  background-color: var(--secondary-bg);
  border: 1px solid rgba(64, 128, 255, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: var(--border-glow);
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
