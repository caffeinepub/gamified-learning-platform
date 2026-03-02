import React from 'react';
import { useListLessons, useGetUser } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { AVATAR_OPTIONS } from '@/lib/gameData';
import { Trophy, Medal } from 'lucide-react';

// Since there's no listUsers endpoint, we show the current user's rank
// and display a mock leaderboard structure
const RANK_BADGES = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const RANK_COLORS = [
  'oklch(0.78 0.16 85)',
  'oklch(0.75 0.04 265)',
  'oklch(0.65 0.18 55)',
  'oklch(0.65 0.04 265)',
  'oklch(0.65 0.04 265)',
];

export default function LeaderboardPage() {
  const userId = loadUserId();
  const { data: user } = useGetUser(userId);

  const avatarOption = user
    ? AVATAR_OPTIONS.find((a) => a.id === user.avatarId) || AVATAR_OPTIONS[0]
    : AVATAR_OPTIONS[0];

  // Build a leaderboard with the current user + placeholder entries
  const currentUserEntry = user
    ? {
        id: user.id,
        username: user.username,
        level: Number(user.level),
        xp: Number(user.xp),
        avatarId: user.avatarId,
        isCurrentUser: true,
      }
    : null;

  // Placeholder leaderboard entries (in a real app, you'd fetch all users)
  const placeholderEntries = [
    { id: 'p1', username: 'DragonSlayer99', level: 15, xp: 14800, avatarId: 'knight', isCurrentUser: false },
    { id: 'p2', username: 'MathWizard', level: 12, xp: 11500, avatarId: 'wizard', isCurrentUser: false },
    { id: 'p3', username: 'WordSmith', level: 10, xp: 9200, avatarId: 'scientist', isCurrentUser: false },
    { id: 'p4', username: 'ForestArcher', level: 8, xp: 7600, avatarId: 'archer', isCurrentUser: false },
    { id: 'p5', username: 'StarLearner', level: 7, xp: 6300, avatarId: 'wizard', isCurrentUser: false },
    { id: 'p6', username: 'BraveKnight', level: 6, xp: 5100, avatarId: 'knight', isCurrentUser: false },
    { id: 'p7', username: 'CuriousMind', level: 5, xp: 4200, avatarId: 'scientist', isCurrentUser: false },
    { id: 'p8', username: 'QuizChamp', level: 4, xp: 3500, avatarId: 'archer', isCurrentUser: false },
    { id: 'p9', username: 'EpicLearner', level: 3, xp: 2800, avatarId: 'wizard', isCurrentUser: false },
  ];

  // Merge current user into leaderboard
  let entries = [...placeholderEntries];
  if (currentUserEntry) {
    // Remove placeholder if same username, then insert current user
    entries = entries.filter((e) => e.username !== currentUserEntry.username);
    entries.push(currentUserEntry);
  }

  // Sort by XP descending
  entries.sort((a, b) => b.xp - a.xp);
  const top10 = entries.slice(0, 10);
  const currentUserRank = currentUserEntry
    ? entries.findIndex((e) => e.isCurrentUser) + 1
    : null;

  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🏆 Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Top scholars of EduQuest Academy
        </p>
      </div>

      {/* Current user rank */}
      {currentUserEntry && currentUserRank && (
        <div
          className="rpg-card rpg-card-gold flex items-center gap-4 mb-6"
        >
          <div className="text-3xl">{RANK_BADGES[currentUserRank - 1] || `#${currentUserRank}`}</div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              background: 'oklch(0.22 0.06 265)',
              border: '2px solid oklch(0.78 0.16 85)',
            }}
          >
            <img
              src={avatarOption.image}
              alt={avatarOption.name}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-base" style={{ color: 'oklch(0.88 0.14 85)' }}>
              {currentUserEntry.username} (You)
            </p>
            <p className="text-xs font-body text-muted-foreground">
              Level {currentUserEntry.level} • {currentUserEntry.xp.toLocaleString()} XP
            </p>
          </div>
          <Trophy size={20} style={{ color: 'oklch(0.78 0.16 85)' }} />
        </div>
      )}

      {/* Top 10 list */}
      <div className="flex flex-col gap-2">
        {top10.map((entry, index) => {
          const rank = index + 1;
          const entryAvatar = AVATAR_OPTIONS.find((a) => a.id === entry.avatarId) || AVATAR_OPTIONS[0];
          const rankColor = RANK_COLORS[index] || 'oklch(0.65 0.04 265)';
          const isTop3 = rank <= 3;

          return (
            <div
              key={entry.id}
              className="rpg-card flex items-center gap-3 transition-all"
              style={
                entry.isCurrentUser
                  ? {
                      borderColor: 'oklch(0.78 0.16 85 / 0.6)',
                      background: 'oklch(0.2 0.05 85 / 0.15)',
                    }
                  : isTop3
                  ? { borderColor: `${rankColor}44` }
                  : {}
              }
            >
              {/* Rank */}
              <div
                className="w-8 text-center font-heading font-bold text-lg flex-shrink-0"
                style={{ color: rankColor }}
              >
                {RANK_BADGES[index] || `#${rank}`}
              </div>

              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  background: 'oklch(0.22 0.06 265)',
                  border: `2px solid ${isTop3 ? rankColor : 'oklch(0.35 0.05 265)'}`,
                }}
              >
                <img
                  src={entryAvatar.image}
                  alt={entryAvatar.name}
                  className="w-8 h-8 object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-heading font-bold text-sm truncate"
                  style={{
                    color: entry.isCurrentUser ? 'oklch(0.88 0.14 85)' : 'oklch(0.9 0.01 265)',
                  }}
                >
                  {entry.username}
                  {entry.isCurrentUser && (
                    <span
                      className="ml-1 text-xs font-body"
                      style={{ color: 'oklch(0.78 0.16 85)' }}
                    >
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-xs font-body text-muted-foreground">
                  Level {entry.level}
                </p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p
                  className="font-heading font-bold text-sm"
                  style={{ color: isTop3 ? rankColor : 'oklch(0.62 0.2 155)' }}
                >
                  {entry.xp.toLocaleString()}
                </p>
                <p className="text-[10px] font-body text-muted-foreground">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs font-body text-muted-foreground mt-6">
        Complete lessons and quests to climb the ranks! 🚀
      </p>
    </div>
  );
}
