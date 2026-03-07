export const AVATAR_OPTIONS = [
  {
    id: "wizard",
    name: "Young Wizard",
    description: "Master of spells and knowledge",
    image: "/assets/generated/avatar-wizard.dim_256x256.png",
    emoji: "🧙",
  },
  {
    id: "knight",
    name: "Brave Knight",
    description: "Courageous and strong warrior",
    image: "/assets/generated/avatar-knight.dim_256x256.png",
    emoji: "⚔️",
  },
  {
    id: "scientist",
    name: "Curious Scientist",
    description: "Explorer of science and math",
    image: "/assets/generated/avatar-scientist.dim_256x256.png",
    emoji: "🔬",
  },
  {
    id: "archer",
    name: "Nature Archer",
    description: "Swift and precise nature lover",
    image: "/assets/generated/avatar-archer.dim_256x256.png",
    emoji: "🏹",
  },
];

export const WORLD_THEMES: Record<
  string,
  { color: string; emoji: string; bgClass: string }
> = {
  world1: {
    color: "#22c55e",
    emoji: "🌲",
    bgClass: "from-emerald-900 to-emerald-700",
  },
  world2: {
    color: "#3b82f6",
    emoji: "🏙️",
    bgClass: "from-blue-900 to-blue-700",
  },
  world3: {
    color: "#f59e0b",
    emoji: "⛰️",
    bgClass: "from-amber-900 to-amber-700",
  },
  world4: {
    color: "#8b5cf6",
    emoji: "🏔️",
    bgClass: "from-purple-900 to-purple-700",
  },
  world5: { color: "#ef4444", emoji: "🌋", bgClass: "from-red-900 to-red-700" },
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  elementary: "Elementary",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
  mastery: "Mastery",
};

export const SUBJECT_LABELS: Record<string, string> = {
  math: "Math",
  english: "English",
};

export const STREAK_MILESTONES = [
  { days: 3, reward: "50 coins", icon: "🔥" },
  { days: 7, reward: "100 coins + 5 gems", icon: "⚡" },
  { days: 14, reward: "200 coins + 10 gems", icon: "💎" },
  { days: 30, reward: "500 coins + 25 gems", icon: "👑" },
];

export const SHOP_ITEMS = {
  hintPacks: [
    {
      id: "hint_5",
      name: "5 Hints",
      description: "Get 5 hints for tough questions",
      cost: 50,
      currency: "coins" as const,
      icon: "💡",
    },
    {
      id: "hint_15",
      name: "15 Hints",
      description: "Get 15 hints for tough questions",
      cost: 120,
      currency: "coins" as const,
      icon: "💡",
    },
    {
      id: "hint_30",
      name: "30 Hints",
      description: "Get 30 hints for tough questions",
      cost: 200,
      currency: "coins" as const,
      icon: "💡",
    },
  ],
  avatarCostumes: [
    {
      id: "costume_fire",
      name: "Fire Wizard",
      description: "Blazing wizard costume",
      cost: 20,
      currency: "gems" as const,
      icon: "🔥",
    },
    {
      id: "costume_ice",
      name: "Ice Knight",
      description: "Frozen knight armor",
      cost: 20,
      currency: "gems" as const,
      icon: "❄️",
    },
    {
      id: "costume_nature",
      name: "Nature Spirit",
      description: "Forest spirit outfit",
      cost: 25,
      currency: "gems" as const,
      icon: "🌿",
    },
  ],
  worldSkins: [
    {
      id: "skin_night",
      name: "Night Mode",
      description: "Dark theme for all worlds",
      cost: 30,
      currency: "gems" as const,
      icon: "🌙",
    },
    {
      id: "skin_rainbow",
      name: "Rainbow World",
      description: "Colorful world skin",
      cost: 35,
      currency: "gems" as const,
      icon: "🌈",
    },
    {
      id: "skin_pixel",
      name: "Pixel Art",
      description: "Retro pixel art style",
      cost: 40,
      currency: "gems" as const,
      icon: "🎮",
    },
  ],
};

export function getLevelFromXP(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 800) return 4;
  if (xp < 1200) return 5;
  if (xp < 1700) return 6;
  if (xp < 2300) return 7;
  if (xp < 3000) return 8;
  if (xp < 4000) return 9;
  return Math.floor(xp / 500) + 1;
}

export function getXPProgress(xp: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];
  const level = getLevelFromXP(xp);
  const currentThreshold =
    thresholds[Math.min(level - 1, thresholds.length - 1)] || 0;
  const nextThreshold =
    thresholds[Math.min(level, thresholds.length - 1)] ||
    currentThreshold + 500;
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return {
    current,
    needed,
    percentage: Math.min(100, Math.round((current / needed) * 100)),
  };
}

export function getQuestionsForLesson(
  worldId: string,
): Array<{ question: string; options: string[]; correct: number }> {
  const questions: Record<
    string,
    Array<{ question: string; options: string[]; correct: number }>
  > = {
    world1: [
      {
        question: "What letter comes after A?",
        options: ["B", "C", "D", "E"],
        correct: 0,
      },
      {
        question: 'Which word starts with the letter "C"?',
        options: ["Dog", "Cat", "Bird", "Fish"],
        correct: 1,
      },
    ],
    world2: [
      {
        question: "Which sentence is correct?",
        options: [
          "I goes to school",
          "I go to school",
          "I going to school",
          "I gone to school",
        ],
        correct: 1,
      },
      {
        question: 'What is the plural of "child"?',
        options: ["Childs", "Childes", "Children", "Childrens"],
        correct: 2,
      },
    ],
    world3: [
      {
        question: "What is 5 + 3?",
        options: ["7", "8", "9", "10"],
        correct: 1,
      },
      {
        question: "What is 10 - 4?",
        options: ["5", "6", "7", "8"],
        correct: 1,
      },
    ],
    world4: [
      {
        question: "Solve: x + 5 = 10",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correct: 2,
      },
      {
        question: "What is 3x when x = 4?",
        options: ["7", "10", "12", "14"],
        correct: 2,
      },
    ],
    world5: [
      {
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correct: 2,
      },
      {
        question: "Solve: 2x² = 8",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        correct: 1,
      },
    ],
  };
  return questions[worldId] || questions.world1;
}
