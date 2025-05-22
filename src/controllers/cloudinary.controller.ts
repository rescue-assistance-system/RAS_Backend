import { Request, Response } from 'express'
import CloudinaryService from '../services/cloudinary.service'
import fs from 'fs'
import { createResponse } from '~/utils/response.utils'

class CloudinaryController {
    /**
     * Upload a file to Cloudinary
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns Response with upload result
     */
    public uploadFile = async (req: Request, res: Response): Promise<Response> => {
        try {
            //Check if the file is present in the request
            if (!req.file) {
                return res.status(400).json(createResponse('error', null, 'No file uploaded'))
            }

            // Check if the file is an image, audio, or raw file
            const fileType = this.getFileType(req.file.mimetype)

            if (!fileType) {
                return res
                    .status(400)
                    .json(
                        createResponse(
                            'error',
                            null,
                            'Invalid file type. Only images, audio, and raw files are allowed.'
                        )
                    )
            }

            const result = await CloudinaryService.uploadFile(req.file.path, 'uploads', fileType)

            this.deleteTemporaryFile(req.file.path)

            return res.status(200).json(
                createResponse('success', {
                    url: result.secure_url,
                    public_id: result.public_id
                })
            )
        } catch (error: any) {
            console.error('Error uploading file:', error)

            if (req.file && req.file.path) {
                this.deleteTemporaryFile(req.file.path)
            }

            return res.status(500).json(createResponse('error', null, 'Failed to upload file'))
        }
    }

    public uploadMultipleFiles = async (req: Request, res: Response): Promise<Response> => {
        try {
            const files = req.files as Express.Multer.File[]
            if (!files || files.length === 0) {
                return res.status(400).json(createResponse('error', null, 'No files uploaded'))
            }

            const uploadResults = []
            for (const file of files) {
                const fileType = this.getFileType(file.mimetype)
                if (!fileType) {
                    this.deleteTemporaryFile(file.path)
                    continue
                }
                const result = await CloudinaryService.uploadFile(file.path, 'uploads', fileType)
                uploadResults.push({
                    url: result.secure_url,
                    public_id: result.public_id
                })
                this.deleteTemporaryFile(file.path)
            }

            return res.status(200).json(createResponse('success', uploadResults))
        } catch (error: any) {
            if (req.files) {
                ;(req.files as Express.Multer.File[]).forEach((file) => {
                    this.deleteTemporaryFile(file.path)
                })
            }
            return res.status(500).json(createResponse('error', null, 'Failed to upload files'))
        }
    }
    /**
     * Get file type based on mimetype
     * @param mimetype - Mimetype of the file
     * @returns type of file ('image', 'video', 'raw') or null if not valid
     */
    private getFileType(mimetype: string): 'image' | 'video' | 'raw' | null {
        if (mimetype.startsWith('image/')) {
            return 'image'
        } else if (mimetype.startsWith('audio/')) {
            return 'video'
        } else if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) {
            return 'raw'
        }
        return null
    }

    /**
     * Delete temporary file after upload
     * @param filePath - Path to the temporary file
     */
    private deleteTemporaryFile(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        } catch (error) {
            console.error(`Failed to delete temporary file: ${filePath}`, error)
        }
    }
}

export default new CloudinaryController()
