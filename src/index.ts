import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { AmmoPhysics, PhysicsLoader, ExtendedMesh } from '@enable3d/ammo-physics'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const ThreeScene = () => {
  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(10, 10, 20)

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  const div = document.getElementById('three-scene')
  if (div) div.appendChild(renderer.domElement)
  else console.error('div not found!')

  // dpr
  const DPR = window.devicePixelRatio
  // renderer.setPixelRatio(Math.max(1, DPR / 2))

  // handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // orbit controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 5, 0)
  camera.lookAt(0, 5, 0)

  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)

  // physics
  const physics = new AmmoPhysics(scene)
  physics.debug?.enable()

  // add ground
  const addGround = () => {
    const geometry = new THREE.BoxBufferGeometry(30, 0.5, 30)
    const material = new THREE.MeshLambertMaterial({ color: '#444444' })
    const ground = new ExtendedMesh(geometry, material)
    scene.add(ground)
    // @ts-ignore
    physics.add.existing(ground, { collisionFlags: 1, mass: 0 })
  }
  // addGround()
  /**
 * Models
 */

const gltfLoader = new GLTFLoader()
let mixer;
gltfLoader.load(
  '/assets/Fox/glTF/Fox.gltf',
  (gltf) =>
  {
      const fox = gltf.scene
      scene.add(fox)
      fox.position.set(0, .23, 0)
      fox.scale.set(.08, .08, .08)
      mixer = new THREE.AnimationMixer(gltf.scene)
      const action = mixer.clipAction(gltf.animations[1])
      action.play()
  }
)

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
  '/assets/background/nx.png',
  '/assets/background/px.png',
  '/assets/background/py.png',
  '/assets/background/ny.png',
  '/assets/background/nz.png',
  '/assets/background/pz.png'
])
scene.background = environmentMap

  // clock
  const clock = new THREE.Clock()

  // loop
  let previousTime = 0
  const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()
    renderer.render(scene, camera)

    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

window.addEventListener('DOMContentLoaded', () => {
  PhysicsLoader('/assets/ammo', () => ThreeScene())
})
