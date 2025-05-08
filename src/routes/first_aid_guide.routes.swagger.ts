import { Router } from 'express'
import { FirstAidGuideController } from '../controllers/first_aid_guide.controller'

const router = Router()
const firstAidGuideController = new FirstAidGuideController()

/**
 * @swagger
 * /first-aid-guides:
 *   get:
 *     summary: Get all first aid guides
 *     tags:
 *       - First Aid Guides
 *     responses:
 *       200:
 *         description: List of all first aid guides
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the first aid guide
 *                   name:
 *                     type: string
 *                     description: Name of the first aid guide
 *       400:
 *         description: Bad request
 */
router.get('/', firstAidGuideController.getAllFirstAidGuides)

/**
 * @swagger
 * /first-aid-guides/{id}:
 *   get:
 *     summary: Get a first aid guide by ID
 *     tags:
 *       - First Aid Guides
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the first aid guide
 *     responses:
 *       200:
 *         description: First aid guide details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the first aid guide
 *                 name:
 *                   type: string
 *                   description: Name of the first aid guide
 *       400:
 *         description: Bad request
 */
router.get('/:id', firstAidGuideController.getFirstAidGuideById)

/**
 * @swagger
 * /first-aid-guides:
 *   post:
 *     summary: Create a new first aid guide
 *     tags:
 *       - First Aid Guides
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the first aid guide
 *     responses:
 *       200:
 *         description: First aid guide created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created first aid guide
 *                 name:
 *                   type: string
 *                   description: Name of the created first aid guide
 *       400:
 *         description: Bad request
 */
router.post('/', firstAidGuideController.createFirstAidGuide)

/**
 * @swagger
 * /first-aid-guides/{id}:
 *   put:
 *     summary: Update an existing first aid guide
 *     tags:
 *       - First Aid Guides
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the first aid guide to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the first aid guide
 *     responses:
 *       200:
 *         description: First aid guide updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:id', firstAidGuideController.updateFirstAidGuide)

/**
 * @swagger
 * /first-aid-guides/{id}:
 *   delete:
 *     summary: Delete a first aid guide
 *     tags:
 *       - First Aid Guides
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the first aid guide to delete
 *     responses:
 *       200:
 *         description: First aid guide deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:id', firstAidGuideController.deleteFirstAidGuide)

export default router
