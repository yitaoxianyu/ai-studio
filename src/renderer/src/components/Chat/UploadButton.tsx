import React, { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Image, X, Upload, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import Modal from '../UI/Modal'

type UploadType = 'image' | 'link' | null

interface UploadedImage {
  id: string
  file: File | null
  preview: string
  name: string
  size: number
}

interface UploadButtonProps {
  onImageSelect: (images: UploadedImage[]) => void
  onLinkSubmit: (url: string) => void
  disabled?: boolean
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE = 10 * 1024 * 1024

const UploadButton: React.FC<UploadButtonProps> = ({
  onImageSelect,
  onLinkSubmit,
  disabled = false
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [uploadType, setUploadType] = useState<UploadType>(null)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: t('upload.invalidImageType') }
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: t('upload.fileTooLarge') }
    }
    return { valid: true }
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: UploadedImage[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      const validation = validateImageFile(file)
      if (validation.valid) {
        const preview = URL.createObjectURL(file)
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview,
          name: file.name,
          size: file.size
        })
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      console.error('Upload errors:', errors)
    }

    setImages((prev) => [...prev, ...newImages])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [t])

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image?.preview) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) {
      setLinkError(t('upload.linkRequired'))
      return
    }

    if (!validateUrl(linkUrl)) {
      setLinkError(t('upload.invalidUrl'))
      return
    }

    setIsUploading(true)
    setLinkError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onLinkSubmit(linkUrl)
      setLinkUrl('')
      setIsOpen(false)
      setUploadType(null)
    } catch (error) {
      setLinkError(t('upload.linkFetchError'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageConfirm = () => {
    if (images.length > 0) {
      onImageSelect(images)
      setImages([])
      setIsOpen(false)
      setUploadType(null)
    }
  }

  const handleClose = () => {
    images.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setImages([])
    setLinkUrl('')
    setLinkError('')
    setUploadType(null)
    setIsOpen(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const openUploadModal = (type: UploadType) => {
    setUploadType(type)
    setIsOpen(true)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => openUploadModal('image')}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('chat.image') || 'Image'}
        >
          <Image className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={() => openUploadModal('link')}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('chat.link') || 'Link'}
        >
          <Link className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={uploadType === 'image' ? t('upload.imageTitle') : t('upload.linkTitle')}
        width="w-[480px]"
      >
        <div className="p-4">
          {uploadType === 'image' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('upload.clickToUpload')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t('upload.supportedFormats')}: JPG, PNG, GIF, WebP, SVG (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('upload.selectedImages')} ({images.length})
                    </span>
                    <button
                      onClick={() => setImages([])}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors"
                    >
                      {t('common.clearAll')}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-xs text-white truncate">{image.name}</p>
                          <p className="text-xs text-gray-300">{formatFileSize(image.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleImageConfirm}
                  disabled={images.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('upload.confirm')} ({images.length})
                </button>
              </div>
            </div>
          )}

          {uploadType === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('upload.enterUrl')}
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value)
                    setLinkError('')
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="input-field"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLinkSubmit()
                    }
                  }}
                />
                {linkError && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {linkError}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('upload.linkHint')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleLinkSubmit}
                  disabled={!linkUrl.trim() || isUploading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      {t('upload.addLink')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default UploadButton
export type { UploadedImage }
