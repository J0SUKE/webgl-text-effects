import * as THREE from "three"
import { Size } from "../types/types"

import vertexShader from "../shaders/vertex.glsl"
import fragmentShader from "../shaders/fragment.glsl"
import WebglText from "./webgl-text"
import GUI from "lil-gui"

interface Props {
  scene: THREE.Scene
  sizes: Size
  gui: GUI
}

export default class TextAnimation {
  scene: THREE.Scene
  sizes: Size
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  mesh: THREE.Mesh
  gui: GUI

  constructor({ scene, sizes, gui }: Props) {
    this.scene = scene
    this.sizes = sizes
    this.gui = gui

    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    this.scaleMesh()
    this.createTexture()

    this.gui
      .add(this.material.uniforms.uProgress, "value")
      .min(0)
      .max(1)
      .step(0.001)
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: new THREE.Texture() },
        uGridSize: { value: 12 },
        uProgress: { value: 0.5 },
        uScreenAspectRatio: { value: window.innerWidth / window.innerHeight },
      },
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  scaleMesh() {
    this.mesh.scale.set(this.sizes.width, this.sizes.height, 1)
  }

  createTexture() {
    const text = new WebglText({ text: "12" })

    this.material.uniforms.uTexture.value = text.getTexture()
  }

  onResize(sizes: Size) {
    this.sizes = sizes
    this.scaleMesh()
  }
}
