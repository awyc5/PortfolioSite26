import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";

const canvas = document.querySelector("#experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const modals = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact")
};

document.querySelectorAll(".modal-exit-button").forEach((button) => {
    button.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal");
        hideModal(modal);
    });
});

const showModal = (modal) => {
    modal.style.display = "block"
    isModalOpen = true;
    controls.enabled = false;

    if (currentHoveredObject) {
        playHoverAnimation(currentHoveredObject, false);
        currentHoveredObject = null;
    }
    document.body.style.cursor = "default";
    currentIntersects = [];

    gsap.set(modal, { opacity: 0 });

    gsap.to(modal, {
        opacity: 1,
        duration: 0.5,
    });
};

const hideModal = (modal) => {
    isModalOpen = false;
    controls.enabled = true;

    gsap.to(modal, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            modal.style.display = "none"
        },
    });
};


const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;
let isModalOpen = false;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const textureMap = textureLoader.load('/textures/leafbake.png');
textureMap.flipY = false;
textureMap.colorSpace = THREE.SRGBColorSpace;

const textureMap2 = textureLoader.load('/textures/leafbake2.png');
textureMap2.flipY = false;
textureMap2.colorSpace = THREE.SRGBColorSpace;

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);


const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
    75, sizes.width / sizes.height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true  // ⬅️ makes background transparent
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


camera.position.set(2.7373972479986968, 8.037431214752214, 6.967755127615371);

//const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
//scene.add(ambientLight);

// Soft warm ambient — main light source
const ambientLight = new THREE.AmbientLight(0xfff0f5, 3); // ⬅️ slightly warm pink-white
scene.add(ambientLight);

// Very subtle directional — just for mild depth
const dirLight = new THREE.DirectionalLight(0xffeef5, 0.4); // ⬅️ warm, low intensity
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Optional: add a soft fill light from the opposite side
const fillLight = new THREE.DirectionalLight(0xd4eeff, 0.3); // ⬅️ cool blue fill
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2.5;
controls.minAzimuthAngle = -Math.PI / 8;
controls.maxAzimuthAngle = Math.PI / 2;

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.update();
controls.target.set(-8.967755127615371, 2.4408184305693674, -6.3646829508033895);

//Event listeners
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() { }

function playHoverAnimation(object, isHovering) {
    gsap.killTweensOf(object.scale);

    if (isHovering) {
        gsap.to(object.scale, {
            x: object.userData.initialScale.x * 1.2,
            y: object.userData.initialScale.y * 1.2,
            z: object.userData.initialScale.z * 1.2,
            duration: 0.5,
            ease: "bounce.out(3)"
        });
    } else {
        gsap.to(object.scale, {
            x: object.userData.initialScale.x,
            y: object.userData.initialScale.y,
            z: object.userData.initialScale.z,
            duration: 0.5,
            ease: "power2.out",
        });
    }
}


const render = () => {
    controls.update();

    //console.log(camera.position);
    //console.log("000000000");
    //console.log(controls.target);

    //Raycaster
    if (!isModalOpen) {

        raycaster.setFromCamera(pointer, camera);

        currentIntersects = raycaster.intersectObjects(raycasterObjects);

        for (let i = 0; i < currentIntersects.length; i++) { }
        if (currentIntersects.length > 0) {
            const currentIntersectObject = currentIntersects[0].object;

            if (currentIntersectObject.name.includes("Hover")) {
                // ⬅️ only animate if it's a NEW object being hovered
                if (currentIntersectObject !== currentHoveredObject) {
                    if (currentHoveredObject) {
                        playHoverAnimation(currentHoveredObject, false);
                    }
                    playHoverAnimation(currentIntersectObject, true);
                    currentHoveredObject = currentIntersectObject;
                }
                // ⬅️ no animation call if same object — prevents repeated triggering
            }

            if (currentIntersectObject.name.includes("Pointer")) {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "default";
            }
        } else {
            if (currentHoveredObject) {
                playHoverAnimation(currentHoveredObject, false);
                currentHoveredObject = null;
            }
            document.body.style.cursor = "default";
        }
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
}

window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

window.addEventListener("click", (e) => {
    // Fresh raycast on click
    raycaster.setFromCamera(pointer, camera);
    const clickIntersects = raycaster.intersectObjects(raycasterObjects);

    console.log('intersects on click:', clickIntersects.map(i => i.object.name));

    if (clickIntersects.length > 0) {
        const name = clickIntersects[0].object.name;

        if (name.includes("Projects")) {
            showModal(modals.work);
        } else if (name.includes("About")) {
            showModal(modals.about);
        } else if (name.includes("Contact")) {
            showModal(modals.contact);
        }
    }
});


loader.load('/models/newportfolio_v13-v1.glb', (glb) => {
    glb.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.name.includes("Raycaster")) {
                raycasterObjects.push(child);
            }

            if (child.name.includes("Hover")) {
                child.userData.initialScale = new THREE.Vector3().copy(child.scale);
            }

            if (child.material.name.includes('treeleaves.001')) {
                child.material = new THREE.MeshBasicMaterial({
                    map: textureMap
                });
            } else if (child.material.name.includes('treeleaves')) {
                child.material = new THREE.MeshBasicMaterial({
                    map: textureMap2
                });
            }
        }
    })
    scene.add(glb.scene)
});
render();
