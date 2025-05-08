import { Router } from 'express';
import { NewsCategoryController } from '../controllers/news_category.controller';

const router = Router();
const newsCategoryController = new NewsCategoryController();

/**
 * @swagger
 * /news-categories:
 *   get:
 *     summary: Get all news categories
 *     tags:
 *       - News Categories
 *     responses:
 *       200:
 *         description: List of all news categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the news category
 *                   name:
 *                     type: string
 *                     description: Name of the news category
 *       400:
 *         description: Bad request
 */
router.get('/', newsCategoryController.getAllNewsCategories);

/**
 * @swagger
 * /news-categories/{id}:
 *   get:
 *     summary: Get a news category by ID
 *     tags:
 *       - News Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news category
 *     responses:
 *       200:
 *         description: News category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the news category
 *                 name:
 *                   type: string
 *                   description: Name of the news category
 *       400:
 *         description: Bad request
 */
router.get('/:id', newsCategoryController.getNewsCategoryById);

/**
 * @swagger
 * /news-categories:
 *   post:
 *     summary: Create a new news category
 *     tags:
 *       - News Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the news category
 *     responses:
 *       200:
 *         description: News category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created news category
 *                 name:
 *                   type: string
 *                   description: Name of the created news category
 *       400:
 *         description: Bad request
 */
router.post('/', newsCategoryController.createNewsCategory);

/**
 * @swagger
 * /news-categories/{id}:
 *   put:
 *     summary: Update an existing news category
 *     tags:
 *       - News Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the news category
 *     responses:
 *       200:
 *         description: News category updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:id', newsCategoryController.updateNewsCategory);

/**
 * @swagger
 * /news-categories/{id}:
 *   delete:
 *     summary: Delete a news category
 *     tags:
 *       - News Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news category to delete
 *     responses:
 *       200:
 *         description: News category deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:id', newsCategoryController.deleteNewsCategory);

export default router;