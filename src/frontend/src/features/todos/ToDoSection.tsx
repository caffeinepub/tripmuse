import { useState } from 'react';
import { TripPlan, ToDo } from '../../backend';
import { useAddTripToDos, useMarkToDoCompleted } from '../../hooks/useQueries';
import { filterTodos, isDueToday, isOverdue } from './todoModels';
import SectionHeading from '../../components/SectionHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ToDoSectionProps {
  trip: TripPlan;
}

export default function ToDoSection({ trip }: ToDoSectionProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'completed' | 'due-soon'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', notes: '', dueDate: '' });

  const addTodosMutation = useAddTripToDos();
  const markCompletedMutation = useMarkToDoCompleted();

  const filteredTodos = filterTodos(trip.toDos, filter);

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const todoToAdd: ToDo = {
      title: newTodo.title.trim(),
      notes: newTodo.notes.trim(),
      dueDate: newTodo.dueDate ? BigInt(new Date(newTodo.dueDate).getTime() * 1_000_000) : undefined,
      completed: false,
    };

    try {
      await addTodosMutation.mutateAsync({
        tripId: trip.id,
        todos: [...trip.toDos, todoToAdd],
      });
      setNewTodo({ title: '', notes: '', dueDate: '' });
      setIsAddDialogOpen(false);
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleToggleComplete = async (index: number) => {
    try {
      await markCompletedMutation.mutateAsync({
        tripId: trip.id,
        toDoIndex: BigInt(index),
      });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  return (
    <div>
      <SectionHeading emoji="✅" title="Travel To-Do List">
        <p className="text-sm">Keep track of tasks and preparations</p>
      </SectionHeading>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="todoTitle">Task Title *</Label>
                    <Input
                      id="todoTitle"
                      placeholder="e.g., Book flight tickets"
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="todoNotes">Notes</Label>
                    <Textarea
                      id="todoNotes"
                      placeholder="Additional details..."
                      value={newTodo.notes}
                      onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="todoDueDate">Due Date</Label>
                    <Input
                      id="todoDueDate"
                      type="date"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddTodo} className="w-full" disabled={addTodosMutation.isPending}>
                    {addTodosMutation.isPending ? 'Adding...' : 'Add Task'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map((todo, index) => {
                const actualIndex = trip.toDos.indexOf(todo);
                const dueDate = todo.dueDate ? new Date(Number(todo.dueDate) / 1_000_000) : null;
                const showOverdue = isOverdue(todo);
                const showDueToday = isDueToday(todo);

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      todo.completed ? 'bg-muted/50' : 'bg-card'
                    }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(actualIndex)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.title}
                        </span>
                        {showOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {showDueToday && (
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due Today
                          </Badge>
                        )}
                      </div>
                      {todo.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{todo.notes}</p>
                      )}
                      {dueDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {dueDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
