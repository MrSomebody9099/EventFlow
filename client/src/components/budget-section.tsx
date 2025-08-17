import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type Expense } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { z } from "zod";

type ExpenseFormData = z.infer<typeof insertExpenseSchema>;

interface BudgetSectionProps {
  userId: string;
  initialBudget: number;
}

export default function BudgetSection({ userId, initialBudget }: BudgetSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/users", userId, "expenses"],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      userId,
      name: "",
      amount: "",
      category: "",
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "expenses"] });
      setIsModalOpen(false);
      form.reset({ userId, name: "", amount: "", category: "" });
      toast({
        title: "Expense added",
        description: "Your expense has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error adding expense",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    addExpenseMutation.mutate(data);
  };

  const usedBudget = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remainingBudget = initialBudget - usedBudget;
  const isOverBudget = remainingBudget < 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="font-script text-2xl text-charcoal">Loading budget...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-script text-3xl text-charcoal flex items-center">
            <DollarSign className="text-rose-dusty mr-3" />
            Budget Tracker
          </h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-rose-soft text-white px-4 py-2 rounded-lg font-script hover:bg-rose-dusty transition-colors"
                data-testid="button-add-expense"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-script text-2xl text-charcoal">Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-add-expense">
                <div>
                  <Label className="font-script text-lg text-charcoal">Expense Name</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g., Wedding Venue"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-expense-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Amount ($)</Label>
                  <Input
                    {...form.register("amount")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-expense-amount"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Category (Optional)</Label>
                  <Input
                    {...form.register("category")}
                    placeholder="e.g., Venue, Catering"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-expense-category"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 font-script"
                    data-testid="button-cancel-expense"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addExpenseMutation.isPending}
                    className="flex-1 bg-rose-soft text-white font-script hover:bg-rose-dusty transition-colors"
                    data-testid="button-submit-expense"
                  >
                    {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-beige rounded-xl p-4 text-center">
            <div className="font-script text-xl text-gray-600 mb-1">Initial Budget</div>
            <div className="text-2xl font-semibold text-charcoal" data-testid="text-initial-budget">
              ${initialBudget.toLocaleString()}
            </div>
          </div>
          <div className="bg-beige rounded-xl p-4 text-center">
            <div className="font-script text-xl text-gray-600 mb-1">Used Budget</div>
            <div className="text-2xl font-semibold text-coral" data-testid="text-used-budget">
              ${usedBudget.toLocaleString()}
            </div>
          </div>
          <div className="bg-beige rounded-xl p-4 text-center">
            <div className="font-script text-xl text-gray-600 mb-1">Remaining</div>
            <div 
              className={`text-2xl font-semibold ${isOverBudget ? 'text-red-500' : 'text-sage'}`}
              data-testid="text-remaining-budget"
            >
              {isOverBudget ? '-' : ''}${Math.abs(remainingBudget).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <h3 className="font-script text-xl text-charcoal mb-4">Recent Expenses</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto" data-testid="list-expenses">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-script text-lg">No expenses recorded yet</p>
                <p className="text-sm">Add your first expense to start tracking your budget</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-beige rounded-lg">
                  <div>
                    <span className="font-medium font-script">{expense.name}</span>
                    {expense.category && <span className="text-sm text-gray-600 ml-2">({expense.category})</span>}
                    <span className="text-sm text-gray-600 ml-2">
                      {new Date(expense.date!).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-coral font-semibold font-script">
                    ${parseFloat(expense.amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
