import * as THREE from "three"
import { Dimensions, Size } from "./types/types"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import GUI from "lil-gui"
import Gallery from "./components/gallery"
import normalizeWheel from "normalize-wheel"

export default class Canvas {
  element: HTMLCanvasElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  sizes: Size
  dimensions: Dimensions
  time: number
  clock: THREE.Clock
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2
  orbitControls: OrbitControls
  debug: GUI
  gallery: Gallery

  constructor() {
    this.element = document.getElementById("webgl") as HTMLCanvasElement
    this.time = 0
    this.createClock()
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.setSizes()
    //this.createOrbitControls()
    this.addEventListeners()
    this.createDebug()
    //this.createDebugMesh()
    //this.createAxesHalper()
    this.createGallery()
    this.render()

    //this.debug.hide()
  }

  createScene() {
    this.scene = new THREE.Scene()
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.scene.add(this.camera)
    this.camera.position.z = 5
    this.camera.position.y = 1
    this.camera.position.x = 2.7
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }

  createOrbitControls() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )

    this.orbitControls.enableZoom = false
  }

  createRenderer() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.element,
      alpha: true,
      antialias: true,
    })
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
  }

  createDebug() {
    this.debug = new GUI()
  }

  setSizes() {
    let fov = this.camera.fov * (Math.PI / 180)
    let height = this.camera.position.z * Math.tan(fov / 2) * 2
    let width = height * this.camera.aspect

    this.sizes = {
      width: width,
      height: height,
    }
  }

  createClock() {
    this.clock = new THREE.Clock()
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this))
    window.addEventListener("wheel", this.onWheel.bind(this))
  }

  onResize() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.setSizes()

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
  }

  createGallery() {
    this.gallery = new Gallery({
      scene: this.scene,
      sizes: this.sizes,
      debug: this.debug,
    })
  }

  createAxesHalper() {
    const axesHelper = new THREE.AxesHelper(1.5)
    this.scene.add(axesHelper)
  }

  onWheel(event: MouseEvent) {
    const normalizedWheel = normalizeWheel(event)

    this.gallery.updateScroll(
      (normalizedWheel.pixelY * this.sizes.height) / window.innerHeight
    )
  }

  render() {
    this.time = this.clock.getElapsedTime()

    this.orbitControls?.update()
    this.gallery.render()

    this.renderer.render(this.scene, this.camera)
  }
}
