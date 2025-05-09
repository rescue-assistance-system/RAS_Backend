import { Router } from 'express'
import UploadController from '../controllers/cloudinary.controller'
import upload from '../middleware/multer.middleware'

const router = Router()

/**
 * @swagger
 * /upload/file:
 *   post:
 *     summary: Upload a file (image or voice)
 *     description: This endpoint allows users to upload files such as images or voice recordings. The file will be uploaded to Cloudinary and its URL will be returned.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded (image or audio).
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: The URL of the uploaded file on Cloudinary
 *                       example: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/uploads/your-file.jpg
 *                     public_id:
 *                       type: string
 *                       description: The public ID of the uploaded file on Cloudinary
 *                       example: uploads/your-file
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No file uploaded or invalid file type
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to upload file
 */
router.post('/file', upload.single('file'), UploadController.uploadFile)

export default router
