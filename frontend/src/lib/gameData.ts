import { Subject, Difficulty } from '../backend';

// Local question data for lessons (since backend stores lesson metadata, questions are client-side)
export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
  hint: string;
}

export interface LocalLesson {
  worldId: string;
  subject: Subject;
  title: string;
  difficulty: Difficulty;
  questions: Question[];
  isBossBattle: boolean;
}

// World theme data
export const WORLD_THEMES: Record<string, { emoji: string; color: string; bgGradient: string; zone: string }> = {
  'Enchanted Forest': { emoji: '🌲', color: '#22c55e', bgGradient: 'from-green-900 to-emerald-800', zone: 'forest' },
  'Volcanic Mountain': { emoji: '🌋', color: '#ef4444', bgGradient: 'from-red-900 to-orange-800', zone: 'volcano' },
  'Deep Ocean': { emoji: '🌊', color: '#06b6d4', bgGradient: 'from-cyan-900 to-blue-800', zone: 'ocean' },
  'Sky Kingdom': { emoji: '☁️', color: '#f59e0b', bgGradient: 'from-yellow-700 to-sky-600', zone: 'sky' },
  'Frozen Tundra': { emoji: '❄️', color: '#93c5fd', bgGradient: 'from-blue-900 to-indigo-800', zone: 'tundra' },
  'Cosmic Void': { emoji: '🌌', color: '#a855f7', bgGradient: 'from-purple-900 to-violet-900', zone: 'cosmic' },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.beginner]: 'Beginner',
  [Difficulty.elementary]: 'Elementary',
  [Difficulty.intermediate]: 'Intermediate',
  [Difficulty.advanced]: 'Advanced',
  [Difficulty.expert]: 'Expert',
  [Difficulty.mastery]: 'Mastery',
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  [Subject.math]: '🔢 Math',
  [Subject.english]: '📚 English',
};

