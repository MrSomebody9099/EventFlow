import { useState, useEffect } from "react";
import OnboardingForm from "@/components/onboarding-form";
import Dashboard from "@/components/dashboard";
import { getStoredUser, storeUser, clearStoredUser } from "@/lib/storage";
import { localApi } from "@/lib/localApi";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { User } from "@shared/schema";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [events, setEvents] = useState<User[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const all = await localApi.listUsers();
        setEvents(all);
      } catch {
        setEvents([]);
      }
    })();
  }, []);

  // Ensure the currently opened event is also present in the sidebar list and persisted
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        await localApi.upsertUser(user);
      } catch {}
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === user.id);
        return exists ? prev.map((e) => (e.id === user.id ? user : e)) : [user, ...prev];
      });
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="font-script text-2xl text-charcoal">Loading EventFlow...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top-left hamburger to open sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Your Events</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600">Select an event to open</div>
            <Button size="sm" onClick={() => { setIsCreating(true); setIsSidebarOpen(false); }}>
              <Plus className="w-4 h-4" />
              <span className="ml-1">New</span>
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {events.length === 0 && (
              <div className="text-sm text-neutral-500">No events yet. Click New to create one.</div>
            )}
            {events.map((ev) => (
              <div
                key={ev.id}
                className={`w-full px-3 py-2 rounded-md border flex items-start gap-2 ${
                  user?.id === ev.id ? "border-neutral-800 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => {
                    setUser(ev);
                    storeUser(ev);
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="font-medium flex items-center justify-between">
                    <span>{ev.eventName}</span>
                    {user?.id === ev.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-white">Current</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">{ev.name}{ev.eventDate ? ` • ${ev.eventDate}` : ""}</div>
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete event">
                      ×
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{ev.eventName}"? This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={async () => {
                          await localApi.deleteUser(ev.id);
                          setEvents((prev) => prev.filter((e) => e.id !== ev.id));
                          if (user?.id === ev.id) {
                            setUser(null);
                            clearStoredUser();
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {isCreating && (
        <OnboardingForm
          onComplete={async (u) => {
            try {
              await localApi.upsertUser(u);
            } catch {}
            setEvents((prev) => {
              const exists = prev.some((e) => e.id === u.id);
              return exists ? prev.map((e) => (e.id === u.id ? u : e)) : [u, ...prev];
            });
            setUser(u);
            setIsCreating(false);
            setIsSidebarOpen(false);
          }}
        />
      )}
      {!user || isEditing ? (
        <OnboardingForm
          onComplete={(u) => {
            setUser(u);
            setIsEditing(false);
            // Ensure event appears in the sidebar list as well
            localApi.upsertUser(u).then(() =>
              setEvents((prev) => {
                const exists = prev.some((e) => e.id === u.id);
                return exists ? prev.map((e) => (e.id === u.id ? u : e)) : [u, ...prev];
              })
            ).catch(() => {});
          }}
          initialUser={isEditing ? user ?? undefined : undefined}
        />
      ) : (
        <Dashboard user={user} onEditProfile={() => setIsEditing(true)} />
      )}
    </div>
  );
}
