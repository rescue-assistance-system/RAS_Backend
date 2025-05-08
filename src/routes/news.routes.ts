import { Router } from 'express'
import { NewsController } from '../controllers/news.controller'

const router = Router()

const newsController = new NewsController()

// Registration routes
router.get('/', newsController.getAllNews)
router.get('/:id', newsController.getNewsById)
router.post('/', newsController.createNews)
router.put('/:id', newsController.updateNews)
router.delete('/:id', newsController.deleteNews)

export default router
