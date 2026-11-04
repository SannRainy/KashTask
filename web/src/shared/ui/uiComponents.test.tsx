import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Dialog } from './Dialog';
import { EmptyState } from './EmptyState';
import { ThemeToggle } from './ThemeToggle';
import { Toast } from './Toast';

describe('shared/ui components', () => {
  describe('Button', () => {
    it('renders text and handles click', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click Me</Button>);
      const btn = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders in disabled / loading state', () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Saving
        </Button>
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('IconButton', () => {
    it('renders with accessible name', () => {
      render(
        <IconButton aria-label="Close panel">
          <span>X</span>
        </IconButton>
      );
      expect(
        screen.getByRole('button', { name: 'Close panel' })
      ).toBeInTheDocument();
    });
  });

  describe('Checkbox', () => {
    it('handles checked change', () => {
      const onChange = vi.fn();
      render(<Checkbox label="Mark as completed" onChange={onChange} />);
      const checkbox = screen.getByRole('checkbox', {
        name: 'Mark as completed',
      });
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Input', () => {
    it('renders label and error message', () => {
      render(
        <Input
          label="Task Title"
          error="Title is required"
          defaultValue="Existing title"
        />
      );
      expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    });
  });

  describe('Dialog', () => {
    it('renders when open and traps Escape key to close', () => {
      const onClose = vi.fn();
      render(
        <Dialog open={true} onClose={onClose} title="Test Dialog">
          <p>Dialog body</p>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when open is false', () => {
      render(
        <Dialog open={false} onClose={() => {}} title="Test Dialog">
          <p>Dialog body</p>
        </Dialog>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renders title and description', () => {
      render(
        <EmptyState
          title="No tasks yet"
          description="Create your first task"
          action={<Button>Add</Button>}
        />
      );
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });
  });

  describe('ThemeToggle', () => {
    it('cycles from light -> dark on click', () => {
      const onModeChange = vi.fn();
      render(
        <ThemeToggle
          mode="light"
          resolvedTheme="light"
          onModeChange={onModeChange}
          showLabel
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Light');
      fireEvent.click(button);
      expect(onModeChange).toHaveBeenCalledWith('dark');
    });

    it('cycles from dark -> system on click', () => {
      const onModeChange = vi.fn();
      render(
        <ThemeToggle
          mode="dark"
          resolvedTheme="dark"
          onModeChange={onModeChange}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onModeChange).toHaveBeenCalledWith('system');
    });
  });

  describe('Toast', () => {
    it('renders message and calls onDismiss on close click', () => {
      const onDismiss = vi.fn();
      render(
        <Toast
          item={{ id: '1', message: 'Task saved!', variant: 'success' }}
          onDismiss={onDismiss}
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Task saved!');
      fireEvent.click(screen.getByLabelText('Dismiss notification'));
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });
});
