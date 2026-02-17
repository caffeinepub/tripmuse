import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success('Welcome to TripMuse!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">Welcome! 👋</DialogTitle>
          <DialogDescription className="text-base">
            Let's personalize your experience. What should we call you?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-11"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-11 shadow-sm" 
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
