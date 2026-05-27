'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Info, CheckCircle2, ChevronRight, History, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

const MOCK_EXERCISES = [
  {
    id: '1',
    name: 'Press de Banca con Barra',
    sets: 4,
    reps: '10-12',
    video: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpwaG54Znp4Znh4Znh4Znh4Znh4Znh4Znh4Znh4Znh4Znh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l3q2XhfQ8oCkm1K7u/giphy.gif', // Placeholder
    lastWeight: '60kg',
    notes: 'Bajar lento y controlado'
  },
  {
    id: '2',
    name: 'Aperturas con Mancuernas',
    sets: 3,
    reps: '15',
    video: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpwaG54Znp4Znh4Znh4Znh4Znh4Znh4Znh4Znh4Znh4Znh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlJ8B5fXzUqK6Y4/giphy.gif', // Placeholder
    lastWeight: '12.5kg',
    notes: 'Sentir el estiramiento'
  }
];

export default function WorkoutView() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [weight, setWeight] = useState('');

  const currentExercise = MOCK_EXERCISES[currentIdx];
  const progress = ((currentIdx * currentExercise.sets + (currentSet - 1)) / (MOCK_EXERCISES.length * currentExercise.sets)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsResting(false);
      setIsActive(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleSetComplete = () => {
    if (currentSet < currentExercise.sets) {
      setIsResting(true);
      setIsActive(true);
      setCurrentSet(s => s + 1);
    } else if (currentIdx < MOCK_EXERCISES.length - 1) {
      setCurrentIdx(i => i + 1);
      setCurrentSet(1);
    } else {
      alert('¡Entrenamiento Finalizado! ¡Buen trabajo!');
      router.push('/member');
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setIsActive(false);
    setTimer(60);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <h1 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Entrenamiento A</h1>
          <p className="font-bold text-lg">Pecho y Tríceps</p>
        </div>
        <Button variant="ghost" size="icon">
          <Info className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      <Progress value={progress} className="h-1 mb-6" />

      <AnimatePresence mode="wait">
        {!isResting ? (
          <motion.div 
            key="exercise"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col space-y-6"
          >
            {/* Exercise Visual */}
            <div className="aspect-video bg-secondary rounded-3xl overflow-hidden relative group">
              <img 
                src={currentExercise.video} 
                alt={currentExercise.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                VIDEO GUÍA
              </div>
            </div>

            {/* Exercise Details */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{currentExercise.name}</h2>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Serie {currentSet} de {currentExercise.sets}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {currentExercise.reps} reps</span>
              </div>
            </div>

            {/* Input Section */}
            <div className="gym-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" /> Anterior: {currentExercise.lastWeight}
                </span>
                <span className="text-primary text-xs font-bold underline">Historial</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={currentExercise.lastWeight.replace('kg', '')}
                    className="w-full h-14 bg-secondary border-none rounded-2xl px-6 text-xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-center"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">KG</span>
                </div>
              </div>

              <Button 
                onClick={handleSetComplete}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                Completar Serie
              </Button>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <p className="text-xs text-amber-500 font-medium">💡 <b>Tip:</b> {currentExercise.notes}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="rest"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center space-y-10"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Descanso</h3>
              <p className="text-4xl font-black text-primary">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-secondary"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={754}
                  initial={{ strokeDashoffset: 754 }}
                  animate={{ strokeDashoffset: 754 * (1 - timer / 60) }}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="w-12 h-12 rounded-full"
                  onClick={() => setIsActive(!isActive)}
                >
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="w-12 h-12 rounded-full"
                  onClick={() => setTimer(60)}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Siguiente:</p>
              <p className="font-bold">{currentExercise.name} - Serie {currentSet}</p>
            </div>

            <Button variant="ghost" className="text-primary font-bold" onClick={skipRest}>
              Omitir Descanso
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <MemberNavbar />
    </div>
  );
}

import MemberNavbar from '@/components/layout/MemberNavbar';
