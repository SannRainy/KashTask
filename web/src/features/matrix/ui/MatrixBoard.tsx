import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  useTasks,
  deriveQuadrant,
  type Task,
  type Quadrant,
} from '@features/tasks';
import {
  QUADRANT_DEFINITIONS,
  QUADRANT_ORDER,
  type MatrixQuadrant,
} from '../models/matrix';
import { moveTask, QUADRANT_FLAGS } from '../logic/moveTask';
import { QuadrantColumn } from './QuadrantColumn';
import { MatrixTaskCard } from './MatrixTaskCard';
import styles from './MatrixBoard.module.css';

export function MatrixBoard() {
  const { allTasks, addTask, updateTask, toggleTask, deleteTask } = useTasks();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<MatrixQuadrant>('DO');

  // Group tasks by their derived quadrant, sorted by order ascending
  const tasksByQuadrant = useMemo(() => {
    const grouped: Record<Quadrant, Task[]> = {
      DO: [],
      SCHEDULE: [],
      DELEGATE: [],
      ELIMINATE: [],
    };

    allTasks.forEach((task) => {
      const q = deriveQuadrant(task);
      grouped[q].push(task);
    });

    // Sort tasks in each quadrant by order ascending
    QUADRANT_ORDER.forEach((q) => {
      grouped[q].sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [allTasks]);

  // Accessible Sensors (Pointer, Touch, and Keyboard navigation)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  // Screen reader aria-live announcements for accessibility
  const accessibilityAnnouncements: Announcements = {
    onDragStart({ active }) {
      const task = allTasks.find((t) => t.id === active.id);
      return `Grabbed task "${task?.title}". Use arrow keys to reorder or move between quadrants, Space or Enter to drop, Escape to cancel.`;
    },
    onDragOver({ active, over }) {
      if (!over) return '';
      const task = allTasks.find((t) => t.id === active.id);
      return `Moving "${task?.title}" over ${over.id}.`;
    },
    onDragEnd({ active, over }) {
      if (!over) return 'Drag cancelled.';
      const task = allTasks.find((t) => t.id === active.id);
      return `Dropped task "${task?.title}".`;
    },
    onDragCancel({ active }) {
      const task = allTasks.find((t) => t.id === active.id);
      return `Cancelled dragging task "${task?.title}".`;
    },
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const activeTaskObj = allTasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    let targetQuadrant: Quadrant;
    let targetIndex: number;

    const overData = over.data.current;

    if (overData?.type === 'Quadrant') {
      // Dropped directly on a quadrant column
      targetQuadrant = overData.quadrant as Quadrant;
      targetIndex = tasksByQuadrant[targetQuadrant].length;
    } else {
      // Dropped on another task card
      const overTaskId = String(over.id);
      const overTask = allTasks.find((t) => t.id === overTaskId);
      if (!overTask) return;

      targetQuadrant = deriveQuadrant(overTask);
      const quadrantList = tasksByQuadrant[targetQuadrant];
      const foundIdx = quadrantList.findIndex((t) => t.id === overTaskId);
      targetIndex = foundIdx >= 0 ? foundIdx : quadrantList.length;
    }

    // Pure calculation of updated tasks array
    const updatedTasks = moveTask(
      allTasks,
      activeId,
      targetQuadrant,
      targetIndex
    );

    const movedTask = updatedTasks.find((t) => t.id === activeId);
    if (movedTask) {
      // Persist update via public API of tasks feature
      await updateTask(activeId, {
        urgent: movedTask.urgent,
        important: movedTask.important,
        order: movedTask.order,
      });
    }
  };

  const handleQuickAdd = async (quadrant: Quadrant, title: string) => {
    const flags = QUADRANT_FLAGS[quadrant];
    await addTask({
      title,
      urgent: flags.urgent,
      important: flags.important,
    });
  };

  return (
    <div className={styles.boardContainer}>
      {/* Mobile Responsive Quadrant Tabs */}
      <div
        className={styles.mobileTabs}
        role="tablist"
        aria-label="Mobile Quadrant Navigation"
      >
        {QUADRANT_ORDER.map((q) => {
          const def = QUADRANT_DEFINITIONS[q];
          const count = tasksByQuadrant[q].length;
          return (
            <button
              key={q}
              role="tab"
              aria-selected={activeMobileTab === q}
              className={[
                styles.mobileTab,
                activeMobileTab === q ? styles.mobileTabActive : '',
              ].join(' ')}
              onClick={() => setActiveMobileTab(q)}
            >
              <span>{def.label}</span>
              <span className={styles.mobileBadge}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* DndContext with accessible configuration */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: accessibilityAnnouncements,
        }}
      >
        {/* 2x2 Quadrant Grid */}
        <div
          className={styles.grid}
          data-active-mobile={activeMobileTab}
          role="region"
          aria-label="Eisenhower 2x2 Matrix Board"
        >
          {QUADRANT_ORDER.map((q) => (
            <QuadrantColumn
              key={q}
              quadrantDef={QUADRANT_DEFINITIONS[q]}
              tasks={tasksByQuadrant[q]}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>

        {/* Smooth Drag Overlay (animations strictly transform/opacity) */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <MatrixTaskCard
              task={activeTask}
              quadrant={deriveQuadrant(activeTask)}
              onToggle={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
