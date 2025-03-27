import * as THREE from "three"
import { Size } from "../types/types"
import vertexShader from "../shaders/vertex.glsl"
import fragmentShader from "../shaders/fragment.glsl"
import gsap from "gsap"
import GUI from "lil-gui"

interface Props {
  scene: THREE.Scene
  sizes: Size
  debug: GUI
}

interface ImageInfo {
  width: number
  height: number
  aspectRatio: number
  uvs: {
    xStart: number
    xEnd: number
    yStart: number
    yEnd: number
  }
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
  debug: GUI
  scrollY: {
    target: number
    current: number
    direction: number
  }

  imageInfos: ImageInfo[] = []
  atlasTexture: THREE.Texture | null = null

  constructor({ scene, sizes, debug }: Props) {
    this.scene = scene
    this.sizes = sizes
    this.meshCount = 50
    this.meshSide = 1
    this.meshGap = 0.5

    this.debug = debug

    this.debug.hide()

    this.scrollY = {
      target: 0,
      current: 0,
      direction: -1,
    }

    this.createGeometry()

    this.loadTextureAtlas().then(() => {
      this.createMaterial()
      this.createMeshes()

      this.debug
        .add(this.material.uniforms.uIntroProgress, "value")
        .name("progress")
        .min(0)
        .max(1)
        .step(0.001)

      window.addEventListener("click", () => {
        this.animateIntro()
      })
    })
  }

  async loadTextureAtlas() {
    // Define your image paths
    const imagePaths = [
      "/512/p1.jpg",
      "/512/p2.jpg",
      "/512/p3.jpg",
      "/512/p4.jpg",
      "/512/p5.jpg",
      "/512/p6.jpg",
      "/512/p7.jpg",
      "/512/p8.jpg",
      "/512/p9.jpg",
      "/512/p10.jpg",
      "/512/p11.jpg",
      "/512/p12.jpg",
      "/512/p13.jpg",
    ]

    // Load all images first to get their dimensions
    const imagePromises = imagePaths.map((path) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = path
      })
    })

    const images = await Promise.all(imagePromises)

    // Calculate atlas dimensions (for simplicity, we'll stack images vertically)
    const atlasWidth = Math.max(...images.map((img) => img.width))
    let totalHeight = 0

    // First pass: calculate total height
    images.forEach((img) => {
      totalHeight += img.height
    })

    // Create canvas with calculated dimensions
    const canvas = document.createElement("canvas")
    canvas.width = atlasWidth
    canvas.height = totalHeight
    const ctx = canvas.getContext("2d")!

    // Second pass: draw images and calculate normalized coordinates
    let currentY = 0
    this.imageInfos = images.map((img) => {
      const aspectRatio = img.width / img.height

      // Draw the image
      ctx.drawImage(img, 0, currentY)

      // Calculate normalized coordinates

      const info = {
        width: img.width,
        height: img.height,
        aspectRatio,
        uvs: {
          xStart: 0,
          xEnd: img.width / atlasWidth,
          yStart: 1 - currentY / totalHeight,
          yEnd: 1 - (currentY + img.height) / totalHeight,
        },
      }

      currentY += img.height
      return info
    })

    // Create texture from canvas
    this.atlasTexture = new THREE.Texture(canvas)
    this.atlasTexture.needsUpdate = true
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(
      this.meshSide,
      this.meshSide * 1.3,
      32,
      32
    )
  }

  animateIntro() {
    gsap.to(this.material.uniforms.uIntroProgress, {
      value: 1, // animate to 1
      duration: 2.5,
      //ease: "power2.out",
    })
  }

  resetAnimationState() {
    this.material.uniforms.uIntroProgress.value = 0
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uScrollY: { value: 0 },
        // Calculate total length of the gallery
        uMaxY: { value: this.meshCount * this.meshGap },
        uSpeedY: { value: 0 },
        uAtlas: new THREE.Uniform(this.atlasTexture),
        uIntroProgress: new THREE.Uniform(0),
      },
    })
  }

  updateScroll(scrollY: number) {
    this.scrollY.target += scrollY

    this.material.uniforms.uSpeedY.value += scrollY
  }

  createMeshes() {
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.meshCount
    )

    const positions = new Float32Array(this.meshCount * 3)
    const aTextureCoords = new Float32Array(this.meshCount * 4)
    const aIndex = new Float32Array(this.meshCount)

    for (let i = 0; i < this.meshCount; i++) {
      const imageIndex = i % this.imageInfos.length

      aTextureCoords[i * 4 + 0] = this.imageInfos[imageIndex].uvs.xStart
      aTextureCoords[i * 4 + 1] = this.imageInfos[imageIndex].uvs.xEnd
      aTextureCoords[i * 4 + 2] = this.imageInfos[imageIndex].uvs.yStart
      aTextureCoords[i * 4 + 3] = this.imageInfos[imageIndex].uvs.yEnd

      positions[i * 3] = i * this.meshGap
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      aIndex[i] = i
    }

    this.instancedMesh.geometry.setAttribute(
      "aPosition",
      new THREE.InstancedBufferAttribute(positions, 3)
    )

    this.instancedMesh.geometry.setAttribute(
      "aTextureCoords",
      new THREE.InstancedBufferAttribute(aTextureCoords, 4)
    )

    this.instancedMesh.geometry.setAttribute(
      "aIndex",
      new THREE.InstancedBufferAttribute(aIndex, 1)
    )

    this.scene.add(this.instancedMesh)
  }

  render() {
    if (this.material) {
      this.scrollY.current = gsap.utils.interpolate(
        this.scrollY.current,
        this.scrollY.target,
        0.12
      )

      this.material.uniforms.uScrollY.value = this.scrollY.current

      this.material.uniforms.uSpeedY.value *= 0.835
    }
  }
}
