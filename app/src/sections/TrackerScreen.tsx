import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { moodOptions } from '@/data';
import type { MoodEntry } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useHaptics } from '@/hooks/useHaptics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function TrackerScreen() {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('df2b-mood-entries', []);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { mediumTap, success } = useHaptics();

  // Check if already checked in today
  const hasCheckedInToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return moodEntries.some((entry) => entry.date === today);
  }, [moodEntries]);

  // Get today's mood
  const todayMood = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return moodEntries.find((entry) => entry.date === today);
  }, [moodEntries]);

  // Calculate mood stats
  const moodStats = useMemo(() => {
    if (moodEntries.length === 0) return null;

    const last7Days = moodEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const average =
      last7Days.reduce((sum, entry) => sum + entry.mood, 0) / (last7Days.length || 1);

    return {
      last7Days,
      average: Math.round(average * 10) / 10,
      totalEntries: moodEntries.length,
    };
  }, [moodEntries]);

  // Get days for calendar
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: { date: number; mood?: MoodEntry; isToday: boolean }[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: 0, isToday: false });
    }

    // Days of the month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const mood = moodEntries.find((entry) => entry.date === dateStr);
      const isToday =
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({ date: i, mood, isToday });
    }

    return days;
  }, [currentMonth, moodEntries]);

  const handleMoodSelect = (moodValue: number) => {
    mediumTap();
    setSelectedMood(moodValue);
  };

  const handleMoodSubmit = () => {
    if (selectedMood === null) return;

    success();

    const today = new Date().toISOString().split('T')[0];
    const moodOption = moodOptions.find((m) => m.value === selectedMood);

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: today,
      mood: selectedMood,
      color: moodOption?.color || '#6B6558',
    };

    setMoodEntries((prev) => {
      const filtered = prev.filter((entry) => entry.date !== today);
      return [...filtered, newEntry];
    });

    setShowMoodDialog(false);
    setSelectedMood(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    mediumTap();
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
  ];

  const weekDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-df2b-text mb-2">
          Трекер стану
        </h1>
        <p className="text-df2b-text-secondary text-sm">
          Відстежуй свій емоційний стан
        </p>
      </header>

      {/* Today's Check-in */}
      {!hasCheckedInToday ? (
        <div className="bg-gradient-to-br from-df2b-accent/20 to-df2b-accent/5 rounded-2xl p-5 mb-6 border border-df2b-accent/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-df2b-accent/20 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-df2b-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-df2b-text mb-1">
                Як ти себе почуваєш сьогодні?
              </h3>
              <p className="text-df2b-text-secondary text-sm mb-3">
                Одне питання на день допомагає відстежувати динаміку
              </p>
              <button
                onClick={() => {
                  mediumTap();
                  setShowMoodDialog(true);
                }}
                className="df2b-button-primary text-sm"
              >
                Зробити чек-ін
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-df2b-bg-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${todayMood?.color}20` }}
            >
              <span className="text-2xl">
                {moodOptions.find((m) => m.value === todayMood?.mood)?.emoji}
              </span>
            </div>
            <div>
              <p className="text-df2b-text-secondary text-sm">Сьогодні</p>
              <p className="font-semibold text-df2b-text">
                {moodOptions.find((m) => m.value === todayMood?.mood)?.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {moodStats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-df2b-bg-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-df2b-accent" />
              <span className="text-df2b-text-secondary text-sm">
                Середнє (7 днів)
              </span>
            </div>
            <p className="text-2xl font-bold text-df2b-text">
              {moodStats.average}/5
            </p>
          </div>

          <div className="bg-df2b-bg-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-df2b-accent" />
              <span className="text-df2b-text-secondary text-sm">
                Всього записів
              </span>
            </div>
            <p className="text-2xl font-bold text-df2b-text">
              {moodStats.totalEntries}
            </p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-df2b-bg-card rounded-2xl p-5">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="w-8 h-8 rounded-full bg-df2b-bg-secondary flex items-center justify-center hover:bg-df2b-accent/20 transition-colors"
          >
            <ChevronLeft size={18} className="text-df2b-text-secondary" />
          </button>
          <h3 className="font-semibold text-df2b-text">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="w-8 h-8 rounded-full bg-df2b-bg-secondary flex items-center justify-center hover:bg-df2b-accent/20 transition-colors"
          >
            <ChevronRight size={18} className="text-df2b-text-secondary" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-df2b-text-muted py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                day.date === 0
                  ? ''
                  : day.isToday
                  ? 'ring-2 ring-df2b-accent'
                  : ''
              }`}
              style={
                day.mood
                  ? { backgroundColor: `${day.mood.color}30` }
                  : undefined
              }
            >
              {day.date > 0 && (
                <span
                  className={`${
                    day.isToday ? 'text-df2b-accent font-semibold' : 'text-df2b-text'
                  }`}
                >
                  {day.date}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-df2b-accent/10">
          {moodOptions.map((mood) => (
            <div key={mood.value} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: mood.color }}
              />
              <span className="text-xs text-df2b-text-muted">{mood.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Selection Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent className="bg-df2b-bg-card border-df2b-accent/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-df2b-text text-center">
              Як ти себе почуваєш?
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="flex justify-center gap-3 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    selectedMood === mood.value
                      ? 'ring-2 ring-df2b-accent scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor:
                      selectedMood === mood.value
                        ? `${mood.color}40`
                        : `${mood.color}20`,
                  }}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>

            {selectedMood !== null && (
              <p className="text-center text-df2b-text mb-6 animate-fade-in">
                {moodOptions.find((m) => m.value === selectedMood)?.label}
              </p>
            )}

            <button
              onClick={handleMoodSubmit}
              disabled={selectedMood === null}
              className="df2b-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Зберегти
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
