import cloudinary from '../configs/cloudinary.config'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

class CloudinaryService {
    /**
     * Upload file to Cloudinary
     * @param filePaths - Path to the file to be uploaded
     * @param folder - Folder name in Cloudinary
     * @param resourceType - Type of the resource (image, video, raw, etc.)
     */
    public async uploadFile(
        filePath: string,
        folder: string = 'uploads',
        resourceType: 'image' | 'video' | 'raw' = 'image'
    ): Promise<UploadApiResponse> {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder,
                resource_type: resourceType
            })
            console.log(`Uploaded ${resourceType} to Cloudinary:`, result)
            return result
        } catch (error: UploadApiErrorResponse | any) {
            console.error(`Error uploading ${resourceType} to Cloudinary:`, error)
            throw new Error(`Failed to upload ${resourceType} to Cloudinary`)
        }
    }
    public async uploadMultipleFiles(
        filePaths: string[],
        folder: string = 'uploads',
        resourceType: 'image' | 'video' | 'raw' = 'image'
    ): Promise<UploadApiResponse[]> {
        const uploadPromises = filePaths.map((filePath) => this.uploadFile(filePath, folder, resourceType))
        return Promise.all(uploadPromises)
    }
}

export default new CloudinaryService()
