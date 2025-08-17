import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertUserSchema, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { storeUser } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { z } from "zod";

type OnboardingFormData = z.infer<typeof insertUserSchema>;

interface OnboardingFormProps {
  onComplete: (user: User) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      eventName: "",
      eventType: "",
      eventDate: "",
      partnerName: "",
      budget: "25000",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json() as Promise<User>;
    },
    onSuccess: (user) => {
      storeUser(user);
      onComplete(user);
      toast({
        title: "Welcome to your wedding planner!",
        description: "Your profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating profile",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    createUserMutation.mutate(data);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="font-script text-5xl text-charcoal mb-2" data-testid="onboarding-title">
              Welcome to EventFlow
            </h1>
            <p className="text-gray-600 text-lg">Let's start planning your perfect event</p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="onboarding-form">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="font-script text-xl text-charcoal">Your Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Enter your name"
                  className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label className="font-script text-xl text-charcoal">Email Address</Label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="font-script text-xl text-charcoal">Event Name</Label>
                <Input
                  {...form.register("eventName")}
                  placeholder="Our Wedding Day"
                  className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                  data-testid="input-event-name"
                />
                {form.formState.errors.eventName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.eventName.message}</p>
                )}
              </div>
              
              <div>
                <Label className="font-script text-xl text-charcoal">Event Type</Label>
                <Select onValueChange={(value) => form.setValue("eventType", value)}>
                  <SelectTrigger className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script" data-testid="select-event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="engagement">Engagement Party</SelectItem>
                    <SelectItem value="reception">Reception</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.eventType && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.eventType.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="font-script text-xl text-charcoal">Event Date</Label>
                <Input
                  {...form.register("eventDate")}
                  type="date"
                  className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                  data-testid="input-event-date"
                />
                {form.formState.errors.eventDate && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.eventDate.message}</p>
                )}
              </div>
              
              <div>
                <Label className="font-script text-xl text-charcoal">Partner's Name</Label>
                <Input
                  {...form.register("partnerName")}
                  placeholder="Partner's name"
                  className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                  data-testid="input-partner-name"
                />
              </div>
            </div>
            
            <div>
              <Label className="font-script text-xl text-charcoal">Total Budget ($)</Label>
              <Input
                {...form.register("budget")}
                type="number"
                placeholder="25000"
                className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                data-testid="input-budget"
              />
              {form.formState.errors.budget && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.budget.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-soft to-rose-dusty text-white py-4 px-6 rounded-xl font-script text-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              data-testid="button-submit-onboarding"
            >
              {isSubmitting ? "Creating your planner..." : "Begin Planning My Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
