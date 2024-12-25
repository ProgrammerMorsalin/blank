import { writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(process.cwd(), 'public/uploads', filename)
    
    await writeFile(filepath, buffer)
    
    return NextResponse.json({ 
      url: `/uploads/${filename}` 
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}