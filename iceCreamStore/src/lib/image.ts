// RF-3.2: images are shrunk before they reach localStorage.
const MAX_SIDE = 512
const QUALITY = 0.8

export class ImageError extends Error {}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ImageError('No se pudo leer la imagen. Prueba con otro archivo.'))
    }
    img.src = url
  })
}

/** Resizes to 512px on the longest side and encodes as WebP (JPEG where WebP is unsupported). */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageError('El archivo no es una imagen. Elige un JPG, PNG o WebP.')
  }
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageError('No se pudo procesar la imagen en este navegador.')
  ctx.drawImage(img, 0, 0, width, height)
  let data = canvas.toDataURL('image/webp', QUALITY)
  if (!data.startsWith('data:image/webp')) {
    // JPEG has no transparency: paint a white background under the image.
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    data = canvas.toDataURL('image/jpeg', QUALITY)
  }
  if (!data.startsWith('data:image/')) throw new ImageError('No se pudo comprimir la imagen. Prueba con otro archivo.')
  return data
}
