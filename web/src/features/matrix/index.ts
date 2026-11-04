// Public API for features/matrix
// All outside imports must go through this barrel. Deep imports are disallowed.

// Models
export type { MatrixQuadrant, QuadrantDefinition } from './models/matrix';
export { QUADRANT_DEFINITIONS, QUADRANT_ORDER } from './models/matrix';

// Logic
export { moveTask, QUADRANT_FLAGS } from './logic/moveTask';

// UI
export { MatrixTaskCard } from './ui/MatrixTaskCard';
export type { MatrixTaskCardProps } from './ui/MatrixTaskCard';
export { QuadrantColumn } from './ui/QuadrantColumn';
export type { QuadrantColumnProps } from './ui/QuadrantColumn';
export { MatrixBoard } from './ui/MatrixBoard';
export { MatrixPage } from './ui/MatrixPage';
