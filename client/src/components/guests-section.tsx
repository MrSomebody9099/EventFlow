import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, User, Heart, X, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGuestSchema, type Guest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { z } from "zod";

type GuestFormData = z.infer<typeof insertGuestSchema>;

interface GuestsSectionProps {
  userId: string;
}

export default function GuestsSection({ userId }: GuestsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["/api/users", userId, "guests"],
  });

  const form = useForm<GuestFormData>({
    resolver: zodResolver(insertGuestSchema),
    defaultValues: {
      userId,
      name: "",
      count: 1,
      relationship: "",
      notes: "",
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      const response = await apiRequest("POST", "/api/guests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "guests"] });
      setIsModalOpen(false);
      form.reset({ userId, name: "", count: 1, relationship: "", notes: "" });
      toast({
        title: "Guest added",
        description: "Your guest has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error adding guest",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GuestFormData) => {
    addGuestMutation.mutate(data);
  };

  const totalGuestCount = guests.reduce((sum, guest) => sum + guest.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="font-script text-lg text-charcoal">Loading guests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-script text-2xl text-charcoal flex items-center">
            <Users className="text-rose-dusty mr-3" />
            Guests
          </h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-rose-soft text-white px-3 py-1 rounded-lg font-script text-sm hover:bg-rose-dusty transition-colors"
                data-testid="button-add-guest"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-script text-2xl text-charcoal">Add New Guest</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-add-guest">
                <div>
                  <Label className="font-script text-lg text-charcoal">Guest Name(s)</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g., John & Mary Smith"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-guest-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Number of People</Label>
                  <Input
                    {...form.register("count", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    placeholder="2"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-guest-count"
                  />
                  {form.formState.errors.count && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.count.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Relationship</Label>
                  <Input
                    {...form.register("relationship")}
                    placeholder="e.g., Family, Friends"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-guest-relationship"
                  />
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Notes (Optional)</Label>
                  <Input
                    {...form.register("notes")}
                    placeholder="Additional notes"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-guest-notes"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 font-script"
                    data-testid="button-cancel-guest"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addGuestMutation.isPending}
                    className="flex-1 bg-rose-soft text-white font-script hover:bg-rose-dusty transition-colors"
                    data-testid="button-submit-guest"
                  >
                    {addGuestMutation.isPending ? "Adding..." : "Add Guest"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Guest Count */}
        <div className="bg-beige rounded-lg p-3 mb-4 text-center">
          <div className="font-script text-lg text-gray-600">Total Guests</div>
          <div className="text-2xl font-semibold text-charcoal" data-testid="text-total-guests">
            {totalGuestCount}
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="list-guests">
          {guests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-script text-lg">No guests added yet</p>
              <p className="text-sm">Add your first guests to start planning your celebration</p>
            </div>
          ) : (
            guests.map((guest) => (
              <GuestRow key={guest.id} guest={guest} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GuestRow({ guest }: { guest: Guest }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof insertGuestSchema>>({
    resolver: zodResolver(insertGuestSchema.partial()),
    defaultValues: {
      userId: guest.userId,
      name: guest.name,
      count: guest.count,
      relationship: guest.relationship ?? "",
      notes: guest.notes ?? "",
    },
  });

  const updateGuest = useMutation({
    mutationFn: async (data: Partial<Guest>) => {
      const res = await apiRequest("PUT", `/api/guests/${guest.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", guest.userId, "guests"] });
      setIsEditing(false);
      toast({ title: "Updated", description: "Guest updated." });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/guests/${guest.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", guest.userId, "guests"] });
      toast({ title: "Deleted", description: "Guest removed." });
    },
  });

  if (!isEditing) {
    return (
      <div className="bg-beige rounded-lg p-3 flex justify-between items-start">
        <div>
          <div className="font-medium text-charcoal font-script flex items-center">
            <User className="w-4 h-4 mr-2" />
            {guest.name}
          </div>
          {guest.relationship && (
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Heart className="w-3 h-3 mr-1" />
              {guest.relationship}
            </div>
          )}
          {guest.notes && (
            <div className="text-xs text-gray-500 mt-1">{guest.notes}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-script text-rose-dusty font-semibold text-lg">
            {guest.count}
          </span>
          <Button size="icon" variant="outline" onClick={() => setIsEditing(true)} aria-label="Edit guest">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => deleteGuest.mutate()} aria-label="Delete guest">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit((data) => updateGuest.mutate(data))}
      className="bg-beige rounded-lg p-3 flex items-center gap-2"
    >
      <Input {...form.register("name")} placeholder="Name" className="h-8" />
      <Input {...form.register("count", { valueAsNumber: true })} type="number" min={1} className="h-8 w-20" />
      <Input {...form.register("relationship")} placeholder="Relationship" className="h-8" />
      <Input {...form.register("notes")} placeholder="Notes" className="h-8" />
      <div className="flex gap-2">
        <Button size="sm" type="submit">Save</Button>
        <Button size="sm" variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
      </div>
    </form>
  );
}
