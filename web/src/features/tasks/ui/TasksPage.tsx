import { TaskList } from './TaskList';
import styles from './TasksPage.module.css';

export function TasksPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>
            Organize tasks and prioritize with the Eisenhower Matrix.
          </p>
        </div>
      </header>

      <TaskList />
    </main>
  );
}

