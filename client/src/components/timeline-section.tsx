import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineSectionProps {
  eventDate: string;
}

export default function TimelineSection({ eventDate }: TimelineSectionProps) {
  const calculateDaysUntilEvent = () => {
    const event = new Date(eventDate);
    const today = new Date();
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateCalendar = () => {
    const event = new Date(eventDate);
    const year = event.getFullYear();
    const month = event.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { days, eventDay: event.getDate(), month: event.getMonth(), year };
  };

  const daysUntil = calculateDaysUntilEvent();
  const { days, eventDay, month, year } = generateCalendar();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-script text-3xl text-charcoal flex items-center mb-6">
          <Calendar className="text-rose-dusty mr-3" />
          Timeline
        </h2>
        
        {/* Countdown */}
        <div className="bg-beige rounded-xl p-4 mb-6 text-center">
          <div className="font-script text-xl text-gray-600 mb-1">Days Until Event</div>
          <div className="text-3xl font-semibold text-charcoal" data-testid="text-countdown">
            {daysUntil > 0 ? daysUntil : daysUntil === 0 ? "Today!" : "Past"}
          </div>
        </div>
        
        {/* Mini Calendar */}
        <div className="bg-beige rounded-xl p-4">
          <div className="text-center mb-4">
            <div className="font-script text-xl text-charcoal">
              {monthNames[month]} {year}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-gray-600 py-2 font-script">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => {
              const isEventDay = day.getDate() === eventDay && day.getMonth() === month;
              const isCurrentMonth = day.getMonth() === month;
              
              return (
                <div
                  key={index}
                  className={`
                    py-2 text-sm font-script cursor-pointer transition-colors
                    ${isEventDay 
                      ? 'bg-gradient-to-br from-rose-soft to-rose-dusty text-white rounded font-bold' 
                      : isCurrentMonth 
                        ? 'text-charcoal hover:bg-rose-soft hover:text-white rounded' 
                        : 'text-gray-300'
                    }
                  `}
                  data-testid={isEventDay ? "calendar-event-day" : "calendar-day"}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
