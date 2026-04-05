'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, RefreshCw, Loader2 } from 'lucide-react'
import { uploadImage, deleteImage, type StorageFolder } from '@/lib/firebase/storage'

interface ImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  folder: StorageFolder
  aspectRatio?: string
  className?: string
  placeholder?: string
}

export default function ImageUploader({
  value,
  onChange,
  folder,
  aspectRatio = '16/9',
  className = '',
  placeholder = '이미지를 드래그하거나 클릭하여 업로드',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setError('')
    setUploading(true)
    try {
      if (value) {
        await deleteImage(value)
      }
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }, [value, folder, onChange])

  const handleDelete = useCallback(async () => {
    if (!value) return
    try {
      await deleteImage(value)
      onChange(null)
    } catch (err) {
      console.error(err)
    }
  }, [value, onChange])

  return (
    <div className={className}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
          <div style={{ aspectRatio }}>
            <img src={value} alt="업로드된 이미지" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="이미지 변경"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
              title="이미지 삭제"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          disabled={uploading}
          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
          style={{ aspectRatio }}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">{placeholder}</span>
              <span className="text-xs text-gray-400">PNG, JPG, WebP (최대 10MB)</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  )
}
