import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import type { ToolItem } from '../../../lib/tools-data';
import {
  StudentCard,
  PrimaryBtn,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
  CopyBtn,
  Stat,
  ErrorBox,
  BlobDownloadBtn,
} from './StudentShell';
import {
  MONTH_NAMES,
  computeAge,
  addDaysToDate,
  dateDifference,
  businessDaysBetween,
  randomInts,
  rollDice,
  loveScore,
  TYPING_TEXTS,
  scoreTyping,
  wrapTextLines,
} from '../../../lib/student/core';
import { canvasToBlobP } from '../../../lib/image/core';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const todayISO = () => new Date().toISOString().slice(0, 10);

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function fmtStopwatch(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  return `${String(Math.floor(totalSec / 60)).padStart(2, '0')}:${String(totalSec % 60).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

/** Short beep via WebAudio. Must be called after a user gesture somewhere. */
function playBeep(freq = 880, duration = 0.6) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => void ctx.close();
  } catch {
    /* audio unavailable — ignore */
  }
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm';

// ---------------------------------------------------------------------------
// 1. Age Calculator
// ---------------------------------------------------------------------------

export const AgeCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [dob, setDob] = useState('');
  const [atDate, setAtDate] = useState('');

  const reference = atDate || todayISO();
  let error = '';
  let result: ReturnType<typeof computeAge> | null = null;
  if (dob) {
    if (dob > reference) {
      error = 'The date of birth is after the reference date — pick an earlier birthday or a later "age on" date.';
    } else {
      try {
        result = computeAge(dob, reference);
      } catch {
        error = 'Could not read that date. Please use the date picker.';
      }
    }
  }

  return (
    <StudentCard tool={tool} note="Exact age down to the day, plus totals and your next birthday.">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>Date of birth</OptLabel>
          <OptInput type="date" value={dob} max={todayISO()} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div>
          <OptLabel>Age on this date (optional — defaults to today)</OptLabel>
          <OptInput type="date" value={atDate} onChange={(e) => setAtDate(e.target.value)} />
        </div>
      </div>
      {error && <ErrorBox message={error} />}
      {result && (
        <>
          <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 p-4 text-center">
            <p className="text-3xl font-extrabold text-teal-700 dark:text-teal-300">
              {result.years} <span className="text-base font-semibold">years</span> {result.months}{' '}
              <span className="text-base font-semibold">months</span> {result.days}{' '}
              <span className="text-base font-semibold">days</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">as of {fmtDate(reference)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Total days" value={result.totalDays.toLocaleString()} />
            <Stat label="Total weeks" value={result.totalWeeks.toLocaleString()} />
            <Stat label="Total hours" value={result.totalHours.toLocaleString()} />
            <Stat label="Born on" value={result.bornWeekday} />
            <Stat label="Zodiac sign" value={result.zodiac} />
            <Stat
              label="Next birthday"
              value={`${fmtDate(result.nextBirthdayISO)} (${result.daysToNextBirthday === 0 ? 'today!' : `in ${result.daysToNextBirthday} days`})`}
            />
          </div>
        </>
      )}
      {!result && !error && <p className="text-sm text-slate-400">Pick a date of birth to see the breakdown.</p>}
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 2. Date Calculator
// ---------------------------------------------------------------------------

export const DateCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [a, setA] = useState(todayISO());
  const [b, setB] = useState(todayISO());
  const [base, setBase] = useState(todayISO());
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState<'add' | 'subtract'>('add');

  const diff = a && b ? dateDifference(a, b) : null;
  const biz = a && b ? businessDaysBetween(a, b) : null;
  const shifted = base ? addDaysToDate(base, mode === 'add' ? days : -days) : null;

  return (
    <StudentCard tool={tool} note="Days between dates, business days, and date arithmetic.">
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Difference between two dates</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <OptLabel>Start date</OptLabel>
            <OptInput type="date" value={a} onChange={(e) => setA(e.target.value)} />
          </div>
          <div>
            <OptLabel>End date</OptLabel>
            <OptInput type="date" value={b} onChange={(e) => setB(e.target.value)} />
          </div>
        </div>
        {diff && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
            <Stat label="Days" value={diff.days.toLocaleString()} />
            <Stat label="Weeks" value={diff.weeks.toLocaleString()} />
            <Stat label="Months (approx)" value={diff.monthsApprox} />
            <Stat label="Years (approx)" value={diff.yearsApprox} />
            <Stat label="Business days" value={(biz ?? 0).toLocaleString()} />
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Add or subtract days</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <OptLabel>From date</OptLabel>
            <OptInput type="date" value={base} onChange={(e) => setBase(e.target.value)} />
          </div>
          <div>
            <OptLabel>Days</OptLabel>
            <OptInput type="number" min={0} value={days} onChange={(e) => setDays(Math.max(0, Number(e.target.value) || 0))} />
          </div>
          <div>
            <OptLabel>Operation</OptLabel>
            <OptSelect value={mode} onChange={(e) => setMode(e.target.value as 'add' | 'subtract')}>
              <option value="add">Add days</option>
              <option value="subtract">Subtract days</option>
            </OptSelect>
          </div>
        </div>
        {shifted && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Result: <strong className="text-teal-700 dark:text-teal-300">{fmtDate(shifted.iso)}</strong> — a {shifted.weekday}
          </p>
        )}
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Random Generator (numbers, dice, coin)
// ---------------------------------------------------------------------------

const D6_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const RandomGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  // Numbers
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [unique, setUnique] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [numError, setNumError] = useState('');

  const generateNumbers = () => {
    if (min > max) {
      setNumError('Minimum must be less than or equal to maximum.');
      return;
    }
    if (count < 1 || count > 1000) {
      setNumError('Pick a count between 1 and 1000.');
      return;
    }
    if (unique && count > max - min + 1) {
      setNumError(`Only ${max - min + 1} unique numbers exist in that range — lower the count or widen the range.`);
      return;
    }
    setNumError('');
    const out = randomInts(min, max, count, unique);
    setNumbers(sorted ? [...out].sort((x, y) => x - y) : out);
  };

  // Dice
  const [sides, setSides] = useState(6);
  const [diceCount, setDiceCount] = useState(2);
  const [dice, setDice] = useState<{ rolls: number[]; total: number } | null>(null);

  // Coin
  const [coin, setCoin] = useState<'Heads' | 'Tails' | null>(null);
  const [coinStats, setCoinStats] = useState({ heads: 0, tails: 0 });
  const flipCoin = () => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setCoin(result);
    setCoinStats((s) => ({ heads: s.heads + (result === 'Heads' ? 1 : 0), tails: s.tails + (result === 'Tails' ? 1 : 0) }));
  };

  return (
    <StudentCard tool={tool} note="Random numbers, dice rolls and coin flips — generated locally in your browser.">
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Random numbers</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <OptLabel>Min</OptLabel>
            <OptInput type="number" value={min} onChange={(e) => setMin(Number(e.target.value) || 0)} />
          </div>
          <div>
            <OptLabel>Max</OptLabel>
            <OptInput type="number" value={max} onChange={(e) => setMax(Number(e.target.value) || 0)} />
          </div>
          <div>
            <OptLabel>How many</OptLabel>
            <OptInput type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value) || 1)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <OptCheck checked={unique} onChange={setUnique} label="No repeats" />
          <OptCheck checked={sorted} onChange={setSorted} label="Sort results" />
          <PrimaryBtn onClick={generateNumbers}>Generate</PrimaryBtn>
          {numbers.length > 0 && <CopyBtn text={numbers.join(', ')} />}
        </div>
        {numError && <ErrorBox message={numError} />}
        {numbers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {numbers.map((n, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-sm">
                {n}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Dice roller</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <OptLabel>Dice type</OptLabel>
            <OptSelect value={sides} onChange={(e) => setSides(Number(e.target.value))}>
              {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                <option key={s} value={s}>
                  d{s}
                </option>
              ))}
            </OptSelect>
          </div>
          <div>
            <OptLabel>Number of dice</OptLabel>
            <OptSelect value={diceCount} onChange={(e) => setDiceCount(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </OptSelect>
          </div>
          <PrimaryBtn onClick={() => setDice(rollDice(sides, diceCount))}>Roll dice</PrimaryBtn>
        </div>
        {dice && (
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {dice.rolls.map((r, i) => (
              <span
                key={i}
                className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-teal-600 dark:border-teal-400 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-extrabold text-2xl"
              >
                {sides === 6 ? D6_FACES[r - 1] : r}
              </span>
            ))}
            <Stat label="Total" value={dice.total} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Coin flip</h3>
        <div className="flex flex-wrap items-center gap-4">
          <PrimaryBtn onClick={flipCoin}>Flip coin</PrimaryBtn>
          {coin && <span className="text-3xl font-extrabold text-teal-700 dark:text-teal-300">{coin === 'Heads' ? '🪙 Heads' : '🪙 Tails'}</span>}
          <Stat label="Heads" value={coinStats.heads} />
          <Stat label="Tails" value={coinStats.tails} />
          <Stat label="Total flips" value={coinStats.heads + coinStats.tails} />
        </div>
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Love Calculator
// ---------------------------------------------------------------------------

export const LoveCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [result, setResult] = useState<ReturnType<typeof loveScore> | null>(null);
  const [error, setError] = useState('');

  const calculate = () => {
    if (!nameA.trim() || !nameB.trim()) {
      setError('Enter both names first.');
      setResult(null);
      return;
    }
    setError('');
    setResult(loveScore(nameA, nameB));
  };

  return (
    <StudentCard
      tool={tool}
      note="Just for fun — a deterministic name game, not a real compatibility measure. Same names always give the same score."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>Your name</OptLabel>
          <OptInput type="text" value={nameA} onChange={(e) => setNameA(e.target.value)} placeholder="e.g. Alex" />
        </div>
        <div>
          <OptLabel>Their name</OptLabel>
          <OptInput type="text" value={nameB} onChange={(e) => setNameB(e.target.value)} placeholder="e.g. Sam" />
        </div>
      </div>
      <PrimaryBtn onClick={calculate}>Calculate ❤</PrimaryBtn>
      {error && <ErrorBox message={error} />}
      {result && (
        <div className="flex flex-col items-center text-center gap-2 py-2">
          <div className="w-36 h-36 rounded-full border-8 border-rose-500 dark:border-rose-400 bg-white dark:bg-slate-800 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">{result.score}%</span>
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {nameA.trim()} ❤ {nameB.trim()}
          </p>
          <p className="font-semibold text-rose-600 dark:text-rose-400">{result.label}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{result.message}</p>
          <p className="text-xs text-slate-400">
            Just for fun — this score comes from the letters in the names only. It says nothing about a real relationship.
          </p>
        </div>
      )}
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 5. Stopwatch & Countdown Timer
// ---------------------------------------------------------------------------

export const StopwatchTimer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  // Stopwatch
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<{ lap: number; total: number }[]>([]);
  const swStartRef = useRef(0);
  const swAccumRef = useRef(0);
  const lastLapRef = useRef(0);

  useEffect(() => {
    if (!swRunning) return;
    const id = setInterval(() => {
      setSwElapsed(swAccumRef.current + (performance.now() - swStartRef.current));
    }, 31);
    return () => clearInterval(id);
  }, [swRunning]);

  const swToggle = () => {
    if (swRunning) {
      swAccumRef.current += performance.now() - swStartRef.current;
      setSwElapsed(swAccumRef.current);
      setSwRunning(false);
    } else {
      swStartRef.current = performance.now();
      setSwRunning(true);
    }
  };
  const swCurrent = () => swAccumRef.current + (swRunning ? performance.now() - swStartRef.current : 0);
  const swLap = () => {
    const total = swCurrent();
    setLaps((prev) => [...prev, { lap: total - lastLapRef.current, total }]);
    lastLapRef.current = total;
  };
  const swReset = () => {
    setSwRunning(false);
    swAccumRef.current = 0;
    lastLapRef.current = 0;
    setSwElapsed(0);
    setLaps([]);
  };

  // Countdown
  const [cdMin, setCdMin] = useState(5);
  const [cdSec, setCdSec] = useState(0);
  const [cdTotalMs, setCdTotalMs] = useState(300_000);
  const [cdLeft, setCdLeft] = useState(300_000);
  const [cdRunning, setCdRunning] = useState(false);
  const [cdDone, setCdDone] = useState(false);
  const cdEndRef = useRef(0);
  const cdLeftRef = useRef(300_000);

  useEffect(() => {
    if (!cdRunning) return;
    const id = setInterval(() => {
      const left = cdEndRef.current - performance.now();
      if (left <= 0) {
        cdLeftRef.current = 0;
        setCdLeft(0);
        setCdRunning(false);
        setCdDone(true);
        playBeep(880, 0.6);
      } else {
        setCdLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [cdRunning]);

  const cdSetDuration = (m: number, s: number) => {
    setCdMin(m);
    setCdSec(s);
    if (!cdRunning) {
      const total = (m * 60 + s) * 1000;
      setCdTotalMs(total);
      setCdLeft(total);
      cdLeftRef.current = total;
      setCdDone(false);
    }
  };
  const cdToggle = () => {
    if (cdRunning) {
      cdLeftRef.current = Math.max(0, cdEndRef.current - performance.now());
      setCdRunning(false);
    } else {
      if (cdLeftRef.current <= 0) {
        const total = (cdMin * 60 + cdSec) * 1000;
        if (total <= 0) return;
        setCdTotalMs(total);
        cdLeftRef.current = total;
        setCdLeft(total);
      }
      cdEndRef.current = performance.now() + cdLeftRef.current;
      setCdDone(false);
      setCdRunning(true);
    }
  };
  const cdReset = () => {
    setCdRunning(false);
    const total = (cdMin * 60 + cdSec) * 1000;
    setCdTotalMs(total);
    setCdLeft(total);
    cdLeftRef.current = total;
    setCdDone(false);
  };

  return (
    <StudentCard tool={tool} note="A precision stopwatch with laps, plus a countdown timer with an audible finish beep.">
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Stopwatch</h3>
        <p className="text-center text-5xl font-extrabold tabular-nums text-slate-800 dark:text-slate-100 py-2">{fmtStopwatch(swElapsed)}</p>
        <div className="flex justify-center gap-2">
          <PrimaryBtn onClick={swToggle}>{swRunning ? 'Pause' : 'Start'}</PrimaryBtn>
          <PrimaryBtn onClick={swLap} disabled={swElapsed === 0 && !swRunning} className="!bg-slate-600 hover:!bg-slate-700">
            Lap
          </PrimaryBtn>
          <PrimaryBtn onClick={swReset} className="!bg-slate-600 hover:!bg-slate-700">
            Reset
          </PrimaryBtn>
        </div>
        {laps.length > 0 && (
          <ul className="mt-3 max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {laps.map((l, i) => (
              <li key={i} className="flex justify-between py-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Lap {i + 1}</span>
                <span className="tabular-nums">{fmtStopwatch(l.lap)}</span>
                <span className="tabular-nums text-slate-400">{fmtStopwatch(l.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Countdown timer</h3>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div>
            <OptLabel>Minutes</OptLabel>
            <OptInput type="number" min={0} max={999} value={cdMin} onChange={(e) => cdSetDuration(Math.max(0, Number(e.target.value) || 0), cdSec)} />
          </div>
          <div>
            <OptLabel>Seconds</OptLabel>
            <OptInput type="number" min={0} max={59} value={cdSec} onChange={(e) => cdSetDuration(cdMin, Math.min(59, Math.max(0, Number(e.target.value) || 0)))} />
          </div>
        </div>
        <p className={`text-center text-5xl font-extrabold tabular-nums py-2 ${cdDone ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-slate-100'}`}>
          {fmtClock(Math.ceil(cdLeft / 1000))}
        </p>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden max-w-md mx-auto">
          <div className="h-full bg-teal-600 transition-all duration-100" style={{ width: `${cdTotalMs > 0 ? (cdLeft / cdTotalMs) * 100 : 0}%` }} />
        </div>
        {cdDone && <p className="text-center text-sm font-bold text-red-500 mt-2">Time's up!</p>}
        <div className="flex justify-center gap-2 mt-3">
          <PrimaryBtn onClick={cdToggle}>{cdRunning ? 'Pause' : 'Start'}</PrimaryBtn>
          <PrimaryBtn onClick={cdReset} className="!bg-slate-600 hover:!bg-slate-700">
            Reset
          </PrimaryBtn>
        </div>
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 6. Pomodoro Timer
// ---------------------------------------------------------------------------

interface PomodoroCfg {
  focus: number;
  short: number;
  long: number;
  cycles: number;
}

export const PomodoroTimer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [focusIn, setFocusIn] = useState(25);
  const [shortIn, setShortIn] = useState(5);
  const [longIn, setLongIn] = useState(15);
  const [cyclesIn, setCyclesIn] = useState(4);
  const [cfg, setCfg] = useState<PomodoroCfg>({ focus: 25, short: 5, long: 15, cycles: 4 });

  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [task, setTask] = useState('');

  const endRef = useRef(0);
  const remainRef = useRef(25 * 60);

  const phaseLabel = phase === 'focus' ? 'Focus' : sessionsDone > 0 && sessionsDone % cfg.cycles === 0 ? 'Long break' : 'Short break';

  const advanceRef = useRef<() => void>(() => {});
  advanceRef.current = () => {
    playBeep(phase === 'focus' ? 880 : 660, 0.7);
    if (phase === 'focus') {
      const done = sessionsDone + 1;
      setSessionsDone(done);
      const isLong = done % cfg.cycles === 0;
      const dur = (isLong ? cfg.long : cfg.short) * 60;
      setPhase('break');
      remainRef.current = dur;
      setSecondsLeft(dur);
      endRef.current = Date.now() + dur * 1000;
    } else {
      const dur = cfg.focus * 60;
      setPhase('focus');
      remainRef.current = dur;
      setSecondsLeft(dur);
      endRef.current = Date.now() + dur * 1000;
    }
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = (endRef.current - Date.now()) / 1000;
      if (left <= 0) {
        advanceRef.current();
      } else {
        setSecondsLeft(Math.ceil(left));
      }
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      remainRef.current = Math.max(0, (endRef.current - Date.now()) / 1000);
      setRunning(false);
    } else {
      endRef.current = Date.now() + remainRef.current * 1000;
      setRunning(true);
    }
  };

  const reset = () => {
    const next: PomodoroCfg = {
      focus: Math.max(1, focusIn || 25),
      short: Math.max(1, shortIn || 5),
      long: Math.max(1, longIn || 15),
      cycles: Math.max(1, cyclesIn || 4),
    };
    setCfg(next);
    setRunning(false);
    setPhase('focus');
    setSessionsDone(0);
    remainRef.current = next.focus * 60;
    setSecondsLeft(next.focus * 60);
  };

  return (
    <StudentCard tool={tool} note="Focus in timed sprints with automatic breaks. Timings run in this tab — keep it open while you study.">
      <div className="text-center">
        <p className={`text-sm font-bold uppercase tracking-wide ${phase === 'focus' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {phaseLabel}
          {phase === 'focus' && ` — session ${sessionsDone % cfg.cycles + 1} of ${cfg.cycles}`}
        </p>
        <p className="text-6xl font-extrabold tabular-nums text-slate-800 dark:text-slate-100 py-2">{fmtClock(secondsLeft)}</p>
        {task && <p className="text-sm text-slate-500 dark:text-slate-400">Working on: <span className="font-semibold text-slate-700 dark:text-slate-200">{task}</span></p>}
        <div className="flex justify-center gap-2 mt-2">
          <PrimaryBtn onClick={toggle}>{running ? 'Pause' : 'Start'}</PrimaryBtn>
          <PrimaryBtn onClick={reset} className="!bg-slate-600 hover:!bg-slate-700">
            Reset
          </PrimaryBtn>
        </div>
      </div>
      <div>
        <OptLabel>Current task (optional)</OptLabel>
        <OptInput type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Revise chemistry chapter 4" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <OptLabel>Focus (min)</OptLabel>
          <OptInput type="number" min={1} value={focusIn} onChange={(e) => setFocusIn(Number(e.target.value) || 0)} />
        </div>
        <div>
          <OptLabel>Short break (min)</OptLabel>
          <OptInput type="number" min={1} value={shortIn} onChange={(e) => setShortIn(Number(e.target.value) || 0)} />
        </div>
        <div>
          <OptLabel>Long break (min)</OptLabel>
          <OptInput type="number" min={1} value={longIn} onChange={(e) => setLongIn(Number(e.target.value) || 0)} />
        </div>
        <div>
          <OptLabel>Sessions per set</OptLabel>
          <OptInput type="number" min={1} value={cyclesIn} onChange={(e) => setCyclesIn(Number(e.target.value) || 0)} />
        </div>
      </div>
      <p className="text-xs text-slate-400">New timings apply when you press Reset.</p>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Focus sessions completed" value={sessionsDone} />
        <Stat label="Total focus time" value={`${sessionsDone * cfg.focus} min`} />
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 7. Typing Speed Test
// ---------------------------------------------------------------------------

export const TypingTest: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [duration, setDuration] = useState(60);
  const [target, setTarget] = useState(() => TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finished, setFinished] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => {
      const left = Math.max(0, (endRef.current - Date.now()) / 1000);
      setTimeLeft(Math.ceil(left));
      if (left <= 0) setFinished(true);
    }, 150);
    return () => clearInterval(id);
  }, [started, finished]);

  const result = finished ? scoreTyping(target, typed, duration) : null;

  const restart = (newText: boolean) => {
    if (newText) setTarget(TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
    setTyped('');
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
  };
  const changeDuration = (d: number) => {
    setDuration(d);
    setTimeLeft(d);
    setTyped('');
    setStarted(false);
    setFinished(false);
  };
  const onType = (v: string) => {
    if (finished) return;
    if (!started && v.length > 0) {
      endRef.current = Date.now() + duration * 1000;
      setStarted(true);
    }
    setTyped(v.slice(0, target.length));
  };

  return (
    <StudentCard tool={tool} note="The timer starts on your first keystroke. Pasting is disabled — type it yourself for a true score.">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <OptLabel>Duration</OptLabel>
          <OptSelect value={duration} onChange={(e) => changeDuration(Number(e.target.value))}>
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
          </OptSelect>
        </div>
        <Stat label="Time left" value={`${timeLeft}s`} />
        <Stat label="Characters typed" value={typed.length} />
        <PrimaryBtn onClick={() => restart(false)} className="!bg-slate-600 hover:!bg-slate-700">
          Restart
        </PrimaryBtn>
        <PrimaryBtn onClick={() => restart(true)} className="!bg-slate-600 hover:!bg-slate-700">
          New text
        </PrimaryBtn>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
        <p className="font-mono text-base leading-8 whitespace-pre-wrap break-words select-none">
          {target.split('').map((ch, i) => {
            let cls = 'text-slate-400 dark:text-slate-500';
            if (i < typed.length) {
              cls =
                typed[i] === ch
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'bg-red-200 dark:bg-red-900/70 text-red-800 dark:text-red-200 rounded-sm';
            } else if (i === typed.length && started && !finished) {
              cls = 'text-slate-500 dark:text-slate-300 underline decoration-teal-500 decoration-2 underline-offset-4';
            }
            return (
              <span key={i} className={cls}>
                {ch}
              </span>
            );
          })}
        </p>
      </div>
      <textarea
        className={`${inputCls} font-mono`}
        rows={3}
        value={typed}
        disabled={finished}
        onChange={(e) => onType(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        placeholder={finished ? 'Test finished — restart to try again.' : 'Click here and start typing the text above…'}
      />
      {result && (
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 p-4">
          <p className="text-center text-4xl font-extrabold text-teal-700 dark:text-teal-300">
            {result.wpm} <span className="text-base font-semibold">WPM</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <Stat label="Raw WPM" value={result.rawWpm} />
            <Stat label="Accuracy" value={`${result.accuracy}%`} />
            <Stat label="Correct characters" value={result.correctChars} />
            <Stat label="Mistakes" value={result.incorrectChars} />
          </div>
        </div>
      )}
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 8. Text to Handwriting
// ---------------------------------------------------------------------------

const HW_FONTS = [
  { id: 'Caveat', label: 'Caveat — neat cursive', css: '"Caveat", cursive', weight: 600 },
  { id: 'Shadows Into Light', label: 'Shadows Into Light — casual', css: '"Shadows Into Light", cursive', weight: 400 },
  { id: 'Patrick Hand', label: 'Patrick Hand — round print', css: '"Patrick Hand", cursive', weight: 400 },
];
const HW_MAX_CHARS: Record<number, number> = { 36: 38, 32: 42, 28: 48 };
const HW_W = 1240;
const HW_H = 1754;
const HW_LINE_GAP = 64;
const HW_FIRST_Y = 150;
const HW_LINES_PER_PAGE = 24;
const HW_TEXT_X = 140;

let hwSheetAdded = false;
function ensureHwFontSheet() {
  if (hwSheetAdded || typeof document === 'undefined') return;
  hwSheetAdded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Patrick+Hand&family=Shadows+Into+Light&display=swap';
  document.head.appendChild(link);
}

export const TextToHandwriting: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [text, setText] = useState('');
  const [fontId, setFontId] = useState('Caveat');
  const [ink, setInk] = useState('#1e40af');
  const [size, setSize] = useState(32);
  const [generating, setGenerating] = useState(false);
  const [pages, setPages] = useState<{ url: string; blob: Blob }[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!text.trim()) {
      setError('Type or paste some text first.');
      return;
    }
    setError('');
    setGenerating(true);
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    try {
      const font = HW_FONTS.find((f) => f.id === fontId) ?? HW_FONTS[0];
      ensureHwFontSheet();
      try {
        await document.fonts.load(`${font.weight} ${size}px ${font.css.split(',')[0]}`);
      } catch {
        /* offline or blocked — canvas falls back to cursive */
      }

      const maxChars = HW_MAX_CHARS[size] ?? 42;
      const lines: string[] = [];
      for (const para of text.split('\n')) {
        if (!para.trim()) lines.push('');
        else lines.push(...wrapTextLines(para, maxChars));
      }
      if (lines.length === 0) lines.push('');
      const chunks: string[][] = [];
      for (let i = 0; i < lines.length; i += HW_LINES_PER_PAGE) chunks.push(lines.slice(i, i + HW_LINES_PER_PAGE));

      const out: { url: string; blob: Blob }[] = [];
      for (const chunk of chunks) {
        const canvas = document.createElement('canvas');
        canvas.width = HW_W;
        canvas.height = HW_H;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is not supported in this browser.');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, HW_W, HW_H);
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        for (let i = 0; i < HW_LINES_PER_PAGE; i++) {
          const y = HW_FIRST_Y + i * HW_LINE_GAP;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(HW_W, y);
          ctx.stroke();
        }
        ctx.strokeStyle = '#f87171';
        ctx.beginPath();
        ctx.moveTo(110, 0);
        ctx.lineTo(110, HW_H);
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.font = `${font.weight} ${size}px ${font.css}`;
        ctx.textBaseline = 'alphabetic';
        chunk.forEach((line, i) => {
          if (line) ctx.fillText(line, HW_TEXT_X, HW_FIRST_Y + i * HW_LINE_GAP);
        });
        const blob = await canvasToBlobP(canvas);
        out.push({ url: URL.createObjectURL(blob), blob });
      }
      setPages(out);
      if (out.length > 1) {
        const zip = new JSZip();
        out.forEach((p, i) => zip.file(`handwriting-page-${i + 1}.png`, p.blob));
        setZipBlob(await zip.generateAsync({ type: 'blob' }));
      } else {
        setZipBlob(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while rendering the pages.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <StudentCard
      tool={tool}
      note="Turns typed text into handwritten-style pages on ruled A4 paper. The handwriting fonts are real fonts loaded from Google Fonts; if you are offline, a generic cursive fallback is used instead."
    >
      <textarea
        className={inputCls}
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your assignment text here…"
      />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <OptLabel>Handwriting style</OptLabel>
          <OptSelect value={fontId} onChange={(e) => setFontId(e.target.value)}>
            {HW_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Ink color</OptLabel>
          <OptSelect value={ink} onChange={(e) => setInk(e.target.value)}>
            <option value="#1e40af">Blue pen</option>
            <option value="#111827">Black pen</option>
            <option value="#b91c1c">Red pen</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Writing size</OptLabel>
          <OptSelect value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value={28}>Small</option>
            <option value={32}>Medium</option>
            <option value={36}>Large</option>
          </OptSelect>
        </div>
      </div>
      <PrimaryBtn onClick={() => void generate()} disabled={generating}>
        {generating ? 'Writing your pages…' : 'Generate handwritten pages'}
      </PrimaryBtn>
      {error && <ErrorBox message={error} />}
      {pages.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="Pages" value={pages.length} />
            {pages.length === 1 ? (
              <BlobDownloadBtn blob={pages[0].blob} filename="handwriting.png" label="Download PNG" />
            ) : (
              <BlobDownloadBtn blob={zipBlob} filename="handwriting-pages.zip" label="Download all pages (ZIP)" />
            )}
          </div>
          {pages.map((p, i) => (
            <img key={i} src={p.url} alt={`Handwritten page ${i + 1}`} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
          ))}
        </div>
      )}
    </StudentCard>
  );
};
