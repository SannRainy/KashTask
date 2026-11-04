// Public API for features/tasks
// All outside imports must go through this barrel. Deep imports are disallowed.

// Models
export type {
  Task,
  TaskStatus,
  Quadrant,
  CreateTaskInput,
  ITaskRepository,
} from './models/task';
export {
  TaskSchema,
  CreateTaskInputSchema,
  deriveQuadrant,
  createTaskEntity,
} from './models/task';

// Data
export { TaskRepository } from './data/taskRepository';

// Logic
export type { TaskFilter, TaskSortOption } from './logic/taskOperations';
export {
  createTask,
  updateTask,
  toggleDone,
  filterTasks,
  sortTasks,
} from './logic/taskOperations';
export { useTaskStore, useTasks, initTaskStore } from './logic/useTasks';

// UI
export { TaskItem } from './ui/TaskItem';
export type { TaskItemProps } from './ui/TaskItem';
export { TaskForm } from './ui/TaskForm';
export type { TaskFormProps } from './ui/TaskForm';
export { TaskList } from './ui/TaskList';
export { TasksPage } from './ui/TasksPage';
