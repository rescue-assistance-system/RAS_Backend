import { Router } from 'express'
import { NewsCategoryController } from '../controllers/news_category.controller'

const router = Router()

const newsCategoryController = new NewsCategoryController()

// Registration routes
router.get('/', newsCategoryController.getAllNewsCategories)
router.get('/:id', newsCategoryController.getNewsCategoryById)
router.post('/', newsCategoryController.createNewsCategory)
router.put('/:id', newsCategoryController.updateNewsCategory)
router.delete('/:id', newsCategoryController.deleteNewsCategory)

export default router
