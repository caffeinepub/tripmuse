import { useState } from 'react';
import { TripPlan, EmergencyContact } from '../../backend';
import { useAddTripEmergencyInfo } from '../../hooks/useQueries';
import { generateEmergencyTemplates } from './emergencyTemplates';
import SectionHeading from '../../components/SectionHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencySectionProps {
  trip: TripPlan;
}

export default function EmergencySection({ trip }: EmergencySectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'Other' });
  const addEmergencyInfoMutation = useAddTripEmergencyInfo();

  const templates = generateEmergencyTemplates(trip.destination);
  const allContacts = trip.emergencyInfo.length > 0 ? trip.emergencyInfo : templates;

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const contactToAdd: EmergencyContact = {
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      type: newContact.type,
    };

    try {
      await addEmergencyInfoMutation.mutateAsync({
        tripId: trip.id,
        emergencyInfo: [...trip.emergencyInfo, contactToAdd],
      });
      setNewContact({ name: '', phone: '', type: 'Other' });
      setIsAddDialogOpen(false);
      toast.success('Emergency contact added');
    } catch (error) {
      toast.error('Failed to add contact');
    }
  };

  const handleDeleteContact = async (index: number) => {
    const updatedContacts = trip.emergencyInfo.filter((_, i) => i !== index);
    try {
      await addEmergencyInfoMutation.mutateAsync({
        tripId: trip.id,
        emergencyInfo: updatedContacts,
      });
      toast.success('Contact removed');
    } catch (error) {
      toast.error('Failed to remove contact');
    }
  };

  return (
    <div>
      <SectionHeading emoji="🚨" title="Emergency Information">
        <p className="text-sm">Important contacts for your safety</p>
      </SectionHeading>

      <Card className="border-destructive/50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Keep these contacts handy during your trip
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="e.g., Dr. Smith"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="e.g., +1-555-0123"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactType">Type</Label>
                    <Select value={newContact.type} onValueChange={(v) => setNewContact({ ...newContact, type: v })}>
                      <SelectTrigger id="contactType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Police">Police</SelectItem>
                        <SelectItem value="Embassy">Embassy</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddContact} className="w-full" disabled={addEmergencyInfoMutation.isPending}>
                    {addEmergencyInfoMutation.isPending ? 'Adding...' : 'Add Contact'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {allContacts.map((contact, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Phone className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.type}</p>
                      <p className="text-sm font-mono mt-1">{contact.phone}</p>
                    </div>
                    {trip.emergencyInfo.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteContact(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
