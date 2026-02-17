import type { ToDo } from '../../backend';

export type ToDoStatus = 'all' | 'open' | 'completed' | 'due-soon';

export function isOverdue(todo: ToDo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  const dueDate = new Date(Number(todo.dueDate) / 1_000_000);
  return dueDate < new Date();
}

export function isDueToday(todo: ToDo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  const dueDate = new Date(Number(todo.dueDate) / 1_000_000);
  const today = new Date();
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
}

export function filterTodos(todos: ToDo[], status: ToDoStatus): ToDo[] {
  switch (status) {
    case 'all':
      return todos;
    case 'open':
      return todos.filter((t) => !t.completed);
    case 'completed':
      return todos.filter((t) => t.completed);
    case 'due-soon':
      return todos.filter((t) => !t.completed && (isDueToday(t) || isOverdue(t)));
    default:
      return todos;
  }
}
