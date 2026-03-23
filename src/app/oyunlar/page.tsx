'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, Gamepad2, ArrowLeft, Play, Users,
  Trophy, Star, Zap, Swords, Brain, Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-5"
        style={{
          width: Math.random() * 150 + 80,
          height: Math.random() * 150 + 80,
          background: ['#f97316', '#ec4899', '#06b6d4'][i % 3],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ 
          y: [0, -40, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: Math.random() * 4 + 3, repeat: Infinity }}
      />
    ))}
  </div>
);

const games = [
  { 
    id: 1, 
    title: 'Matematik Bowling', 
    grade: 5, 
    players: 1234, 
    rating: 4.9,
    type: 'Bireysel',
    color: 'from-orange-500 to-red-500',
    icon: Target,
    description: 'Topları vurarak matematik işlemlerini çöz'
  },
  { 
    id: 2, 
    title: 'Sayı Avı', 
    grade: 6, 
    players: 987, 
    rating: 4.8,
    type: 'Zamanlı',
    color: 'from-purple-500 to-pink-500',
    icon: Brain,
    description: 'Verilen sürede doğru sayıları bul'
  },
  { 
    id: 3, 
    title: 'Matematik Düellosu', 
    grade: 7, 
    players: 2345, 
    rating: 4.7,
    type: 'Çok Oyunculu',
    color: 'from-blue-500 to-cyan-500',
    icon: Swords,
    description: 'Arkadaşınla matematik yarışması yap'
  },
  { 
    id: 4, 
    title: 'Hafıza Oyunu', 
    grade: 5, 
    players: 876, 
    rating: 4.6,
    type: 'Bireysel',
    color: 'from-green-500 to-emerald-500',
    icon: Brain,
    description: 'Eşleşen kartları bul ve puan topla'
  },
  { 
    id: 5, 
    title: 'Denklem Balonları', 
    grade: 8, 
    players: 1567, 
    rating: 4.8,
    type: 'Zamanlı',
    color: 'from-yellow-500 to-orange-500',
    icon: Target,
    description: 'Patlayan balonlardaki denklemleri çöz'
  },
  { 
    id: 6, 
    title: 'Faktoriyel Yarışı', 
    grade: 7, 
    players: 654, 
    rating: 4.5,
    type: 'Zamanlı',
    color: 'from-cyan-500 to-blue-500',
    icon: Zap,
    description: 'En hızlı faktoriyel hesaplayan kazanır'
  },
];

export default function GamesPage() {
  const [user, setUser] = useState<any>(null);
  const [hoveredGame, setHoveredGame] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/giris');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUser({ ...profile, email: session.user.email });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: session.user.user_metadata?.grade ?? 5
        });
      }
    };
    checkSession();
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen gradient-bg pb-20">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/profil" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MatematikLab
            </span>
          </Link>

          <Link href="/profil" className="text-slate-300 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Profil
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Eğlenceli Oyunlar</h1>
            <p className="text-slate-400">
              Oyna, eğlen ve matematik öğren!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.filter(g => g.grade === user.grade).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">{user.grade}. Sınıf İçin Oyun Bulunamadı</h3>
                <p className="text-slate-500">Yakında bu sınıf seviyesi için yeni oyunlar eklenecektir.</p>
              </div>
            ) : games.filter(g => g.grade === user.grade).map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onHoverStart={() => setHoveredGame(game.id)}
                onHoverEnd={() => setHoveredGame(null)}
                className="relative"
              >
                <motion.div
                  className="glass rounded-3xl overflow-hidden card-hover cursor-pointer"
                  animate={{
                    scale: hoveredGame === game.id ? 1.03 : 1,
                  }}
                >
                  <div className={`h-32 bg-gradient-to-br ${game.color} relative overflow-hidden`}>
                    <motion.div
                      className="absolute inset-0 bg-black/20"
                      animate={{
                        opacity: hoveredGame === game.id ? 0.3 : 0,
                      }}
                    />
                    
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        {game.type}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <game.icon className="w-16 h-16 text-white/30" />
                    </div>

                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        scale: hoveredGame === game.id ? 1.2 : 1,
                      }}
                    >
                      <div className={`w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
                        <Gamepad2 className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                        <p className="text-slate-400 text-sm">{game.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {game.players.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        {game.rating}
                      </span>
                      <span>{game.grade}. Sınıf</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 bg-gradient-to-r ${game.color} text-white font-semibold rounded-xl flex items-center justify-center gap-2`}
                    >
                      <Play className="w-5 h-5" />
                      Oyna
                    </motion.button>
                  </div>
                </motion.div>

                {game.type === 'Çok Oyunculu' && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Popüler
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 glass rounded-3xl p-8 text-center"
          >
            <div className="max-w-2xl mx-auto">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white mb-4">Liderlik Tablosu</h2>
              <p className="text-slate-400 mb-6">
                Oyunlarda en yüksek puanları topla ve sıralamada yerini al!
              </p>
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl glow-button"
                >
                  Sıralamayı Gör
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


    </main>
  );
}
