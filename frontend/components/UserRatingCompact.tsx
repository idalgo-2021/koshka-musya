"use client";
import { UserProfile } from "@/shared/api/profiles";

interface UserRatingCompactProps {
  profile: UserProfile;
  showLevel?: boolean;
}

export default function UserRatingCompact({ 
  profile, 
  showLevel = true 
}: UserRatingCompactProps) {
  const getRatingLevel = (points: number) => {
    if (points >= 1000) return { level: 'Эксперт', color: 'text-purple-600' };
    if (points >= 500) return { level: 'Опытный', color: 'text-blue-600' };
    if (points >= 200) return { level: 'Продвинутый', color: 'text-green-600' };
    if (points >= 50) return { level: 'Начинающий', color: 'text-yellow-600' };
    return { level: 'Новичок', color: 'text-gray-600' };
  };

  const getStarCount = (points: number) => {
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 200) return 3;
    if (points >= 50) return 2;
    return 1;
  };

  const ratingInfo = getRatingLevel(profile.points);
  const starCount = getStarCount(profile.points);

  return (
    <div className="flex items-center gap-1.5">
      {/* Звездочки */}
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-3 h-3 ${i < starCount ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      {/* Уровень */}
      {showLevel && (
        <span className={`text-xs font-medium ${ratingInfo.color}`}>
          {ratingInfo.level}
        </span>
      )}
      
      {/* Очки */}
      <span className="text-xs text-gray-500">
        {profile.points}
      </span>
    </div>
  );
}
