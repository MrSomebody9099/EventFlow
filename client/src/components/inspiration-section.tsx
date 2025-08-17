import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Palette, Image as ImageIcon, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInspirationSchema, type Inspiration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { z } from "zod";

type InspirationFormData = z.infer<typeof insertInspirationSchema>;

interface InspirationSectionProps {
  userId: string;
}

export default function InspirationSection({ userId }: InspirationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspirations = [], isLoading } = useQuery<Inspiration[]>({
    queryKey: ["/api/users", userId, "inspirations"],
  });

  const form = useForm<InspirationFormData>({
    resolver: zodResolver(insertInspirationSchema),
    defaultValues: {
      userId,
      title: "",
      description: "",
      imageUrl: "",
      category: "",
    },
  });

  const addInspirationMutation = useMutation({
    mutationFn: async (data: InspirationFormData) => {
      const response = await apiRequest("POST", "/api/inspirations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "inspirations"] });
      setIsModalOpen(false);
      form.reset({ userId, title: "", description: "", imageUrl: "", category: "" });
      toast({
        title: "Inspiration added",
        description: "Your inspiration has been added to the board.",
      });
    },
    onError: () => {
      toast({
        title: "Error adding inspiration",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteInspirationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inspirations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "inspirations"] });
      toast({
        title: "Inspiration deleted",
        description: "The inspiration has been removed from your board.",
      });
    },
  });

  const onSubmit = (data: InspirationFormData) => {
    addInspirationMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteInspirationMutation.mutate(id);
  };

  // Sample inspiration images for empty state
  const sampleImages = [
    {
      url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Wedding ceremony with white flowers and elegant draping"
    },
    {
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Romantic candlelit dinner table setting"
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Beautiful wedding bouquet"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="font-script text-lg text-charcoal">Loading inspiration board...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-script text-3xl text-charcoal flex items-center">
            <Palette className="text-rose-dusty mr-3" />
            Inspiration Board
          </h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-rose-soft text-white px-4 py-2 rounded-lg font-script hover:bg-rose-dusty transition-colors"
                data-testid="button-add-inspiration"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Inspiration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-script text-2xl text-charcoal">Add New Inspiration</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-add-inspiration">
                <div>
                  <Label className="font-script text-lg text-charcoal">Title</Label>
                  <Input
                    {...form.register("title")}
                    placeholder="e.g., Perfect Ceremony Setup"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-inspiration-title"
                  />
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Image URL</Label>
                  <Input
                    {...form.register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-inspiration-url"
                  />
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Category</Label>
                  <Input
                    {...form.register("category")}
                    placeholder="e.g., Flowers, Venue, Decor"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-inspiration-category"
                  />
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Description</Label>
                  <Textarea
                    {...form.register("description")}
                    placeholder="Describe what you love about this inspiration..."
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="textarea-inspiration-description"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 font-script"
                    data-testid="button-cancel-inspiration"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addInspirationMutation.isPending}
                    className="flex-1 bg-rose-soft text-white font-script hover:bg-rose-dusty transition-colors"
                    data-testid="button-submit-inspiration"
                  >
                    {addInspirationMutation.isPending ? "Adding..." : "Add Inspiration"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="grid-inspirations">
          {inspirations.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-script text-xl mb-2">No inspirations yet</p>
              <p className="text-sm mb-6">Start collecting ideas for your perfect day</p>
              
              {/* Sample inspiration images */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {sampleImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-lg shadow-md opacity-50"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                      <p className="text-white text-xs text-center px-2 font-script">
                        Sample inspiration
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            inspirations.map((inspiration) => (
              <div key={inspiration.id} className="relative group cursor-pointer">
                {inspiration.imageUrl ? (
                  <img
                    src={inspiration.imageUrl}
                    alt={inspiration.title || "Inspiration"}
                    className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                
                {/* Fallback for broken/missing images */}
                <div className={`w-full h-32 bg-beige rounded-lg shadow-md flex items-center justify-center ${inspiration.imageUrl ? 'hidden' : ''}`}>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(inspiration.id)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                    data-testid={`button-delete-inspiration-${inspiration.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Title/Description */}
                {(inspiration.title || inspiration.category) && (
                  <div className="mt-2">
                    {inspiration.title && (
                      <p className="font-script text-sm font-medium text-charcoal truncate">
                        {inspiration.title}
                      </p>
                    )}
                    {inspiration.category && (
                      <p className="text-xs text-rose-dusty">{inspiration.category}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
