import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

export const MNVisualizer = (() => {
  let scene, camera, renderer, mannequin;
  let meshes = { top: null, bottom: null, shoes: null };

  const SKINS = {
    'fair': 0xFDEBD3, 'wheatish': 0xE8C99B, 'medium': 0xC6956A,
    'dusky': 0x8D6346, 'deep': 0x5C3A21
  };

  const init = (containerId, profileData) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.0, 3.5); // Adjusted to see full body

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(2, 5, 2);
    scene.add(dirLight);

    // 3. Create Base Mannequin (Abstract Shapes for Demo)
    createMannequin(profileData);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.target.set(0, 0.9, 0); // Focus on torso
    controls.update();

    animate();
  };

  const createMannequin = (data) => {
    const skinColor = SKINS[data.skinTone] || 0xE8C99B;
    const mat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });

    // Body Parts (Simplified for "Economical Bulk" approach)
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), mat);
    head.position.y = 1.75;
    scene.add(head);

    // Placeholder for clothes (We will update these materials)
    // Top (Torso + Arms)
    meshes.top = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.6, 32), mat.clone());
    meshes.top.position.y = 1.35;
    scene.add(meshes.top);

    // Bottom (Legs)
    meshes.bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.15, 0.9, 32), mat.clone());
    meshes.bottom.position.y = 0.6;
    scene.add(meshes.bottom);

    // Shoes
    meshes.shoes = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.2), mat.clone());
    meshes.shoes.position.y = 0.05;
    scene.add(meshes.shoes);

    // Apply Morph (Height/Build)
    updateBodyShape(data.height, data.build);
  };

  const updateBodyShape = (heightCm, buildType) => {
    // Simple scaling logic
    const scaleY = heightCm / 175;
    const scaleX = buildType === 'broad' || buildType === 'heavy' ? 1.2 : 1.0;

    if (meshes.top) {
      meshes.top.scale.set(scaleX, scaleY, scaleX);
      meshes.bottom.scale.set(scaleX, scaleY, scaleX);
    }
  };

  const updateOutfit = (type, colorHex) => {
    // Update specific part color
    if (meshes[type]) {
      meshes[type].material.color.set(colorHex);
      meshes[type].material.needsUpdate = true;
    }
  };

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return { init, updateOutfit };
})();

// Bridge: expose to window so MN-fashion-consultant.js can find it
window.MNVisualizer = MNVisualizer;
