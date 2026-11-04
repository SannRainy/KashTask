import { MatrixBoard } from './MatrixBoard';
import styles from './MatrixPage.module.css';

export function MatrixPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Eisenhower Matrix</h1>
          <p className={styles.subtitle}>
            Prioritize your workflow by urgency and importance with
            drag-and-drop.
          </p>
        </div>
      </header>

      <MatrixBoard />
    </main>
  );
}
