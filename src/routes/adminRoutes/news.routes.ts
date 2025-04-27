import { Router } from 'express'
import { NewsController } from '../../controllers/adminController/news.controller'

import { authorize } from '~/middleware/auth.middleware'

const router = Router()

const newsController = new NewsController()

// Registration routes
router.get('/', authorize(['admin']), newsController.getAllNews)
router.get('/:id', authorize(['admin']), newsController.getNewsById)
router.post('/', authorize(['admin']), newsController.createNews)
router.put('/:id', authorize(['admin']), newsController.updateNews)
router.delete('/:id', authorize(['admin']), newsController.deleteNews)

export default router
