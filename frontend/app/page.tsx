'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Brain, Mic, Zap, BarChart3, Shield, Sparkles, ArrowRight, Star, TrendingUp, Users, Volume2, BookOpen, Lightbulb, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Componente de Cards 3D Animados
function AnimatedCardsStack() {
  const [activeCard, setActiveCard] = useState(0);
  
  const cards = [
    {
      id: 1,
      gradient: 'from-violet-500 via-purple-500 to-pink-500',
      icon: <Brain className="w-12 h-12" />,
      title: 'Neurociência',
      question: 'Como funciona a memória de longo prazo?',
      answer: 'A consolidação através da repetição espaçada',
      category: 'Ciência',
      stats: { mastery: 85, reviews: 12 }
    },
    {
      id: 2,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      icon: <Lightbulb className="w-12 h-12" />,
      question: 'E = mc²',
      answer: 'Equação de Einstein relacionando energia e massa',
      category: 'Física',
      stats: { mastery: 92, reviews: 8 }
    },
    {
      id: 3,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      icon: <BookOpen className="w-12 h-12" />,
      question: 'O que é inteligência artificial?',
      answer: 'Simulação de processos de inteligência humana por máquinas',
      category: 'Tecnologia',
      stats: { mastery: 78, reviews: 15 }
    },
    {
      id: 4,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      icon: <Award className="w-12 h-12" />,
      question: 'Qual a capital da França?',
      answer: 'Paris',
      category: 'Geografia',
      stats: { mastery: 95, reviews: 5 }
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      {/* Glow Effect - Otimizado com animação de entrada */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1]
        }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          delay: 0.2
        }}
        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[3rem] blur-[80px] will-change-transform"
      />

      {/* Cards Stack */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-sm md:max-w-md h-[500px] mx-auto"
      >
        {cards.map((card, index) => {
          const offset = index - activeCard;
          const isActive = index === activeCard;
          
          return (
            <motion.div
              key={card.id}
              initial={false}
              animate={{
                rotateY: offset * 15,
                rotateX: offset * 5,
                scale: 1 - Math.abs(offset) * 0.1,
                z: -Math.abs(offset) * 100,
                opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                x: offset * 30,
                y: Math.abs(offset) * 20,
              }}
              transition={{
                duration: 0.6,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="absolute inset-0 cursor-pointer will-change-transform"
              style={{
                transformStyle: 'preserve-3d',
                zIndex: cards.length - Math.abs(offset),
              }}
              onClick={() => setActiveCard(index)}
            >
              {/* Card Container with Glass Effect */}
              <div className="relative w-full h-full group">
                {/* Glow on Hover - Simplificado */}
                {isActive && (
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-3xl blur-xl will-change-transform`}
                  />
                )}

                {/* Main Card */}
                <div className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${card.gradient} p-1 shadow-2xl overflow-hidden`}>
                  {/* Inner Card */}
                  <div className="w-full h-full bg-gray-900/95 backdrop-blur-xl rounded-[1.4rem] p-5 md:p-8 flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-white">
                          {card.icon}
                        </div>
                        <div>
                          <div className="text-white/60 text-sm font-medium">{card.category}</div>
                          <div className="text-white font-semibold">{card.title}</div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Volume2 className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex items-center justify-center py-6 md:py-8">
                      <motion.div
                        animate={{
                          scale: isActive ? [1, 1.02, 1] : 1,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="text-center px-2"
                      >
                        <div className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">
                          {card.question}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{
                            opacity: isActive ? [0, 1] : 0,
                            height: isActive ? 'auto' : 0,
                          }}
                          transition={{
                            delay: isActive ? 1 : 0,
                            duration: 0.5,
                          }}
                          className="text-white/70 text-sm md:text-lg overflow-hidden"
                        >
                          {card.answer}
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Domínio</span>
                          <span className="text-white font-semibold">{card.stats.mastery}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isActive ? `${card.stats.mastery}%` : 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Difficulty Rating */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-white/80 text-sm font-medium mb-2">
                            Qual foi a dificuldade desta pergunta?
                          </div>
                        </div>
                        <div className="flex justify-center gap-1.5 md:gap-2">
                          {[1, 2, 3, 4, 5].map((difficulty) => (
                            <motion.button
                              key={difficulty}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`group relative w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl transition-all flex items-center justify-center ${
                                difficulty === 1
                                  ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                  : difficulty === 2
                                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                  : difficulty === 3
                                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                                  : difficulty === 4
                                  ? 'bg-gradient-to-br from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700'
                                  : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                              } shadow-lg hover:shadow-xl`}
                            >
                              <span className="text-white font-bold text-xl md:text-2xl">{difficulty}</span>
                              {/* Tooltip */}
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                {difficulty === 1
                                  ? 'Muito Difícil'
                                  : difficulty === 2
                                  ? 'Difícil'
                                  : difficulty === 3
                                  ? 'Moderado'
                                  : difficulty === 4
                                  ? 'Fácil'
                                  : 'Muito Fácil'}
                                {/* Seta do tooltip */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-white/50 px-1">
                          <span>Muito Difícil</span>
                          <span>Muito Fácil</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Card Indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute -bottom-12 md:-bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3"
      >
        {cards.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveCard(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeCard ? 'w-8 bg-violet-500' : 'w-2 bg-white/30'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </motion.div>

      {/* Navigation Arrows */}
      <motion.button
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveCard((prev) => (prev - 1 + cards.length) % cards.length)}
        className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>
      <motion.button
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveCard((prev) => (prev + 1) % cards.length)}
        className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  );
}

// Componente de Rede Neural Animada
function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Criar neurônios (pontos)
    const neurons: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const neuronCount = 50;
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    // Função de animação
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atualizar e desenhar neurônios
      neurons.forEach((neuron, i) => {
        // Mover neurônio
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;

        // Fazer neurônio rebater nas bordas
        if (neuron.x < 0 || neuron.x > canvas.width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > canvas.height) neuron.vy *= -1;

        // Desenhar conexões com neurônios próximos
        neurons.slice(i + 1).forEach((otherNeuron) => {
          const dx = neuron.x - otherNeuron.x;
          const dy = neuron.y - otherNeuron.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.3;
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`; // violet-500
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(neuron.x, neuron.y);
            ctx.lineTo(otherNeuron.x, otherNeuron.y);
            ctx.stroke();
          }
        });

        // Desenhar neurônio
        ctx.fillStyle = 'rgba(139, 92, 246, 0.6)'; // violet-500
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
        ctx.fill();

        // Adicionar brilho ao neurônio
        const gradient = ctx.createRadialGradient(
          neuron.x,
          neuron.y,
          0,
          neuron.x,
          neuron.y,
          neuron.radius * 3
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
        />
        
        {/* Rede Neural Animada */}
        <NeuralNetwork />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Image 
                src="/logo-white.png" 
                alt="CardFlow Logo" 
                width={400}
                height={120}
                className="h-24 w-auto"
                priority
              />
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg"
                >
                  Começar Agora
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-4 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full"
                >
                  <span className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    IA-Powered Learning
                  </span>
                </motion.div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    Flashcards
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    Inteligentes
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="block text-gray-900 dark:text-white"
                  >
                    com IA de Leitura
                  </motion.span>
                </h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-xl md:text-2xl text-gray-600 text-gray-300 mb-8 max-w-2xl"
                >
                  CardFlow - Revolucione seus estudos com revisão espacial, áudio inteligente e estatísticas
                  avançadas. Aprenda mais rápido, retenha por mais tempo.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      <span>Começar Gratuitamente</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="#features"
                      className="border-2 border-violet-600 text-violet-600 dark:text-violet-400 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Ver Funcionalidades</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Animated 3D Cards Stack */}
            <div className="relative h-[500px] md:h-[600px] mt-12 lg:mt-0">
              <AnimatedCardsStack />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-4 gap-8"
          >
            <StatCard
              icon={<Users className="h-8 w-8" />}
              value="10K+"
              label="Estudantes Ativos"
            />
            <StatCard
              icon={<Brain className="h-8 w-8" />}
              value="1M+"
              label="Cards Criados"
            />
            <StatCard
              icon={<TrendingUp className="h-8 w-8" />}
              value="95%"
              label="Taxa de Retenção"
            />
            <StatCard
              icon={<Star className="h-8 w-8" />}
              value="4.9"
              label="Avaliação Média"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600 text-gray-300 max-w-2xl mx-auto">
              Tudo que você precisa para maximizar seu aprendizado e retenção de conhecimento
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="h-8 w-8" />}
              title="IA de Leitura"
              description="Ouça seus cards com vozes naturais. Configure velocidade, idioma e tempo de resposta personalizado."
              delay={0.1}
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Revisão Espacial"
              description="Sistema SRS inteligente que otimiza seu aprendizado baseado na curva de esquecimento."
              delay={0.2}
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Modo Turbo"
              description="Estude rapidamente com respostas instantâneas e transições suaves entre cards."
              delay={0.3}
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Estatísticas"
              description="Acompanhe seu progresso com gráficos detalhados e métricas de retenção."
              delay={0.4}
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Seguro & Privado"
              description="Seus dados protegidos com criptografia de ponta a ponta e autenticação JWT."
              delay={0.5}
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Multi-plataforma"
              description="Acesse seus decks em qualquer lugar: web, mobile Android e iOS."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 text-gray-300 max-w-2xl mx-auto">
              Três passos simples para transformar seu aprendizado
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Crie seus Decks"
              description="Organize seus flashcards em decks personalizados por matéria ou tema"
              delay={0.2}
            />
            <StepCard
              number="2"
              title="Estude com IA"
              description="Use revisão espacial inteligente e áudio gerado por IA para maximizar a retenção"
              delay={0.4}
            />
            <StepCard
              number="3"
              title="Acompanhe Progresso"
              description="Visualize estatísticas detalhadas e veja seu conhecimento crescer"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para Revolucionar seus Estudos?
            </h2>
            <p className="text-xl text-violet-100 mb-8">
              Junte-se a milhares de estudantes que já melhoraram seu aprendizado com o CardFlow.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="bg-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-violet-700 transition-all shadow-lg inline-flex items-center gap-2"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Brand Column */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Image 
                    src="/logo-white.png" 
                    alt="CardFlow Logo" 
                    width={300}
                    height={100}
                    className="h-24 w-auto"
                  />
                </div>
                <p className="text-gray-400 mb-4">
                  Revolucione seus estudos com flashcards inteligentes e IA de leitura.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product Column */}
              <div>
                <h3 className="text-white font-semibold mb-4">Produto</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Funcionalidades
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Preços
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Roadmap
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="text-white font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Sobre Nós
                    </a>
                  </li>
                  <li>
                    <Link href="/trabalhe-conosco" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Trabalhe Conosco
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Contato
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/termos" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Termos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidade" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Política de Privacidade
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      Cookies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                      LGPD
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-400 mb-4 md:mb-0">
                  © 2025 CardFlow. Todos os direitos reservados.
                </p>
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
                    Status
                  </a>
                  <a href="#" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
                    Suporte
                  </a>
                  <a href="#" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
                    Documentação
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 border-gray-700 text-center"
    >
      <div className="text-violet-600 dark:text-violet-400 mb-3 flex justify-center">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className="group p-6 rounded-2xl border border-gray-200 border-gray-700 hover:border-violet-300 hover:border-violet-600 transition-all hover:shadow-2xl bg-gray-800 relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      />
      <div className="relative z-10">
        <div className="text-violet-600 dark:text-violet-400 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="bg-gradient-to-br from-violet-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 text-gray-300">{description}</p>
      
      {number !== "3" && (
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-violet-600 to-purple-600"
          style={{ transformOrigin: "left" }}
        />
      )}
    </motion.div>
  );
}
