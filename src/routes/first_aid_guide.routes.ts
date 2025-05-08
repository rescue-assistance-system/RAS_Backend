import { Router } from 'express'
import { FirstAidGuideController } from '../controllers/first_aid_guide.controller'

const router = Router()

const firstAidGuideController = new FirstAidGuideController()

// Registration routes
router.get('/', firstAidGuideController.getAllFirstAidGuides)
router.get('/:id', firstAidGuideController.getFirstAidGuideById)
router.post('/', firstAidGuideController.createFirstAidGuide)
router.put('/:id', firstAidGuideController.updateFirstAidGuide)
router.delete('/:id', firstAidGuideController.deleteFirstAidGuide)

export default router
