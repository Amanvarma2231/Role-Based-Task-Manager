// backend/src/config/migrate.js
const { sequelize } = require('../models');
const logger = require('../utils/logger');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database migrations completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();

// backend/src/config/seed.js
const { User, Task } = require('../models');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    });

    // Create regular users
    const users = await User.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'User@1234',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'User@1234',
        role: 'user'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'User@1234',
        role: 'user'
      }
    ]);

    // Create sample tasks
    const tasks = await Task.bulkCreate([
      {
        title: 'Implement user authentication',
        description: 'Set up JWT-based authentication with refresh tokens',
        status: 'done',
        priority: 'high',
        createdBy: admin.id,
        assignedTo: users[0].id,
        tags: ['backend', 'security']
      },
      {
        title: 'Design database schema',
        description: 'Create PostgreSQL schema with proper relationships',
        status: 'done',
        priority: 'high',
        createdBy: admin.id,
        assignedTo: admin.id,
        tags: ['database', 'design']
      },
      {
        title: 'Build REST API endpoints',
        description: 'Implement CRUD operations for tasks with validation',
        status: 'in_progress',
        priority: 'high',
        createdBy: admin.id,
        assignedTo: users[1].id,
        tags: ['backend', 'api']
      },
      {
        title: 'Create React frontend',
        description: 'Build responsive UI with React and Tailwind CSS',
        status: 'in_progress',
        priority: 'high',
        createdBy: admin.id,
        assignedTo: users[0].id,
        tags: ['frontend', 'react']
      },
      {
        title: 'Write unit tests',
        description: 'Add tests for backend API endpoints',
        status: 'todo',
        priority: 'medium',
        createdBy: admin.id,
        assignedTo: users[2].id,
        tags: ['testing']
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated deployment',
        status: 'todo',
        priority: 'medium',
        createdBy: admin.id,
        tags: ['devops']
      },
      {
        title: 'Add API documentation',
        description: 'Create Swagger documentation for all endpoints',
        status: 'review',
        priority: 'low',
        createdBy: users[0].id,
        assignedTo: users[1].id,
        tags: ['documentation']
      },
      {
        title: 'Implement caching',
        description: 'Add Redis caching for improved performance',
        status: 'todo',
        priority: 'medium',
        createdBy: admin.id,
        assignedTo: users[2].id,
        tags: ['backend', 'performance']
      }
    ]);

    logger.info('Seed data created successfully');
    logger.info(`Created ${1} admin, ${users.length} users, and ${tasks.length} tasks`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();