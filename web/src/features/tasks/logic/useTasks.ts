import { create } from 'zustand';
import type {
  CreateTaskInput,
  ITaskRepository,
  Quadrant,
  Task,
} from '../models/task';
import type { TaskFilter, TaskSortOption } from './taskOperations';
import {
  createTask,
  filterTasks,
  sortTasks,
  toggleDone,
  updateTask as applyUpdate,
} from './taskOperations';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  quadrant: Quadrant | 'all';
  sortBy: TaskSortOption;
  loading: boolean;
  error: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (
    id: string,
    patch: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (
    id: string
  ) => Promise<{ task: Task; undo: () => Promise<void> }>;
  restoreTask: (task: Task) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  setQuadrant: (quadrant: Quadrant | 'all') => void;
  setSortBy: (sortBy: TaskSortOption) => void;
}

let _repo: ITaskRepository | null = null;

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  filter: 'all',
  quadrant: 'all',
  sortBy: 'order',
  loading: false,
  error: null,

  async loadTasks() {
    if (!_repo) return;
    set({ loading: true, error: null });
    try {
      const tasks = await _repo.getAll();
      set({ tasks, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load tasks',
      });
    }
  },

  async addTask(input: CreateTaskInput): Promise<Task> {
    const repo = _repo;
    if (!repo) {
      throw new Error('Task repository not initialized');
    }

    const currentTasks = get().tasks;
    // Calculate new order to place at end of list
    const maxOrder = currentTasks.reduce((max, t) => Math.max(max, t.order), 0);
    const newTask = createTask(input, { order: maxOrder + 1 });

    // Optimistic update
    set({ tasks: [...currentTasks, newTask], error: null });

    try {
      await repo.save(newTask);
      return newTask;
    } catch (err) {
      // Rollback
      set({ tasks: currentTasks, error: 'Failed to save task' });
      throw err;
    }
  },

  async updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    const repo = _repo;
    if (!repo) return;

    const currentTasks = get().tasks;
    const target = currentTasks.find((t) => t.id === id);
    if (!target) return;

    const updated = applyUpdate(target, patch);

    // Optimistic update
    set({
      tasks: currentTasks.map((t) => (t.id === id ? updated : t)),
      error: null,
    });

    try {
      await repo.save(updated);
    } catch (err) {
      // Rollback
      set({ tasks: currentTasks, error: 'Failed to update task' });
      throw err;
    }
  },

  async toggleTask(id: string) {
    const repo = _repo;
    if (!repo) return;

    const currentTasks = get().tasks;
    const target = currentTasks.find((t) => t.id === id);
    if (!target) return;

    const toggled = toggleDone(target);

    // Optimistic update
    set({
      tasks: currentTasks.map((t) => (t.id === id ? toggled : t)),
      error: null,
    });

    try {
      await repo.save(toggled);
    } catch (err) {
      // Rollback
      set({ tasks: currentTasks, error: 'Failed to toggle task' });
      throw err;
    }
  },

  async deleteTask(id: string) {
    const repo = _repo;
    if (!repo) {
      throw new Error('Task repository not initialized');
    }

    const currentTasks = get().tasks;
    const target = currentTasks.find((t) => t.id === id);
    if (!target) {
      throw new Error(`Task ${id} not found`);
    }

    // Optimistic remove
    set({
      tasks: currentTasks.filter((t) => t.id !== id),
      error: null,
    });

    try {
      await repo.delete(id);
    } catch (err) {
      // Rollback
      set({ tasks: currentTasks, error: 'Failed to delete task' });
      throw err;
    }

    // Return undo helper
    const undo = async () => {
      await get().restoreTask(target);
    };

    return { task: target, undo };
  },

  async restoreTask(task: Task) {
    const repo = _repo;
    if (!repo) return;

    const currentTasks = get().tasks;
    // Check if already restored
    if (currentTasks.some((t) => t.id === task.id)) return;

    // Optimistic restore
    set({ tasks: [...currentTasks, task], error: null });

    try {
      await repo.save(task);
    } catch (err) {
      // Rollback
      set({
        tasks: currentTasks.filter((t) => t.id !== task.id),
        error: 'Failed to restore task',
      });
      throw err;
    }
  },

  setFilter(filter: TaskFilter) {
    set({ filter });
  },

  setQuadrant(quadrant: Quadrant | 'all') {
    set({ quadrant });
  },

  setSortBy(sortBy: TaskSortOption) {
    set({ sortBy });
  },
}));

/**
 * Initialise the Task store with an ITaskRepository implementation.
 * Hydrates tasks immediately upon initialization.
 */
export async function initTaskStore(repo: ITaskRepository): Promise<void> {
  _repo = repo;
  await useTaskStore.getState().loadTasks();
}

/**
 * React hook exposing task state, derived lists, and actions.
 */
export function useTasks() {
  const store = useTaskStore();
  const filtered = filterTasks(store.tasks, store.filter, store.quadrant);
  const sorted = sortTasks(filtered, store.sortBy);

  return {
    tasks: sorted,
    allTasks: store.tasks,
    filter: store.filter,
    quadrant: store.quadrant,
    sortBy: store.sortBy,
    loading: store.loading,
    error: store.error,
    addTask: store.addTask,
    updateTask: store.updateTask,
    toggleTask: store.toggleTask,
    deleteTask: store.deleteTask,
    restoreTask: store.restoreTask,
    setFilter: store.setFilter,
    setQuadrant: store.setQuadrant,
    setSortBy: store.setSortBy,
    reload: store.loadTasks,
  };
}
