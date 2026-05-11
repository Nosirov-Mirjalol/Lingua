type UploadcareResponse = {
  file?: string
}

export const fileService = {
  async uploadPdf(file: File): Promise<string> {
    const pubKey = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY
    if (!pubKey) {
      throw new Error('VITE_UPLOADCARE_PUBLIC_KEY topilmadi')
    }

    const formData = new FormData()
    formData.append('UPLOADCARE_PUB_KEY', pubKey)
    formData.append('UPLOADCARE_STORE', 'auto')
    formData.append('file', file)

    const response = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Faylni yuklashda xatolik yuz berdi')
    }

    const data = (await response.json()) as UploadcareResponse

    if (!data.file) {
      throw new Error('Yuklangan fayl manzili topilmadi')
    }

    return `https://4yypsqu6p6.ucarecd.net/${data.file}/`
  },
}
