export type MatrixQuadrant = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE';

export interface QuadrantDefinition {
  id: MatrixQuadrant;
  name: string;
  label: string;
  action: string;
  description: string;
  urgent: boolean;
  important: boolean;
  colorVar: string;
}

export const QUADRANT_DEFINITIONS: Record<MatrixQuadrant, QuadrantDefinition> =
  {
    DO: {
      id: 'DO',
      name: 'Do First',
      label: 'DO',
      action: 'Urgent & Important',
      description:
        'Crises, deadlines, and pressing problems. Do them immediately.',
      urgent: true,
      important: true,
      colorVar: '--color-quadrant-do',
    },
    SCHEDULE: {
      id: 'SCHEDULE',
      name: 'Schedule',
      label: 'SCHEDULE',
      action: 'Not Urgent but Important',
      description:
        'Strategic planning, health, and personal growth. Schedule dedicated time.',
      urgent: false,
      important: true,
      colorVar: '--color-quadrant-schedule',
    },
    DELEGATE: {
      id: 'DELEGATE',
      name: 'Delegate',
      label: 'DELEGATE',
      action: 'Urgent but Not Important',
      description:
        'Interruptions, busywork, and meetings. Delegate or automate if possible.',
      urgent: true,
      important: false,
      colorVar: '--color-quadrant-delegate',
    },
    ELIMINATE: {
      id: 'ELIMINATE',
      name: 'Eliminate',
      label: 'ELIMINATE',
      action: 'Neither Urgent nor Important',
      description:
        'Time wasters, excessive social media, and trivia. Eliminate or minimize.',
      urgent: false,
      important: false,
      colorVar: '--color-quadrant-eliminate',
    },
  };

export const QUADRANT_ORDER: MatrixQuadrant[] = [
  'DO',
  'SCHEDULE',
  'DELEGATE',
  'ELIMINATE',
];
