'use client'

import { useRef, useState, useCallback } from 'react'
import { MAX_IMAGE_DIMENSION, MAX_IMAGE_SIZE_MB } from '@/lib/constants'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setStream(s)
      setIsOpen(true)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    } catch {
      throw new Error('Камер нээхэд алдаа гарлаа. Камерын зөвшөөрлийг шалгана уу.')
    }
  }, [])

  const closeCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setIsOpen(false)
  }, [stream])

  const capture = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current) return null

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    return await compressCanvas(canvas, 'capture.jpg')
  }, [])

  return { videoRef, isOpen, openCamera, closeCamera, capture }
}

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)

      const compressed = await compressCanvas(canvas, file.name)
      resolve(compressed)
    }

    img.onerror = reject
    img.src = url
  })
}

async function compressCanvas(canvas: HTMLCanvasElement, name: string): Promise<File> {
  const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
  let quality = 0.85

  while (quality > 0.3) {
    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob(b => res(b!), 'image/jpeg', quality)
    )
    if (blob.size <= maxBytes) {
      return new File([blob], name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
    }
    quality -= 0.1
  }

  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob(b => res(b!), 'image/jpeg', 0.3)
  )
  return new File([blob], name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
}
