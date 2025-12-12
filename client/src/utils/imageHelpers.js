/**
 * Image Helper Utilities
 * Centralized image processing functions used across the application
 */

/**
 * Compress and convert image file to data URL
 * Ensures images fit in database VARCHAR limits by aggressive compression
 * 
 * @param {File} file - Image file to process
 * @param {Object} options - Compression options
 * @param {number} options.maxBase64Size - Maximum base64 size in bytes (default: 300000)
 * @param {number} options.maxDimension - Maximum dimension in pixels (default: 400)
 * @param {boolean} options.aggressiveCompression - Use aggressive compression (default: true)
 * @returns {Promise<string>} Base64 data URL string
 */
export function fileToDataUrl(file, options = {}) {
  const {
    maxBase64Size = 300000,
    maxDimension = 400,
    aggressiveCompression = true
  } = options

  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file object'))
      return
    }


    if (aggressiveCompression && (file.size > 100 * 1024 || file.type === 'image/png')) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {

        let width = img.width
        let height = img.height
        let currentMaxDimension = maxDimension


        if (width > height && width > currentMaxDimension) {
          height = (height / width) * currentMaxDimension
          width = currentMaxDimension
        } else if (height > currentMaxDimension) {
          width = (width / height) * currentMaxDimension
          height = currentMaxDimension
        }

        canvas.width = width
        canvas.height = height


        ctx.drawImage(img, 0, 0, width, height)



        let quality = file.type === 'image/png' ? 0.5 : 0.6
        let compressed = canvas.toDataURL('image/jpeg', quality)


        if (compressed.length > maxBase64Size) {
          const qualities = [0.5, 0.4, 0.3, 0.2]
          for (const q of qualities) {
            if (compressed.length > maxBase64Size) {
              quality = q
              compressed = canvas.toDataURL('image/jpeg', quality)
            } else {
              break
            }
          }
        }


        if (compressed.length > maxBase64Size) {
          currentMaxDimension = 300
          if (width > height) {
            height = (height / width) * currentMaxDimension
            width = currentMaxDimension
          } else {
            width = (width / height) * currentMaxDimension
            height = currentMaxDimension
          }
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          compressed = canvas.toDataURL('image/jpeg', 0.5)
        }


        if (compressed.length > maxBase64Size) {
          currentMaxDimension = 200
          if (width > height) {
            height = (height / width) * currentMaxDimension
            width = currentMaxDimension
          } else {
            width = (width / height) * currentMaxDimension
            height = currentMaxDimension
          }
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          compressed = canvas.toDataURL('image/jpeg', 0.4)
        }

        if (compressed.length > maxBase64Size) {
          console.warn('Image still too large after compression:', compressed.length)
        }

        resolve(compressed)
      }

      img.onerror = (error) => {
        console.error('Error loading image for compression:', error)
        reject(error)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    } else {

      const reader = new FileReader()
      reader.onload = (evt) => {
        const dataUrl = evt.target.result



        if (file.type === 'image/png' || dataUrl.length > maxBase64Size) {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            let width = img.width
            let height = img.height
            const currentMaxDimension = maxDimension

            if (width > height && width > currentMaxDimension) {
              height = (height / width) * currentMaxDimension
              width = currentMaxDimension
            } else if (height > currentMaxDimension) {
              width = (width / height) * currentMaxDimension
              height = currentMaxDimension
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/jpeg', 0.5)
            resolve(compressed)
          }
          img.onerror = reject
          img.src = dataUrl
        } else {
          resolve(dataUrl)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    }
  })
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateImageFile(file, options = {}) {
  const { maxSize = 5 * 1024 * 1024 } = options

  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Please select a valid image file.' }
  }

  if (!file.type || !file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file.' }
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Image file size must be less than ${Math.round(maxSize / 1024 / 1024)}MB. Please choose a smaller image.` 
    }
  }

  return { valid: true }
}


