interface ReadFileOptions {
  maxDimension?: number
  quality?: number
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Не удалось обработать изображение.'))
    image.src = source
  })
}

async function optimizeImageDataUrl(
  source: string,
  file: File,
  { maxDimension = 1440, quality = 0.82 }: ReadFileOptions,
) {
  if (typeof window === 'undefined' || file.type.startsWith('image/') === false) {
    return source
  }

  const image = await loadImage(source)
  const longestSide = Math.max(image.width, image.height)
  const shouldResize = longestSide > maxDimension
  const shouldCompress = file.size > 1_200_000

  if (shouldResize === false && shouldCompress === false) {
    return source
  }

  const scale = shouldResize ? maxDimension / longestSide : 1
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (context === null) {
    return source
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  const outputType =
    file.type === 'image/jpeg' || file.type === 'image/webp'
      ? file.type
      : 'image/jpeg'

  return canvas.toDataURL(outputType, quality)
}

export function readFileAsDataUrl(file: File, options: ReadFileOptions = {}) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        try {
          const optimized = await optimizeImageDataUrl(reader.result, file, options)
          resolve(optimized)
        } catch {
          resolve(reader.result)
        }
        return
      }

      reject(new Error('Не удалось прочитать файл.'))
    }

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл.'))
    }

    reader.readAsDataURL(file)
  })
}
