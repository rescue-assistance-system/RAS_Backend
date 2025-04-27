import { Router } from 'express'
import { FirstAidCategoryController } from '../controllers/first_aid_category.controller'

import { authorize } from '~/middleware/auth.middleware'

const router = Router()

const firstAidCategoryController = new FirstAidCategoryController()

// Registration routes
router.get('/', authorize(['admin']), firstAidCategoryController.getAllFirstAidCategories)
router.get('/:id', authorize(['admin']), firstAidCategoryController.getFirstAidCategoryById)
router.post('/', authorize(['admin']), firstAidCategoryController.createFirstAidCategory)
router.put('/:id', authorize(['admin']), firstAidCategoryController.updateFirstAidCategory)
router.delete('/:id', authorize(['admin']), firstAidCategoryController.deleteFirstAidCategory)

export default router