// Sample questions per difficulty/subject
export const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  [`${Subject.math}_${Difficulty.beginner}`]: [
    { id: 'q1', text: 'What is 3 + 4?', type: 'multiple-choice', options: ['5', '6', '7', '8'], correctAnswer: '7', hint: 'Count on your fingers: 3, then 4 more!' },
    { id: 'q2', text: 'What is 10 - 3?', type: 'multiple-choice', options: ['6', '7', '8', '9'], correctAnswer: '7', hint: 'Start at 10 and count back 3 steps.' },
    { id: 'q3', text: 'What is 2 × 5?', type: 'multiple-choice', options: ['8', '9', '10', '11'], correctAnswer: '10', hint: 'Count by 2s five times: 2, 4, 6, 8, 10!' },
    { id: 'q4', text: 'Fill in the blank: 5 + ___ = 9', type: 'fill-blank', correctAnswer: '4', hint: 'What number added to 5 makes 9?' },
    { id: 'q5', text: 'What is 15 ÷ 3?', type: 'multiple-choice', options: ['3', '4', '5', '6'], correctAnswer: '5', hint: 'How many groups of 3 fit in 15?' },
  ],
  [`${Subject.math}_${Difficulty.elementary}`]: [
    { id: 'q1', text: 'What is 1/2 + 1/4?', type: 'multiple-choice', options: ['1/4', '2/6', '3/4', '1/3'], correctAnswer: '3/4', hint: 'Convert 1/2 to 2/4, then add!' },
    { id: 'q2', text: 'What is 0.5 × 4?', type: 'multiple-choice', options: ['1', '2', '3', '4'], correctAnswer: '2', hint: '0.5 is the same as 1/2.' },
    { id: 'q3', text: 'What is 25% of 80?', type: 'multiple-choice', options: ['15', '20', '25', '30'], correctAnswer: '20', hint: '25% = 1/4. Divide 80 by 4.' },
    { id: 'q4', text: 'Fill in: 3/6 = ___/2', type: 'fill-blank', correctAnswer: '1', hint: 'Simplify 3/6 to its lowest form.' },
    { id: 'q5', text: 'What is 12.5 + 7.5?', type: 'multiple-choice', options: ['18', '19', '20', '21'], correctAnswer: '20', hint: 'Add the whole parts and decimal parts separately.' },
  ],
  [`${Subject.math}_${Difficulty.intermediate}`]: [
    { id: 'q1', text: 'Solve: 2x + 5 = 13', type: 'multiple-choice', options: ['3', '4', '5', '6'], correctAnswer: '4', hint: 'Subtract 5 from both sides, then divide by 2.' },
    { id: 'q2', text: 'What is the slope of y = 3x + 2?', type: 'multiple-choice', options: ['2', '3', '5', '6'], correctAnswer: '3', hint: 'In y = mx + b, m is the slope.' },
    { id: 'q3', text: 'Simplify: 3x + 2x - x', type: 'multiple-choice', options: ['3x', '4x', '5x', '6x'], correctAnswer: '4x', hint: 'Combine like terms: 3 + 2 - 1 = ?' },
    { id: 'q4', text: 'Fill in: x² - 9 = (x+3)(x-___)', type: 'fill-blank', correctAnswer: '3', hint: 'This is a difference of squares pattern.' },
    { id: 'q5', text: 'What is the area of a triangle with base 6 and height 4?', type: 'multiple-choice', options: ['10', '12', '14', '24'], correctAnswer: '12', hint: 'Area = (1/2) × base × height' },
  ],
  [`${Subject.math}_${Difficulty.advanced}`]: [
    { id: 'q1', text: 'What is sin(90°)?', type: 'multiple-choice', options: ['0', '0.5', '1', '√2/2'], correctAnswer: '1', hint: 'Think of the unit circle at 90 degrees.' },
    { id: 'q2', text: 'Solve: x² - 5x + 6 = 0', type: 'multiple-choice', options: ['x=1,6', 'x=2,3', 'x=3,4', 'x=1,5'], correctAnswer: 'x=2,3', hint: 'Factor: find two numbers that multiply to 6 and add to -5.' },
    { id: 'q3', text: 'What is log₂(8)?', type: 'multiple-choice', options: ['2', '3', '4', '8'], correctAnswer: '3', hint: '2 to what power equals 8?' },
    { id: 'q4', text: 'Fill in: The derivative of x³ is ___x²', type: 'fill-blank', correctAnswer: '3', hint: 'Use the power rule: bring down the exponent.' },
    { id: 'q5', text: 'What is the sum of interior angles of a hexagon?', type: 'multiple-choice', options: ['540°', '620°', '720°', '900°'], correctAnswer: '720°', hint: 'Formula: (n-2) × 180°, where n = number of sides.' },
  ],
  [`${Subject.english}_${Difficulty.beginner}`]: [
    { id: 'q1', text: 'Which word rhymes with "cat"?', type: 'multiple-choice', options: ['dog', 'bat', 'cup', 'sun'], correctAnswer: 'bat', hint: 'Listen for the "-at" sound at the end.' },
    { id: 'q2', text: 'What letter comes after "D" in the alphabet?', type: 'multiple-choice', options: ['C', 'E', 'F', 'G'], correctAnswer: 'E', hint: 'Sing the alphabet song: A, B, C, D...' },
    { id: 'q3', text: 'Which word is a noun?', type: 'multiple-choice', options: ['run', 'happy', 'apple', 'quickly'], correctAnswer: 'apple', hint: 'A noun is a person, place, or thing.' },
    { id: 'q4', text: 'Fill in: The ___ is shining. (sun/run)', type: 'fill-blank', correctAnswer: 'sun', hint: 'What shines in the sky during the day?' },
    { id: 'q5', text: 'How many syllables in "butterfly"?', type: 'multiple-choice', options: ['1', '2', '3', '4'], correctAnswer: '3', hint: 'Clap it out: but-ter-fly.' },
  ],
  [`${Subject.english}_${Difficulty.elementary}`]: [
    { id: 'q1', text: 'What is the past tense of "run"?', type: 'multiple-choice', options: ['runned', 'ran', 'runs', 'running'], correctAnswer: 'ran', hint: '"Run" is an irregular verb.' },
    { id: 'q2', text: 'Which sentence uses correct punctuation?', type: 'multiple-choice', options: ['Where are you going', 'Where are you going?', 'where are you going?', 'Where are you going!'], correctAnswer: 'Where are you going?', hint: 'Questions end with a question mark.' },
    { id: 'q3', text: 'What does "enormous" mean?', type: 'multiple-choice', options: ['tiny', 'very large', 'colorful', 'fast'], correctAnswer: 'very large', hint: 'Think of an enormous elephant!' },
    { id: 'q4', text: 'Fill in: She ___ to school every day. (go/goes)', type: 'fill-blank', correctAnswer: 'goes', hint: 'With "she/he/it", add -es or -s to the verb.' },
    { id: 'q5', text: 'Which is a compound word?', type: 'multiple-choice', options: ['happy', 'sunshine', 'quickly', 'beautiful'], correctAnswer: 'sunshine', hint: 'A compound word is made of two smaller words.' },
  ],
  [`${Subject.english}_${Difficulty.intermediate}`]: [
    { id: 'q1', text: 'What literary device is used in "The wind whispered secrets"?', type: 'multiple-choice', options: ['simile', 'metaphor', 'personification', 'alliteration'], correctAnswer: 'personification', hint: 'The wind is given a human quality (whispering).' },
    { id: 'q2', text: 'Which sentence is in passive voice?', type: 'multiple-choice', options: ['She wrote the letter.', 'The letter was written by her.', 'She writes letters.', 'She will write a letter.'], correctAnswer: 'The letter was written by her.', hint: 'In passive voice, the subject receives the action.' },
    { id: 'q3', text: 'What is the theme of a story?', type: 'multiple-choice', options: ['The main character', 'The setting', 'The central message', 'The plot events'], correctAnswer: 'The central message', hint: 'Theme is the underlying lesson or message.' },
    { id: 'q4', text: 'Fill in: Despite the rain, she ___ (continued/continuing) her walk.', type: 'fill-blank', correctAnswer: 'continued', hint: 'After "she", use the simple past tense.' },
    { id: 'q5', text: 'Which word is a synonym for "melancholy"?', type: 'multiple-choice', options: ['joyful', 'angry', 'sad', 'confused'], correctAnswer: 'sad', hint: 'Melancholy describes a feeling of deep sadness.' },
  ],
  [`${Subject.english}_${Difficulty.advanced}`]: [
    { id: 'q1', text: 'What is a "thesis statement"?', type: 'multiple-choice', options: ['A question in an essay', 'The main argument of an essay', 'A supporting detail', 'The conclusion'], correctAnswer: 'The main argument of an essay', hint: 'It tells the reader what your essay will argue.' },
    { id: 'q2', text: 'Which rhetorical device appeals to emotion?', type: 'multiple-choice', options: ['Logos', 'Ethos', 'Pathos', 'Kairos'], correctAnswer: 'Pathos', hint: 'Think of "pathetic" — relating to feelings.' },
    { id: 'q3', text: 'What is dramatic irony?', type: 'multiple-choice', options: ['When a character says the opposite of what they mean', 'When the audience knows something a character does not', 'When events turn out opposite to expectations', 'When two characters have opposite personalities'], correctAnswer: 'When the audience knows something a character does not', hint: 'The audience has information the character lacks.' },
    { id: 'q4', text: 'Fill in: An ___ is a story where characters represent abstract ideas.', type: 'fill-blank', correctAnswer: 'allegory', hint: 'Think of Animal Farm as an example.' },
    { id: 'q5', text: 'Which sentence demonstrates parallel structure?', type: 'multiple-choice', options: ['She likes to swim, running, and dance.', 'She likes swimming, running, and dancing.', 'She likes to swim, to run, and dancing.', 'She likes swim, run, and dance.'], correctAnswer: 'She likes swimming, running, and dancing.', hint: 'All items in the list should have the same grammatical form.' },
  ],
};

