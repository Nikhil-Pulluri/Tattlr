import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '@/lib/cloudinary'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}


const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({ multiples: false })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')

  try {
    const { files } = await parseForm(req)
    // const file = files.file as File
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, (err, result) => {
        if (err || !result) reject(err)
        else resolve(result)
      })

      if (file) {
        fs.createReadStream(file.filepath).pipe(uploadStream)
      } else {
        console.error('No file provided')
        res.status(400).json({ error: 'No file provided' })
      }
    })

    res.status(200).json(uploadResult)
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Upload failed', details: err })
  }
}
