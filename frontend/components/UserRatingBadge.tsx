"use client";
import { UserProfile } from "@/shared/api/profiles";

interface UserRatingBadgeProps {
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
  showLevel?: boolean;
  starsOnly?: boolean;
  showPointsToNext?: boolean;
}

export default function UserRatingBadge({ 
  profile, 
  size = 'sm', 
  showPoints = true,
  showLevel = true,
  starsOnly = false,
  showPointsToNext = false
}: UserRatingBadgeProps) {
  const getRatingLevel = (points: number) => {
    if (points >= 1000) return { level: 'Эксперт', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (points >= 500) return { level: 'Опытный', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (points >= 200) return { level: 'Продвинутый', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (points >= 50) return { level: 'Начинающий', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Новичок', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const getStarCount = (points: number) => {
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 200) return 3;
    if (points >= 50) return 2;
    return 1;
  };

  const getPointsToNextLevel = (points: number) => {
    if (points >= 1000) return 0; // Уже максимальный уровень
    if (points >= 500) return 1000 - points; // До Эксперта
    if (points >= 200) return 500 - points; // До Опытного
    if (points >= 50) return 200 - points; // До Продвинутого
    return 50 - points; // До Начинающего
  };

  const ratingInfo = getRatingLevel(profile.points);
  const starCount = getStarCount(profile.points);

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-xs',
      star: 'w-3 h-3',
      points: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5',
      text: 'text-sm',
      star: 'w-4 h-4',
      points: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2',
      text: 'text-base',
      star: 'w-5 h-5',
      points: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  if (starsOnly) {
    return (
      <div className="flex justify-center">
        {[...Array(starCount)].map((_, i) => (
          <svg 
            key={i}
            className={`${classes.star} text-yellow-400 fill-current`} 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${ratingInfo.bgColor} ${ratingInfo.color} rounded-full ${classes.container} relative overflow-hidden`}>
      {/* Анимированный фон */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      
      {/* Звездочки с анимацией */}
      <div className="flex relative z-10">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`${classes.star} transition-all duration-300 ${i < starCount ? 'fill-current animate-bounce' : 'text-gray-300'}`}
            style={{ animationDelay: `${i * 0.1}s` }}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      {/* Уровень с эффектом свечения */}
      {showLevel && (
        <span className={`font-medium ${classes.text} relative z-10 drop-shadow-sm`}>
          {ratingInfo.level}
        </span>
      )}
      
      {/* Очки с пульсацией */}
      {showPoints && (
        <span className={`${classes.points} opacity-75 relative z-10 animate-pulse`}>
          {showPointsToNext ? getPointsToNextLevel(profile.points) : profile.points}
        </span>
      )}
      
      {/* Прогресс-бар для следующего уровня */}
      {showPointsToNext && getPointsToNextLevel(profile.points) > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.min(100, (profile.points / (profile.points + getPointsToNextLevel(profile.points))) * 100)}%` 
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
