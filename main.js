import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import { createNoise2D } from 'simplex-noise'
import Tree from './src/Tree'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import srcModels from './src/assets/xmas-models/ChristmasAssets.obj?url'
import srcMap from './src/assets/xmas-models/Texture/Texture_Christmas.png?url'

const noise = createNoise2D()

const loader = new OBJLoader()
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(srcMap)
let regalo1, regalo2, slitta, albero, renna, olaf, santa

loader.load(srcModels, (obj) => {
	// console.log(obj)
	obj.traverse((element) => {
		if (element instanceof THREE.Mesh) {
			element.scale.setScalar(0.1)
			element.geometry.center()
			element.geometry.rotateY(Math.PI)
			element.position.set(0, 0, 0)
			element.material.map = texture
		}
	})

	regalo1 = obj.children[0]
	regalo2 = obj.children[1]
	slitta = obj.children[2]
	albero = obj.children[3]
	renna = obj.children[4]
	olaf = obj.children[5]
	santa = obj.children[6]
	scene.add(santa)

	santa.position.set(8, 0, -5)

	santa.position.y = getY(santa.position.x, santa.position.z) + 1.5
})

/**
 * Debug
 */
// const gui = new dat.GUI()

/**
 * Scene
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x222266)
scene.fog = new THREE.Fog(0x222266, 60, 90)

/**
 * BOX
 */
const material = new THREE.MeshNormalMaterial()
const geometry = new THREE.BoxGeometry(1, 1, 1)

const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}
/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(4, 4, 4)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
handleResize()

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const resolution = 40
const size = 6

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(40 * 6 * 2, 40 * 6 * 2, 400, 400),
	new THREE.MeshStandardMaterial({ color: 'white' })
)

ground.geometry.rotateX(Math.PI * -0.5)
scene.add(ground)

const positionAttribute = ground.geometry.getAttribute('position')
console.log(positionAttribute)

for (let i = 0; i < positionAttribute.count; i++) {
	const x = positionAttribute.getX(i)
	const z = positionAttribute.getZ(i)

	const y = getY(x, z)

	positionAttribute.setY(i, y)
}

positionAttribute.needsUpdate = true
ground.geometry.computeVertexNormals()

function getY(x, z) {
	const scalar = noise(x * 0.03, z * 0.03)

	return scalar * (scalar > 0 ? 3 : 1)
}

for (let i = 0; i < resolution; i++) {
	for (let j = 0; j < resolution; j++) {
		const x = i * size - resolution * 0.5 * size
		const z = j * size - resolution * 0.5 * size
		const y = getY(x, z)

		const position = new THREE.Vector3(x, y, z)
		const scalar = noise(x * 0.03, z * 0.03)

		if (
			scalar < -0.5 ||
			position.length() < resolution * size * 0.1 ||
			position.length() > resolution * size * 0.3
		) {
			continue
		}

		const tree = new Tree()
		tree.mesh.position.copy(position)
		tree.mesh.scale.setScalar(0.8 + Math.max(0.3, scalar))
		tree.mesh.rotation.y = Math.PI * scalar
		scene.add(tree.mesh)
	}
}

const ambLight = new THREE.AmbientLight(0x222266, 0.9)
const dirLight = new THREE.DirectionalLight(0x222266, 3.5)
const pointLight = new THREE.PointLight('#ff3300', 6, 35, 0.5)
const pointLightInner = new THREE.PointLight('#33ff00', 4, 25, 0.8)

dirLight.position.set(10, 5, 10)
pointLight.position.y = getY(0, 0) + 3
pointLightInner.position.y = getY(0, 0) + 3
scene.add(ambLight, dirLight, pointLight, pointLightInner)

/**
 * Three js Clock
 */
const clock = new THREE.Clock()

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	// const deltaTime = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	const time = clock.getElapsedTime()
	pointLightInner.intensity = 4 + noise(time * 3, time * 3)
	pointLight.intensity = 6 + noise(time, time)

	controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
