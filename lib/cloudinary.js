export async function uploadFile(base64Data, folder) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = 'chuangku'

  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `chuangku/${folder}`)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  console.log('Cloudinary:', data.secure_url || data.error?.message)

  if (data.error) throw new Error(data.error.message)
  return { url: data.secure_url, publicId: data.public_id }
}
