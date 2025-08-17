import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Briefcase, Phone, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVendorSchema, type Vendor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { z } from "zod";

type VendorFormData = z.infer<typeof insertVendorSchema>;

interface VendorsSectionProps {
  userId: string;
}

export default function VendorsSection({ userId }: VendorsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/users", userId, "vendors"],
  });

  const form = useForm<VendorFormData>({
    resolver: zodResolver(insertVendorSchema),
    defaultValues: {
      userId,
      name: "",
      contact: "",
      serviceType: "",
      notes: "",
    },
  });

  const addVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const response = await apiRequest("POST", "/api/vendors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "vendors"] });
      setIsModalOpen(false);
      form.reset({ userId, name: "", contact: "", serviceType: "", notes: "" });
      toast({
        title: "Vendor added",
        description: "Your vendor has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error adding vendor",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorFormData) => {
    addVendorMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="font-script text-lg text-charcoal">Loading vendors...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-script text-2xl text-charcoal flex items-center">
            <Briefcase className="text-rose-dusty mr-3" />
            Vendors
          </h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-rose-soft text-white px-3 py-1 rounded-lg font-script text-sm hover:bg-rose-dusty transition-colors"
                data-testid="button-add-vendor"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-script text-2xl text-charcoal">Add New Vendor</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-add-vendor">
                <div>
                  <Label className="font-script text-lg text-charcoal">Vendor Name</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g., Elegant Flowers Co."
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-vendor-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Contact Number</Label>
                  <Input
                    {...form.register("contact")}
                    placeholder="(555) 123-4567"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-vendor-contact"
                  />
                  {form.formState.errors.contact && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.contact.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Service Type</Label>
                  <Input
                    {...form.register("serviceType")}
                    placeholder="e.g., Florist, Photographer"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-vendor-service-type"
                  />
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Notes (Optional)</Label>
                  <Input
                    {...form.register("notes")}
                    placeholder="Additional notes"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-vendor-notes"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 font-script"
                    data-testid="button-cancel-vendor"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addVendorMutation.isPending}
                    className="flex-1 bg-rose-soft text-white font-script hover:bg-rose-dusty transition-colors"
                    data-testid="button-submit-vendor"
                  >
                    {addVendorMutation.isPending ? "Adding..." : "Add Vendor"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3" data-testid="list-vendors">
          {vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-script text-lg">No vendors added yet</p>
              <p className="text-sm">Add your first vendor to start organizing your team</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.id} className="bg-beige rounded-lg p-3">
                <div className="font-medium text-charcoal font-script flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {vendor.name}
                </div>
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Phone className="w-3 h-3 mr-1" />
                  {vendor.contact}
                </div>
                {vendor.serviceType && (
                  <div className="text-xs text-rose-dusty flex items-center mt-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {vendor.serviceType}
                  </div>
                )}
                {vendor.notes && (
                  <div className="text-xs text-gray-500 mt-1">{vendor.notes}</div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
