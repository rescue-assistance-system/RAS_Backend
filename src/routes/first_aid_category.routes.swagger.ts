import { Router } from 'express'
import { FirstAidCategoryController } from '../controllers/first_aid_category.controller'

const router = Router()
const firstAidCategoryController = new FirstAidCategoryController()

/**
 * @swagger
 * /first-aid-categories:
 *   get:
 *     summary: Get all first aid categories
 *     tags:
 *       - First Aid Categories
 *     responses:
 *       200:
 *         description: List of all first aid categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the first aid category
 *                   name:
 *                     type: string
 *                     description: Name of the first aid category
 *       400:
 *         description: Bad request
 */
router.get('/', firstAidCategoryController.getAllFirstAidCategories)

/**
 * @swagger
 * /first-aid-categories/{id}:
 *   get:
 *     summary: Get a first aid category by ID
 *     tags:
 *       - First Aid Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the first aid category
 *     responses:
 *       200:
 *         description: First aid category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the first aid category
 *                 name:
 *                   type: string
 *                   description: Name of the first aid category
 *       400:
 *         description: Bad request
 */
router.get('/:id', firstAidCategoryController.getFirstAidCategoryById)

/**
 * @swagger
 * /first-aid-categories:
 *   post:
 *     summary: Create a new first aid category
 *     tags:
 *       - First Aid Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the first aid category
 *     responses:
 *       200:
 *         description: First aid category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created first aid category
 *                 name:
 *                   type: string
 *                   description: Name of the created first aid category
 *       400:
 *         description: Bad request
 */
router.post('/', firstAidCategoryController.createFirstAidCategory)

/**
 * @swagger
 * /first-aid-categories/{id}:
 *   put:
 *     summary: Update an existing first aid category
 *     tags:
 *       - First Aid Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the first aid category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the first aid category
 *     responses:
 *       200:
 *         description: First aid category updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:id', firstAidCategoryController.updateFirstAidCategory)

/**
 * @swagger
 * /first-aid-categories/{id}:
 *   delete:
 *     summary: Delete a first aid category
 *     tags:
 *       - First Aid Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the first aid category to delete
 *     responses:
 *       200:
 *         description: First aid category deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:id', firstAidCategoryController.deleteFirstAidCategory)

export default router
