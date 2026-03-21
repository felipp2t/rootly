// biome-ignore-all lint/a11y/noStaticElementInteractions: using a pre-built component
// biome-ignore-all lint/a11y/useKeyWithClickEvents: using a pre-built component

import { CheckCircleIcon, FileTextIcon, UploadIcon } from 'lucide-react'
import React from 'react'
import { formatFileSize } from '@/shared/utils/format-file-size'

interface FileInputProps {
  value?: File | null
  onChange?: (file: File) => void
  onBlur?: () => void
}

export function FileInput({ value, onChange, onBlur }: FileInputProps) {
  const [internalFile, setInternalFile] = React.useState<File | null>(null)
  const imageFile = value !== undefined ? value : internalFile
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const updateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0]
      setInternalFile(file)
      onChange?.(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files?.[0]) {
      const file = event.dataTransfer.files[0]
      setInternalFile(file)
      onChange?.(file)
    }
  }

  return (
    <div className={'container'}>
      <div
        onDragOver={handleDragOver}
        onDrop={handleFileDrop}
        onClick={handleImageUploadClick}
        onBlur={onBlur}
      >
        {imageFile ? (
          <div className='flex flex-col items-center gap-2'>
            <CheckCircleIcon className='size-4 text-primary' />
            <div className='flex items-center gap-2'>
              <FileTextIcon className='size-4 text-primary' />
              <p className='text-primary font-mono text-sm font-semibold'>
                {imageFile.name}
              </p>
            </div>
            <p className='text-muted-foreground font-mono text-xs'>
              {formatFileSize(imageFile.size)}
            </p>
            <p className='text-muted-foreground font-mono text-xs'>
              Click to change
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-2 bg-outline border border-dashed border-accent cursor-pointer items-center justify-center h-40'>
            <UploadIcon className='text-muted-foreground' />
            <p className='text-muted-foreground font-mono text-sm'>
              DRAG &amp; DROP OR CLICK TO UPLOAD
            </p>
            <p className='text-muted-foreground font-mono text-xs'>
              PDF, DOCX, TXT, MD up to 10MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type='file'
          style={{ display: 'none' }}
          onChange={updateImage}
        />
      </div>
    </div>
  )
}
