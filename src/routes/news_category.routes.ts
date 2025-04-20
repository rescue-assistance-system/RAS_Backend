import { Router } from 'express'
import { NewsCategoryController } from '../controllers/news_category.controller'

import { authorize } from '~/middleware/auth.middleware'

const router = Router()

const newsCategoryController = new NewsCategoryController()

// Registration routes
router.get('/', authorize(['admin']), newsCategoryController.getAllNewsCategories)
router.get('/:id', authorize(['admin']), newsCategoryController.getNewsCategoryById)
router.post('/', authorize(['admin']), newsCategoryController.createNewsCategory)
router.put('/:id', authorize(['admin']), newsCategoryController.updateNewsCategory)
router.delete('/:id', authorize(['admin']), newsCategoryController.deleteNewsCategory)

export default router
