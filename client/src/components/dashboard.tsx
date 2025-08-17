import { Heart, Edit, Calendar } from "lucide-react";
import type { User } from "@shared/schema";
import BudgetSection from "./budget-section";
import VendorsSection from "./vendors-section";
import GuestsSection from "./guests-section";
import TimelineSection from "./timeline-section";
import ChecklistSection from "./checklist-section";
import InspirationSection from "./inspiration-section";
import WhopIntegration from "./whop-integration";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  user: User;
  onEditProfile: () => void;
}

export default function Dashboard({ user, onEditProfile }: DashboardProps) {
  const calculateDaysUntilEvent = () => {
    const eventDate = new Date(user.eventDate);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = calculateDaysUntilEvent();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-rose-soft/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-script text-4xl text-charcoal" data-testid="text-event-name">
                {user.eventName}
              </h1>
              <p className="text-gray-600 mt-1 font-script" data-testid="text-user-name">
                {user.name} • {user.eventType === 'other' && user.customEventType ? user.customEventType : user.eventType.charAt(0).toUpperCase() + user.eventType.slice(1)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={onEditProfile}
                className="bg-rose-soft text-white px-4 py-2 rounded-lg font-script hover:bg-rose-dusty transition-colors"
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <div className="text-right">
                <div className="font-script text-2xl text-charcoal" data-testid="text-days-until-event">
                  {daysUntil > 0 ? `${daysUntil} Days` : daysUntil === 0 ? 'Today!' : 'Event Passed'}
                </div>
                <div className="text-sm text-gray-600">Until your special day</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Budget Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <BudgetSection userId={user.id} initialBudget={parseFloat(user.budget)} />
          </div>

          {/* Timeline & Quick Stats */}
          <div className="space-y-8">
            <TimelineSection eventDate={user.eventDate} />
          </div>
        </div>

        {/* Secondary Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <VendorsSection userId={user.id} />
          <GuestsSection userId={user.id} />
          <ChecklistSection userId={user.id} />
        </div>

        {/* Whop Integration */}
        <div className="mt-8">
          <WhopIntegration userId={user.id} />
        </div>

        {/* Inspiration Board */}
        <div className="mt-8">
          <InspirationSection userId={user.id} />
        </div>
      </main>
    </div>
  );
}
