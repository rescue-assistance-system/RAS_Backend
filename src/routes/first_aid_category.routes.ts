import { Router } from 'express'
import { FirstAidCategoryController } from '../controllers/first_aid_category.controller'

const router = Router()

const firstAidCategoryController = new FirstAidCategoryController()

// Registration routes
router.get('/', firstAidCategoryController.getAllFirstAidCategories)
router.get('/:id', firstAidCategoryController.getFirstAidCategoryById)
router.post('/', firstAidCategoryController.createFirstAidCategory)
router.put('/:id', firstAidCategoryController.updateFirstAidCategory)
router.delete('/:id', firstAidCategoryController.deleteFirstAidCategory)

export default router
