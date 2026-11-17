const express = require('express');
const { PORT } = require('./src/config/constants');
const { requestLogger } = require('./src/middleware/logger');
const { errorHandler } = require('./src/middleware/error-handler');
const { rootRouter } = require('./src/routes/root');
const { healthRouter } = require('./src/routes/health');
const { webhooksRouter } = require('./src/routes/webhooks');
const { usersRouter } = require('./src/routes/users');
const { projectsRouter } = require('./src/routes/projects');
const { tasksRouter } = require('./src/routes/tasks');
const { commentsRouter } = require('./src/routes/comments');
const { taskTagsRouter } = require('./src/routes/task-tags');
const { tagsRouter } = require('./src/routes/tags');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/', rootRouter);
app.use('/health', healthRouter);
app.use('/webhooks', webhooksRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/tasks/:id/comments', commentsRouter);
app.use('/tasks/:id/tags', taskTagsRouter);
app.use('/tasks', tasksRouter);
app.use('/tags', tagsRouter);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
