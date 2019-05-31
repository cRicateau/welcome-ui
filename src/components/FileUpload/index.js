import React, { useEffect, useState } from 'react'
import { bool, func, node, number, oneOfType, string } from 'prop-types'
import { useDropzone } from 'react-dropzone'

// Common
import { Icon } from '../Icon'
import { Button } from '../Button'
import { validateFileSize, validateMimeType } from '../../utils/validations'

// FileUpload
import { Actions, FilePreview, StyledFileUpload } from './styles.js'
import { DefaultContent } from './default.js'

const DEFAULT_MAX_FILE_SIZE = 2000000
const ERROR_INVALID_TYPE = 'ERROR_INVALID_TYPE'
const ERROR_INVALID_SIZE = 'ERROR_INVALID_SIZE'

const getPreviewUrl = url =>
  typeof url !== 'string' || url.startsWith('blob:') ? url : new URL(url)

const createEvent = file => ({
  preventDefault: () => {},
  target: {
    name,
    value: file
  }
})

export const FileUpload = ({
  input,
  accept = 'image/*',
  disabled = false,
  multiple = false,
  maxSize = DEFAULT_MAX_FILE_SIZE,
  children = DefaultContent,
  onAddFile,
  onChange,
  onError,
  onRemoveFile
}) => {
  const [file, setFile] = useState(null)

  // Clean up URL
  useEffect(() => {
    return () => file && URL.revokeObjectURL(file.preview)
  }, [file])

  const handleDropAccepted = files => {
    const [file] = files
    file.preview = URL.createObjectURL(file)
    setFile(file)

    onChange && onChange(createEvent(file))
    onAddFile && onAddFile(file)
  }

  const handleDropRejected = files => {
    files.forEach(file => {
      if (!validateMimeType(file, accept)) {
        onError && onError(ERROR_INVALID_TYPE)
      } else if (!validateFileSize(file, maxSize)) {
        onError && onError(ERROR_INVALID_SIZE)
      }
    })
  }

  const handleRemoveFile = e => {
    e.preventDefault()
    setFile(null)

    onChange && onChange(createEvent())
    onRemoveFile && onRemoveFile()
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
    noClick: true,
    multiple,
    accept,
    disabled,
    maxSize,
    children
  })

  const hasFile = !!file

  return (
    <StyledFileUpload
      {...getRootProps({ handleRemoveFile, isDragActive, isDragAccept, isDragReject, disabled })}
    >
      <input {...getInputProps({ name: input && input.name })} />
      <FilePreview>
        {children({
          fileUrl: file && getPreviewUrl(file.preview),
          isDefault: !file && !isDragActive,
          isHoverAccept: isDragAccept,
          isHoverReject: isDragReject,
          openFile: open
        })}
        {hasFile && (
          <Actions>
            <Button onClick={open} size="sm" type="button" variant="secondary">
              <Icon name="pencil" size="sm" />
            </Button>
            <Button onClick={handleRemoveFile} size="sm" type="button" variant="primary-danger">
              <Icon name="cross" size="sm" />
            </Button>
          </Actions>
        )}
      </FilePreview>
    </StyledFileUpload>
  )
}

FileUpload.propTypes = {
  accept: string,
  children: func,
  disabled: bool,
  input: node,
  maxSize: number,
  multiple: bool,
  onAddFile: func,
  onChange: func,
  onError: func,
  onRemoveFile: func,
  title: oneOfType([string, node])
}