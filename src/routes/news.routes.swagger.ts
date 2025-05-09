import { Router } from 'express'
import { NewsController } from '../controllers/news.controller'

const router = Router()
const newsController = new NewsController()

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news
 *     tags:
 *       - News
 *     responses:
 *       200:
 *         description: List of all news
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the news
 *                   name:
 *                     type: string
 *                     description: Name of the news
 *       400:
 *         description: Bad request
 */
router.get('/', newsController.getAllNews)

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get news by ID
 *     tags:
 *       - News
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news
 *     responses:
 *       200:
 *         description: News details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the news
 *                 name:
 *                   type: string
 *                   description: Name of the news
 *       400:
 *         description: Bad request
 */
router.get('/:id', newsController.getNewsById)

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news entry
 *     tags:
 *       - News
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the news
 *     responses:
 *       200:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created news
 *                 name:
 *                   type: string
 *                   description: Name of the created news
 *       400:
 *         description: Bad request
 */
router.post('/', newsController.createNews)

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update an existing news entry
 *     tags:
 *       - News
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the news
 *     responses:
 *       200:
 *         description: News updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:id', newsController.updateNews)

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete a news entry
 *     tags:
 *       - News
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news to delete
 *     responses:
 *       200:
 *         description: News deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:id', newsController.deleteNews)

/**
 * @swagger
 * /news/search/{query}:
 *   get:
 *     summary: Search news by query
 *     tags:
 *       - News
 *     parameters:
 *       - name: query
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for the news
 *     responses:
 *       200:
 *         description: List of news matching the query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the news
 *                   name:
 *                     type: string
 *                     description: Name of the news
 *       400:
 *         description: Bad request
 */
router.get('/search/:query', newsController.searchNews)

export default router
