
export function calculateStreak(checkIns: { createdAt: Date | number | string }[]) {
  if (!checkIns || checkIns.length === 0) return 0;
  
  // Sort check-ins by date descending
  const sorted = [...checkIns].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if the most recent check-in was today or yesterday
  const lastCheckIn = new Date(sorted[0].createdAt);
  lastCheckIn.setHours(0, 0, 0, 0);
  
  const diffInDays = Math.floor((currentDate.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays > 1) return 0; // Streak broken

  const uniqueDays = new Set<string>();
  
  for (let i = 0; i < sorted.length; i++) {
    const ciDate = new Date(sorted[i].createdAt);
    ciDate.setHours(0, 0, 0, 0);
    const dateStr = ciDate.toISOString().split('T')[0];

    if (uniqueDays.has(dateStr)) continue;

    if (uniqueDays.size === 0) {
      streak = 1;
      uniqueDays.add(dateStr);
      continue;
    }

    // Compare with the previous unique day added
    const lastDateArr = Array.from(uniqueDays);
    const lastDateStr = lastDateArr[lastDateArr.length - 1];
    const lastDate = new Date(lastDateStr);
    
    const diff = Math.floor((lastDate.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
      uniqueDays.add(dateStr);
    } else {
      break;
    }
  }
  
  return streak;
}

export type StreakMilestone = {
  days: number;
  label: string;
  color: string;
  icon: string;
};

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 30, label: 'ELITE', color: 'text-amber-400', icon: '👑' },
  { days: 14, label: 'GOLD', color: 'text-yellow-400', icon: '🏆' },
  { days: 7, label: 'SILVER', color: 'text-slate-300', icon: '🥈' },
  { days: 3, label: 'BRONZE', color: 'text-orange-400', icon: '🥉' },
];

export function getStreakMilestone(streak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find(m => streak >= m.days) || null;
}
