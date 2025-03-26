import * as THREE from "three"
import { Size } from "../types/types"
import vertexShader from "../shaders/vertex.glsl"
import fragmentShader from "../shaders/fragment.glsl"
import gsap from "gsap"

interface Props {
  scene: THREE.Scene
  sizes: Size
}

export default class Gallery {
  scene: THREE.Scene
  sizes: Size
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  meshCount: number
  instancedMesh: THREE.InstancedMesh
  meshSide: number
  meshGap: number
  scrollY: {
    target: number
    current: number
    direction: number
  }

  constructor({ scene, sizes }: Props) {
    this.scene = scene
    this.sizes = sizes
    this.meshCount = 100
    this.meshSide = 1
    this.meshGap = 0.5

    this.scrollY = {
      target: 0,
      current: 0,
      direction: -1,
    }

    this.createGeometry()
    this.createMaterial()
    this.createMeshes()
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(
      this.meshSide,
      this.meshSide,
      32,
      32
    )
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uScrollY: { value: 0 },
        uMaxY: { value: this.meshCount * this.meshGap * 0.5 },
      },
    })
  }

  updateScroll(scrollY: number) {
    this.scrollY.target += scrollY
  }

  createMeshes() {
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.meshCount
    )

    const positions = new Float32Array(this.meshCount * 3)

    for (let i = 0; i < this.meshCount; i++) {
      positions[i * 3] = (this.meshCount * 0.5 - i) * this.meshGap
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }

    this.instancedMesh.geometry.setAttribute(
      "aPosition",
      new THREE.InstancedBufferAttribute(positions, 3)
    )

    this.scene.add(this.instancedMesh)
  }

  render() {
    this.scrollY.current = gsap.utils.interpolate(
      this.scrollY.current,
      this.scrollY.target,
      0.1
    )

    this.material.uniforms.uScrollY.value = this.scrollY.current
  }
}
