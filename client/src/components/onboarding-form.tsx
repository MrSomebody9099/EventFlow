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
  initialUser?: User;
}

export default function OnboardingForm({ onComplete, initialUser }: OnboardingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomEventType, setShowCustomEventType] = useState(initialUser?.eventType === "other" ?? false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(insertUserSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialUser
      ? {
          name: initialUser.name,
          email: initialUser.email ?? "",
          eventName: initialUser.eventName,
          eventType: initialUser.eventType,
          customEventType: initialUser.customEventType ?? "",
          eventDate: initialUser.eventDate,
          partnerName: initialUser.partnerName ?? "",
          budget: String(initialUser.budget),
        }
      : {
          name: "",
          email: "",
          eventName: "",
          eventType: "birthday",
          customEventType: "",
          eventDate: "",
          partnerName: "",
          budget: "25000",
        },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: OnboardingFormData) => {
      const method = initialUser ? "PUT" : "POST";
      const url = initialUser ? `/api/users/${initialUser.id}` : "/api/users";
      // Force JSON Accept to avoid Vercel 404 fallback html
      const response = await apiRequest(method, url, userData);
      return response.json() as Promise<User>;
    },
    onSuccess: (user) => {
      storeUser(user);
      onComplete(user);
      toast({
        title: "Welcome to EventFlow!",
        description: "Your event profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating profile",
        description: (error as Error)?.message ?? "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await createUserMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Offline/local fallback: create a local profile without calling the API
      const localUser: User = {
        id: `local-${Math.random().toString(36).slice(2)}`,
        name: "Guest",
        email: "",
        eventName: "My Event",
        eventType: "birthday",
        customEventType: "",
        eventDate: calculateDefaultDate(),
        partnerName: "",
        budget: "0",
        createdAt: new Date(),
      } as unknown as User;
      storeUser(localUser);
      onComplete(localUser);
      toast({ title: "Profile skipped", description: "You can fill details later from Edit Profile." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (!initialUser && e.currentTarget === e.target) handleSkip();
      }}
    >
      <Card className="w-full max-w-lg md:max-w-2xl">
        <CardContent className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-5xl text-neutral-900 mb-2" data-testid="onboarding-title">
              {initialUser ? "Edit Profile" : "Welcome to EventFlow"}
            </h1>
            <p className="text-neutral-600 text-base md:text-lg">
              {initialUser ? "Update your event details" : "Let's start planning your event"}
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit, () =>
              toast({
                title: "Fill required info to continue",
                description: "Please complete all required fields.",
                variant: "destructive",
              })
            )}
            className="space-y-5 md:space-y-6"
            data-testid="onboarding-form"
          >
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-sm text-neutral-800">Your Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Enter your name"
                  className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm text-neutral-800">Email Address (Optional)</Label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-sm text-neutral-800">Event Name</Label>
                <Input
                  {...form.register("eventName")}
                  placeholder="Birthday Party"
                  className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                  data-testid="input-event-name"
                />
                {form.formState.errors.eventName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.eventName.message}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm text-neutral-800">Event Type</Label>
                <Select defaultValue={form.getValues("eventType")} onValueChange={(value) => {
                  form.setValue("eventType", value);
                  setShowCustomEventType(value === "other");
                  if (value !== "other") {
                    form.setValue("customEventType", "");
                  }
                }}>
                  <SelectTrigger className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500" data-testid="select-event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="engagement">Engagement Party</SelectItem>
                    <SelectItem value="reception">Reception</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.eventType && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.eventType.message}</p>
                )}
                {showCustomEventType && (
                  <div className="mt-4">
                    <Input
                      {...form.register("customEventType")}
                      placeholder="Enter your event type"
                      className="p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                      data-testid="input-custom-event-type"
                    />
                    {form.formState.errors.customEventType && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.customEventType.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-sm text-neutral-800">Event Date</Label>
                <Input
                  {...form.register("eventDate")}
                  type="date"
                  className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                  data-testid="input-event-date"
                />
                {form.formState.errors.eventDate && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.eventDate.message}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm text-neutral-800">Partner's Name (Optional)</Label>
                <Input
                  {...form.register("partnerName")}
                  placeholder="Partner's name"
                  className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                  data-testid="input-partner-name"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-neutral-800">Total Budget ($)</Label>
              <Input
                {...form.register("budget")}
                type="number"
                placeholder="25000"
                className="mt-2 p-3 border border-neutral-300 rounded-lg focus:border-neutral-500"
                data-testid="input-budget"
              />
              {form.formState.errors.budget && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.budget.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 px-5 rounded-lg text-lg transition-colors"
              data-testid="button-submit-onboarding"
            >
              {isSubmitting
                ? initialUser ? "Saving..." : "Creating your planner..."
                : initialUser ? "Save Changes" : "Begin Planning My Event"}
            </Button>

            {!initialUser && (
              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-sm text-neutral-600 hover:text-neutral-800"
              >
                Skip for now — I’ll fill this out later
              </button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
