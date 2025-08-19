import { useState, useEffect } from "react";
import OnboardingForm from "@/components/onboarding-form";
import Dashboard from "@/components/dashboard";
import { getStoredUser } from "@/lib/storage";
import type { User } from "@shared/schema";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="font-script text-2xl text-charcoal">Loading EventFlow...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {!user || isEditing ? (
        <OnboardingForm
          onComplete={(u) => {
            setUser(u);
            setIsEditing(false);
          }}
          initialUser={isEditing ? user ?? undefined : undefined}
        />
      ) : (
        <Dashboard user={user} onEditProfile={() => setIsEditing(true)} />
      )}
    </div>
  );
}