export function getQuestionsForLesson(subject: Subject, difficulty: Difficulty): Question[] {
  const key = `${subject}_${difficulty}`;
  return SAMPLE_QUESTIONS[key] || SAMPLE_QUESTIONS[`${Subject.math}_${Difficulty.beginner}`];
}

export const AVATAR_OPTIONS = [
  { id: 'wizard', name: 'Wizard', description: 'Master of spells & math magic', image: '/assets/generated/avatar-wizard.dim_256x256.png' },
  { id: 'knight', name: 'Knight', description: 'Brave warrior of knowledge', image: '/assets/generated/avatar-knight.dim_256x256.png' },
  { id: 'scientist', name: 'Scientist', description: 'Curious explorer of facts', image: '/assets/generated/avatar-scientist.dim_256x256.png' },
  { id: 'archer', name: 'Archer', description: 'Swift hunter of answers', image: '/assets/generated/avatar-archer.dim_256x256.png' },
];

export const SHOP_ITEMS = [
  // Hint Packs (coins)
  { id: 'hint-pack-1', type: 'hintPack' as const, name: 'Hint Pack x5', description: '5 extra hints for tough questions', coinCost: 50, gemCost: 0, emoji: '💡' },
  { id: 'hint-pack-2', type: 'hintPack' as const, name: 'Mega Hint Pack x20', description: '20 hints to power through lessons', coinCost: 150, gemCost: 0, emoji: '🔦' },
  // Avatar Costumes (gems)
  { id: 'costume-fire', type: 'avatarCostume' as const, name: 'Fire Warrior Costume', description: 'Blaze through every challenge', coinCost: 0, gemCost: 20, emoji: '🔥' },
  { id: 'costume-ice', type: 'avatarCostume' as const, name: 'Ice Mage Costume', description: 'Cool and collected learner', coinCost: 0, gemCost: 20, emoji: '❄️' },
  { id: 'costume-thunder', type: 'avatarCostume' as const, name: 'Thunder Champion', description: 'Strike with lightning speed', coinCost: 0, gemCost: 25, emoji: '⚡' },
  // World Skins (gems)
  { id: 'skin-neon', type: 'worldSkin' as const, name: 'Neon World Skin', description: 'Futuristic neon theme for all worlds', coinCost: 0, gemCost: 30, emoji: '🌈' },
  { id: 'skin-pixel', type: 'worldSkin' as const, name: 'Pixel Art Skin', description: 'Retro 8-bit style world theme', coinCost: 0, gemCost: 30, emoji: '🎮' },
];

export const STREAK_MILESTONES = [
  { days: 3, coins: 50, gems: 0, label: 'Day 3', reward: '50 Coins', emoji: '🔥' },
  { days: 7, coins: 100, gems: 5, label: 'Day 7', reward: '100 Coins + 5 Gems', emoji: '💎' },
  { days: 14, coins: 200, gems: 10, label: 'Day 14', reward: '200 Coins + 10 Gems', emoji: '👑' },
  { days: 30, coins: 500, gems: 25, label: 'Day 30', reward: '500 Coins + 25 Gems', emoji: '🌟' },
];

export function getLevelFromXP(xp: bigint): number {
  return Math.floor(Number(xp) / 1000) + 1;
}

export function getXPProgress(xp: bigint): number {
  return Number(xp) % 1000;
}

export function getXPForNextLevel(xp: bigint): number {
  return 1000;
}
