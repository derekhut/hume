"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpload: (file: Blob) => void
  accept?: string
  children?: React.ReactNode
}

export function Upload({ onUpload, accept, children, className, ...props }: UploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn("relative", className)} {...props}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
        aria-label="Upload file"
      />
      <div
        onClick={handleClick}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick()
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
