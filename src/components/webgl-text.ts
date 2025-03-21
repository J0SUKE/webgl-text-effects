import * as THREE from "three"

interface Props {
  text: string
}

// this class creates an image texture with the text passed in the props

export default class WebglText {
  text: string

  texture: THREE.Texture

  //canvas
  canvasContext: CanvasRenderingContext2D | undefined

  constructor({ text }: Props) {
    this.text = text

    this.createTexture()
  }

  createTexture() {
    const canvas = document.createElement("canvas")
    this.canvasContext = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | undefined

    if (!this.canvasContext) {
      return
    }

    const font = "Arial"

    const scale = Math.ceil(Math.min(2, window.devicePixelRatio))

    const vw = (s: number) => {
      return (window.innerWidth * s) / 100
    }

    const fontSize = vw(30) * scale

    const width = window.innerWidth * scale
    const height = window.innerHeight * scale
    const halfWidth = width / 2
    const halfHeight = height / 2

    canvas.width = width
    canvas.height = height

    this.canvasContext.fillStyle = "white"
    this.canvasContext.fillRect(0, 0, width, height)

    this.canvasContext.font = `${fontSize}px ${font}`
    this.canvasContext.textAlign = "center"
    this.canvasContext.textBaseline = "middle"
    this.canvasContext.fillStyle = "black"
    this.canvasContext.fillText(this.text, halfWidth, halfHeight)

    this.texture = new THREE.Texture(canvas)

    //make texture as sharp as possible
    this.texture.magFilter = THREE.NearestFilter
    this.texture.minFilter = THREE.LinearMipMapLinearFilter

    this.texture.needsUpdate = true
  }

  getTexture() {
    return this.texture
  }
}
