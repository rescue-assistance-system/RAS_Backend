import { Router } from 'express'
import { FirstAidGuideController } from '../controllers/first_aid_guide.controller'

import { authorize } from '~/middleware/auth.middleware'

const router = Router()

const firstAidGuideController = new FirstAidGuideController()

// Registration routes
router.get('/', authorize(['admin']), firstAidGuideController.getAllFirstAidGuides)
router.get('/:id', authorize(['admin']), firstAidGuideController.getFirstAidGuideById)
router.post('/', authorize(['admin']), firstAidGuideController.createFirstAidGuide)
router.put('/:id', authorize(['admin']), firstAidGuideController.updateFirstAidGuide)
router.delete('/:id', authorize(['admin']), firstAidGuideController.deleteFirstAidGuide)

export default router
