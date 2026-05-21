// src/routes/v1/auth.js
const router = require('express').Router();
const authController = require('../../controllers/authController');
const { validateRegistration, validateLogin } = require('../../validators/auth');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 */
router.post('/login', validateLogin, authController.login);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;

// src/routes/v1/tasks.js
const router = require('express').Router();
const taskController = require('../../controllers/taskController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateTask } = require('../../validators/task');

router.use(authenticate);

router.post('/', validateTask, taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Admin routes
router.get('/stats/overview', authorize('admin'), taskController.getTaskStats);

module.exports = router;

// src/routes/v1/index.js
const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/tasks', require('./tasks'));
router.use('/users', require('./users'));

module.exports = router;

// src/routes/index.js
const router = require('express').Router();

router.use('/v1', require('./v1'));

module.exports = router;