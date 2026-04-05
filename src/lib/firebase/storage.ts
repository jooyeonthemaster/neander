import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'
import Compressor from 'compressorjs'

export type StorageFolder = 'banners' | 'popups' | 'news' | 'portfolio' | 'site'

function compressImage(file: File, quality = 0.8, maxWidth = 1920): Promise<File | Blob> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight: maxWidth,
      mimeType: 'image/webp',
      convertSize: 500000,
      success: resolve,
      error: reject,
    })
  })
}

function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'webp'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}_${random}.${ext}`
}

export async function uploadImage(
  file: File,
  folder: StorageFolder,
  options?: { quality?: number; maxWidth?: number; skipCompression?: boolean }
): Promise<string> {
  const { quality = 0.8, maxWidth = 1920, skipCompression = false } = options || {}

  let processedFile: File | Blob = file
  if (!skipCompression && !file.type.includes('gif')) {
    processedFile = await compressImage(file, quality, maxWidth)
  }

  const fileName = generateFileName(file.name)
  const storageRef = ref(storage, `${folder}/${fileName}`)

  const metadata = {
    contentType: processedFile instanceof File ? processedFile.type : 'image/webp',
    cacheControl: 'public, max-age=31536000',
  }

  const snapshot = await uploadBytes(storageRef, processedFile, metadata)
  return getDownloadURL(snapshot.ref)
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const decodedUrl = decodeURIComponent(url)

    const legacyMatch = decodedUrl.match(/\/o\/(.+?)\?/)
    if (legacyMatch) {
      const filePath = legacyMatch[1]
      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
      return
    }

    const appMatch = decodedUrl.match(/\.firebasestorage\.app\/(.+?)(?:\?|$)/)
    if (appMatch) {
      const filePath = appMatch[1]
      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
      return
    }

    console.warn('이미지 삭제 건너뜀: 알 수 없는 URL 형식', url)
  } catch (error) {
    console.warn('이미지 삭제 실패 (무시됨):', error)
  }
}
