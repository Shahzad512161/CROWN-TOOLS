import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  GpaCalculator,
  CitationGenerator,
  EssayWordCounter,
  FlashcardMaker,
  StudyPlanner,
  PeriodicTable,
  EquationSolver,
  AiQuizGenerator,
} from './StudentStudioA';
import {
  AgeCalculator,
  DateCalculator,
  RandomGenerator,
  LoveCalculator,
  StopwatchTimer,
  PomodoroTimer,
  TypingTest,
  TextToHandwriting,
} from './StudentStudioB';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the Student & Everyday Tools suite. */
export const STUDENT_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  'gpa-calculator': GpaCalculator,
  'citation-generator': CitationGenerator,
  'essay-word-counter': EssayWordCounter,
  'flashcard-maker': FlashcardMaker,
  'study-planner': StudyPlanner,
  'periodic-table': PeriodicTable,
  'equation-solver': EquationSolver,
  'ai-quiz-generator': AiQuizGenerator,
  'age-calculator': AgeCalculator,
  'date-calculator': DateCalculator,
  'random-number-generator': RandomGenerator,
  'love-calculator': LoveCalculator,
  'stopwatch-timer': StopwatchTimer,
  'pomodoro-timer': PomodoroTimer,
  'typing-speed-test': TypingTest,
  'text-to-handwriting': TextToHandwriting,
};
