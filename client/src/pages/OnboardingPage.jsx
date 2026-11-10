import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DsuLogo } from '../components/DsuLogo';
import { Confetti } from '../components/Confetti';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Flame,
  Zap,
  Code2,
  Music,
  Compass,
  Rocket,
  ShieldCheck,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Selected Preferences
  const [selectedInterests, setSelectedInterests] = useState(['hackathons', 'cultural']);
  const [selectedBranch, setSelectedBranch] = useState(user?.department || 'Computer Science & Engineering');
  const [selectedYear, setSelectedYear] = useState('2nd Year (Sophomore)');
  const [selectedGoal, setSelectedGoal] = useState('competitor');
  const [confettiActive, setConfettiActive] = useState(false);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      if (step + 1 === totalSteps) {
        setConfettiActive(true);
        toast.success('🎉 100 Campus XP Unlocked!', { icon: '💎' });
      }
    } else {
      toast.success('Your DSU digital passbook is active!');
      navigate('/dashboard');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const mascotSpeech = [
    '', // 0
    "Hey! I'm Dexter, your DSU Campus Companion! What gets your adrenaline pumping on campus?",
    "Awesome choices! Now tell me, which academic squad do you roll with at Harohalli?",
    "Love the ambition! What is your main campus mission for this semester?",
    `BOOM! 🚀 Your Official DSU Digital Admission Passbook has been minted, ${user?.name || 'Scholar'}!`
  ];

  const interestOptions = [
    {
      id: 'hackathons',
      icon: Code2,
      emoji: '🤖',
      title: 'Hackathons & AI Builds',
      desc: '36-hour build sprints, generative AI bounties, and dev circles',
      color: 'border-blue-500 bg-blue-50/50'
    },
    {
      id: 'cultural',
      icon: Music,
      emoji: '🎭',
      title: 'Taranga Cultural & Music',
      desc: 'Battle of bands, indie rock fests, street theatre & dance',
      color: 'border-purple-500 bg-purple-50/50'
    },
    {
      id: 'sports',
      icon: Trophy,
      emoji: '🏆',
      title: 'Varsity Athletic Leagues',
      desc: 'FIFA-spec turf football, basketball shootouts & track sprints',
      color: 'border-emerald-500 bg-emerald-50/50'
    },
    {
      id: 'innovation',
      icon: Rocket,
      emoji: '💡',
      title: 'AIC-DSU Innovation Labs',
      desc: 'Robotics maker spaces, startup incubation & investor pitches',
      color: 'border-amber-500 bg-amber-50/50'
    },
    {
      id: 'symposiums',
      icon: Compass,
      emoji: '🔬',
      title: 'IEEE Tech Symposiums',
      desc: 'Research colloquiums, scientific paper tracks & keynote talks',
      color: 'border-rose-500 bg-rose-50/50'
    }
  ];

  const branches = [
    { code: 'CSE', name: 'Computer Science & Engineering', icon: '💻' },
    { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', icon: '🤖' },
    { code: 'DS', name: 'Data Science & Big Data', icon: '📊' },
    { code: 'CY', name: 'Cyber Security & Forensics', icon: '🛡️' },
    { code: 'ECE', name: 'Electronics & Communication', icon: '⚡' },
    { code: 'AE', name: 'Aerospace Engineering', icon: '🚀' },
    { code: 'DES', name: 'School of Design (B.Des UX)', icon: '🎨' },
    { code: 'SOM', name: 'Commerce & Management (BBA/MBA)', icon: '💼' }
  ];

  const goals = [
    {
      id: 'explorer',
      badge: 'Casual Explorer',
      xp: '+50 XP',
      desc: 'Attend 1-2 curated events per month to explore and unwind',
      emoji: '🌱'
    },
    {
      id: 'competitor',
      badge: 'Active Competitor',
      xp: '+150 XP',
      desc: 'Compete in hackathons, join workshops & collect verified certificates',
      emoji: '⚡'
    },
    {
      id: 'legend',
      badge: 'Campus Legend',
      xp: '+300 XP',
      desc: 'Maximize participation, lead student clubs & dominate leaderboards',
      emoji: '👑'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-[#002B55] selection:text-white">
      <Confetti active={confettiActive} duration={4000} />

      {/* Top Header & Duolingo Progress Bar */}
      <header className="max-w-3xl w-full mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 transition apple-press ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Duolingo Progress Bar */}
          <div className="flex-1 max-w-md h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-[#002B55] rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/80 text-xs font-bold text-amber-800 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>100 XP</span>
          </div>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="max-w-2xl w-full mx-auto my-auto py-6">
        {/* Dexter Mascot Dialogue Bubble */}
        <div className="flex items-start gap-3 sm:gap-4 mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#002B55] text-amber-400 border-2 border-amber-400/40 shadow-lg flex items-center justify-center text-2xl sm:text-3xl shrink-0 apple-bounce select-none">
            🦅
          </div>
          <div className="flex-1 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md relative apple-card">
            <div className="absolute left-[-8px] top-6 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-[-45deg]" />
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
              {mascotSpeech[step]}
            </p>
          </div>
        </div>

        {/* STEP 1: Campus Passions */}
        {step === 1 && (
          <div className="space-y-3 apple-modal-spring">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select all that interest you (tap to choose)
            </h2>
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between group apple-press ${
                      isSelected
                        ? 'border-[#002B55] bg-blue-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl sm:text-3xl select-none">{opt.emoji}</span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'border-[#002B55] bg-[#002B55] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Academic Squad */}
        {step === 2 && (
          <div className="space-y-6 apple-modal-spring">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Your Department / Branch
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {branches.map((b) => {
                  const isSelected = selectedBranch === b.name;
                  return (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBranch(b.name)}
                      className={`text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 apple-press ${
                        isSelected
                          ? 'border-[#002B55] bg-blue-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{b.icon}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-[#002B55] block">
                          {b.code}
                        </span>
                        <span className="text-xs font-medium text-slate-700 truncate block">
                          {b.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Your Academic Standing
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  '1st Year (Freshman)',
                  '2nd Year (Sophomore)',
                  '3rd Year (Junior)',
                  '4th Year (Senior)'
                ].map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setSelectedYear(yr)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold transition text-center apple-press ${
                        isSelected
                          ? 'border-[#002B55] bg-[#002B55] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {yr.split(' ')[0]} Year
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Campus Goal */}
        {step === 3 && (
          <div className="space-y-3 apple-modal-spring">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Choose your campus trajectory
            </h2>
            <div className="space-y-3">
              {goals.map((g) => {
                const isSelected = selectedGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between apple-press ${
                      isSelected
                        ? 'border-[#002B55] bg-blue-50/60 shadow-md ring-2 ring-blue-900/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl select-none">{g.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">{g.badge}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {g.xp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{g.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'border-[#002B55] bg-[#002B55] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Celebration & VIP Pass Minting */}
        {step === 4 && (
          <div className="text-center space-y-6 apple-modal-spring">
            {/* VIP Pass Card */}
            <div className="max-w-sm mx-auto bg-gradient-to-br from-[#001B36] via-[#002B55] to-[#00142A] text-white p-6 rounded-3xl border border-amber-400/30 shadow-2xl relative overflow-hidden apple-card apple-hologram text-left">
              <div className="flex items-center justify-between mb-4">
                <DsuLogo variant="white" size="sm" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  VIP PASS
                </span>
              </div>

              <div className="my-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  Student Member
                </p>
                <h4 className="text-lg font-black tracking-tight text-white mt-0.5">
                  {user?.name || 'Verified DSU Scholar'}
                </h4>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  {user?.email || 'student@dsu.edu.in'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-200">{selectedBranch}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Campus XP</span>
                  <span className="font-bold text-amber-300">100 XP ★</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                You're officially on the DSU Grid!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your customized event feed, digital admission tickets, and real-time campus scanner are all synced to your profile.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar with Chunky 3D Button */}
      <footer className="max-w-2xl w-full mx-auto pt-4 border-t border-slate-200/80">
        <button
          type="button"
          onClick={nextStep}
          className="w-full bg-[#002B55] hover:bg-[#001B36] text-white font-extrabold text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl shadow-lg border-b-4 border-[#00142A] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 apple-press"
        >
          {step === totalSteps ? (
            <>
              <span>Enter Campus Life Portal</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}

