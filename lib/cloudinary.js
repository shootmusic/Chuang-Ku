export async function uploadFile(base64Data, folder, fileName = '') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = 'chuangku'

  // Cek apakah file adalah gambar
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) || 
                  base64Data.startsWith('data:image/')

  // PDF dan file lain pakai raw, gambar pakai image
  const resourceType = isImage ? 'image' : 'raw'

  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `chuangku/${folder}`)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  console.log('Cloudinary:', data.secure_url || data.error?.message)

  if (data.error) throw new Error(data.error.message)
  return { url: data.secure_url, publicId: data.public_id }
}
