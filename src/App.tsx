/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  X, 
  Send,
  ArrowRight,
  User,
  ShieldCheck,
  Stethoscope,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type RiskLevel = 'low' | 'attention' | 'seek_help' | null;

interface QuizQuestion {
  id: number;
  text: string;
  options: { text: string; risk: 'low' | 'high' }[];
}

interface Testimonial {
  id: number;
  name: string;
  age: number;
  text: string;
  image: string;
}

// --- Data ---
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "Quando foi a última vez que você realizou o exame preventivo (Papanicolau)?",
    options: [
      { text: "Há menos de 1 ano", risk: 'low' },
      { text: "Entre 1 e 3 anos", risk: 'low' },
      { text: "Há mais de 3 anos ou nunca fiz", risk: 'high' }
    ]
  },
  {
    id: 2,
    text: "Você possui alguma condição que afete sua imunidade (como doenças crônicas) ou tem o hábito de fumar?",
    options: [
      { text: "Não, nenhuma dessas condições", risk: 'low' },
      { text: "Sim, sou fumante", risk: 'high' },
      { text: "Sim, tenho baixa imunidade", risk: 'high' },
      { text: "Sim, ambas as opções", risk: 'high' }
    ]
  },
  {
    id: 3,
    text: "Você tem notado algum sintoma incomum, como sangramento fora do período menstrual ou dor?",
    options: [
      { text: "Não, nenhum sintoma", risk: 'low' },
      { text: "Sim, notei algo diferente recentemente", risk: 'high' }
    ]
  },
  {
    id: 4,
    text: "Você completou o esquema vacinal contra o HPV (geralmente oferecido na adolescência)?",
    options: [
      { text: "Sim, tomei todas as doses", risk: 'low' },
      { text: "Não ou não tenho certeza", risk: 'high' }
    ]
  }
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Maria Silva",
    age: 42,
    text: "Descobri uma alteração no meu preventivo de rotina. Graças ao diagnóstico precoce, o tratamento foi simples e hoje estou curada. Não deixe para depois!",
    image: "https://picsum.photos/seed/woman1/100/100"
  },
  {
    id: 2,
    name: "Ana Oliveira",
    age: 35,
    text: "Eu tinha medo do exame, achava que ia doer. Mas a enfermeira foi tão gentil e o processo foi rápido. Saber que estou bem me traz paz.",
    image: "https://picsum.photos/seed/woman2/100/100"
  }
];

// --- Components ---

const Chatbot = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Olá! Sou sua assistente virtual. Estou aqui para tirar suas dúvidas sobre o câncer do colo do útero com carinho e clareza. Como posso te ajudar hoje?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "Você é uma assistente de saúde empática e acolhedora chamada 'Cuidar de Si'. Seu objetivo é educar mulheres sobre o câncer do colo do útero e HPV de forma simples, sem termos técnicos complicados. Seja sempre encorajadora e nunca alarmista. Se a usuária relatar sintomas graves, recomende gentilmente que ela procure um médico. Fale em Português do Brasil.",
        },
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "Desculpe, tive um probleminha. Pode repetir?" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Estou com um pouco de dificuldade para me conectar agora, mas lembre-se: prevenir é o melhor caminho!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-pink-100 overflow-hidden"
        >
          <div className="bg-pink-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="font-medium">Conversa Acolhedora</span>
            </div>
            <button onClick={onClose} className="hover:bg-pink-600 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-pink-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 shadow-sm border border-pink-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-pink-100 rounded-tl-none">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex gap-1"
                  >
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-pink-100 bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tire sua dúvida aqui..."
                className="flex-1 text-sm border border-pink-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button 
                onClick={handleSend}
                className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'quiz' | 'result' | 'education'>('home');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(null);
  const [feedback, setFeedback] = useState<{ exam: string; health: string; symptoms: string; vaccine: string }>({
    exam: '',
    health: '',
    symptoms: '',
    vaccine: ''
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const startQuiz = () => {
    setQuizAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentScreen('quiz');
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...quizAnswers, idx];
    setQuizAnswers(newAnswers);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (answers: number[]) => {
    // answers[0] -> Q1 (Exam)
    // answers[1] -> Q2 (Health/Immunity/Smoking)
    // answers[2] -> Q3 (Symptoms)
    // answers[3] -> Q4 (Vaccine)

    const newFeedback = {
      exam: '',
      health: '',
      symptoms: '',
      vaccine: ''
    };

    // 1. Exam Feedback
    if (answers[0] === 0) {
      newFeedback.exam = "Seu preventivo está em dia! Isso é excelente para sua proteção.";
    } else if (answers[0] === 1) {
      newFeedback.exam = "Seu preventivo está no limite (1 a 3 anos). É uma boa hora para planejar o próximo.";
    } else {
      newFeedback.exam = "Seu preventivo está atrasado ou você nunca o fez. Agendar este exame é o passo mais importante agora.";
    }

    // 2. Health Feedback
    if (answers[1] === 0) {
      newFeedback.health = "Você não possui fatores de risco adicionais como fumo ou baixa imunidade.";
    } else if (answers[1] === 1) {
      newFeedback.health = "O hábito de fumar aumenta o risco de persistência de lesões. Considere buscar ajuda para parar.";
    } else if (answers[1] === 2) {
      newFeedback.health = "A baixa imunidade exige um acompanhamento médico mais atento e frequente.";
    } else {
      newFeedback.health = "Fumar e ter baixa imunidade aumentam significativamente os riscos. O acompanhamento regular é vital.";
    }

    // 3. Symptoms
    if (answers[2] === 1) {
      newFeedback.symptoms = "Você relatou sintomas incomuns. É fundamental descrevê-los a um médico em breve.";
    }

    // 4. Vaccine
    if (answers[3] === 1) {
      newFeedback.vaccine = "A vacina do HPV é uma proteção extra importante. Se você estiver na faixa etária, considere se vacinar.";
    }

    setFeedback(newFeedback);

    // Overall Risk Level for UI
    const highRiskAnswers = answers.filter((ans, i) => QUIZ_QUESTIONS[i].options[ans].risk === 'high').length;
    if (highRiskAnswers === 0) setRiskLevel('low');
    else if (highRiskAnswers <= 2) setRiskLevel('attention');
    else setRiskLevel('seek_help');

    setCurrentScreen('result');
  };

  const setReminder = () => {
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans text-gray-800 selection:bg-pink-200">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-pink-600 font-bold text-xl">
            <Heart fill="currentColor" size={24} />
            <span>Cuidar de Si</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => setCurrentScreen('home')} className="hover:text-pink-500 transition-colors">Início</button>
            <button onClick={() => setCurrentScreen('education')} className="hover:text-pink-500 transition-colors">Aprender</button>
            <button onClick={() => setIsChatOpen(true)} className="hover:text-pink-500 transition-colors">Dúvidas</button>
          </nav>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-pink-100 text-pink-600 p-2 rounded-full md:hidden"
          >
            <MessageCircle size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* 1. Impactful Entry Screen */}
          {currentScreen === 'home' && (
            <motion.section 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 py-12"
            >
              <div className="text-center space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight"
                >
                  Você sabe como está a sua <span className="text-pink-500 italic">saúde</span> hoje?
                </motion.h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Cuidar de si é um ato de amor. O câncer do colo do útero é silencioso, mas a prevenção é poderosa e salva vidas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button 
                    onClick={startQuiz}
                    className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all flex items-center justify-center gap-2 group"
                  >
                    Fazer Avaliação Rápida
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('education')}
                    className="bg-white text-pink-600 border-2 border-pink-100 px-8 py-4 rounded-full font-bold hover:border-pink-200 transition-all"
                  >
                    Quero me Informar
                  </button>
                </div>
              </div>

              {/* Visual Accent */}
              <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200" 
                  alt="Mulher sorrindo e cuidando da saúde" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm font-medium uppercase tracking-widest opacity-80">Prevenção é Vida</p>
                  <h2 className="text-2xl font-bold">O diagnóstico precoce aumenta as chances de cura em até 100%.</h2>
                </div>
              </div>
            </motion.section>
          )}

          {/* 2. Interactive Self-Assessment */}
          {currentScreen === 'quiz' && (
            <motion.section 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-50">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Questão {currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}</span>
                  <div className="flex gap-1">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= currentQuestionIndex ? 'bg-pink-500' : 'bg-pink-100'}`} />
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">
                  {QUIZ_QUESTIONS[currentQuestionIndex].text}
                </h2>

                <div className="space-y-4">
                  {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full text-left p-5 rounded-2xl border-2 border-pink-50 hover:border-pink-300 hover:bg-pink-50/50 transition-all flex justify-between items-center group"
                    >
                      <span className="font-medium text-gray-700">{option.text}</span>
                      <ChevronRight className="text-pink-300 group-hover:text-pink-500 transition-colors" size={20} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Quiz Result */}
          {currentScreen === 'result' && (
            <motion.section 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-12 text-center"
            >
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-pink-50 space-y-8">
                <div className="flex justify-center">
                  {riskLevel === 'low' && (
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={48} />
                    </div>
                  )}
                  {riskLevel === 'attention' && (
                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                      <AlertCircle size={48} />
                    </div>
                  )}
                  {riskLevel === 'seek_help' && (
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                      <AlertCircle size={48} />
                    </div>
                  )}
                </div>

                <div className="space-y-6 text-left">
                  <h2 className="text-3xl font-bold text-gray-900 text-center">
                    {riskLevel === 'low' && "Tudo parece em ordem!"}
                    {riskLevel === 'attention' && "Atenção necessária"}
                    {riskLevel === 'seek_help' && "Procure orientação médica"}
                  </h2>
                  
                  <div className="space-y-4 bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-pink-600 uppercase text-xs tracking-widest">Resumo da sua Avaliação</h4>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Calendar className="text-pink-400 flex-shrink-0" size={18} />
                        <p className="text-sm text-gray-700">{feedback.exam}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <ShieldCheck className="text-pink-400 flex-shrink-0" size={18} />
                        <p className="text-sm text-gray-700">{feedback.health}</p>
                      </div>

                      {feedback.symptoms && (
                        <div className="flex gap-3">
                          <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                          <p className="text-sm text-gray-700 font-medium">{feedback.symptoms}</p>
                        </div>
                      )}

                      {feedback.vaccine && (
                        <div className="flex gap-3">
                          <Info className="text-blue-400 flex-shrink-0" size={18} />
                          <p className="text-sm text-gray-700">{feedback.vaccine}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => setCurrentScreen('education')}
                    className="bg-pink-500 text-white py-4 rounded-full font-bold hover:bg-pink-600 transition-colors"
                  >
                    Ver Guia de Ação
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('home')}
                    className="text-gray-500 font-medium hover:text-pink-500 transition-colors"
                  >
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* 3. Simple Educational Content & 4. Step-by-Step Guide */}
          {currentScreen === 'education' && (
            <motion.section 
              key="education"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16 py-8"
            >
              {/* Educational Intro */}
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-serif font-bold text-gray-900">Papo Reto: Entenda sem Complicação</h2>
                  <p className="text-gray-600 max-w-xl mx-auto text-lg">Saber o que está acontecendo com o nosso corpo é o primeiro passo para se cuidar. Vamos conversar?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50 space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                      <Info size={28} />
                    </div>
                    <h3 className="text-2xl font-bold">Afinal, o que é isso?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      O câncer do colo do útero não aparece do nada. Ele é como uma plantinha que cresce bem devagar. Antes de virar um problema sério, ele dá sinais minúsculos nas células que só o exame consegue ver. Por isso, se a gente descobre no começo, a chance de cura é quase total!
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50 space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                      <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-2xl font-bold">O tal do HPV</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Quase todo mundo que tem uma vida sexual ativa vai ter contato com o HPV em algum momento. Não é motivo para pânico ou vergonha! Na maioria das vezes, o corpo expulsa o vírus sozinho. O problema é quando ele resolve "morar" ali por muito tempo. É aí que ele pode causar as alterações.
                    </p>
                  </div>
                </div>

                {/* Myths vs Truths */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-pink-50 space-y-8">
                  <h3 className="text-2xl font-bold text-center">Mitos e Verdades</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <div className="bg-red-100 text-red-600 p-1 rounded-full mt-1"><X size={16} /></div>
                        <div>
                          <p className="font-bold text-gray-800">"Só quem tem muitos parceiros pega HPV."</p>
                          <p className="text-sm text-gray-500">Mito! Uma única relação sem proteção já é suficiente. O vírus é muito comum.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="bg-red-100 text-red-600 p-1 rounded-full mt-1"><X size={16} /></div>
                        <div>
                          <p className="font-bold text-gray-800">"O exame dói muito."</p>
                          <p className="text-sm text-gray-500">Mito! Pode ser um pouco desconfortável ou dar uma pressãozinha, mas é muito rápido.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <div className="bg-green-100 text-green-600 p-1 rounded-full mt-1"><CheckCircle2 size={16} /></div>
                        <div>
                          <p className="font-bold text-gray-800">"A vacina protege contra o câncer."</p>
                          <p className="text-sm text-gray-500">Verdade! A vacina evita os tipos mais perigosos de HPV que causam o câncer.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="bg-green-100 text-green-600 p-1 rounded-full mt-1"><CheckCircle2 size={16} /></div>
                        <div>
                          <p className="font-bold text-gray-800">"O preservativo ajuda a prevenir."</p>
                          <p className="text-sm text-gray-500">Verdade! Ele não protege 100% (pois o vírus pode estar na pele ao redor), mas reduz muito o risco.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-500 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-bold">Por que o exame é o seu melhor amigo?</h3>
                    <p className="text-pink-100">
                      O câncer do colo do útero é traiçoeiro porque ele não avisa quando chega. Ele não faz barulho, não dói e não coça no começo. 
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-lg mt-1"><CheckCircle2 size={20} /></div>
                        <span>O Papanicolau "enxerga" o que a gente não sente.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-lg mt-1"><CheckCircle2 size={20} /></div>
                        <span>Ele descobre as feridinhas antes delas virarem câncer.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-lg mt-1"><CheckCircle2 size={20} /></div>
                        <span>É um tempinho curto que você tira para garantir anos de tranquilidade.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="w-full md:w-1/3 aspect-square bg-white/20 rounded-3xl flex items-center justify-center">
                    <Stethoscope size={100} className="text-white/40" />
                  </div>
                </div>

                {/* Preparation Tips */}
                <div className="bg-purple-50 p-8 md:p-12 rounded-[2.5rem] border border-purple-100 space-y-6">
                  <h3 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                    <Clock className="text-purple-500" />
                    Dicas para o dia do exame
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm">
                      <p className="font-bold text-purple-700 mb-2">Quando ir?</p>
                      <p className="text-sm text-gray-600">Não pode estar menstruada. O ideal é ir pelo menos 5 dias após o fim da menstruação.</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm">
                      <p className="font-bold text-purple-700 mb-2">O que evitar?</p>
                      <p className="text-sm text-gray-600">Nas 48h antes, evite relações sexuais, duchas vaginais ou cremes/pomadas na região.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Step-by-Step Guide (Timeline) */}
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-serif font-bold text-gray-900">Como funciona na prática?</h2>
                  <p className="text-gray-600">Não precisa ter medo do desconhecido. Veja como é simples o caminho.</p>
                </div>

                <div className="relative space-y-8 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-pink-200 md:before:left-1/2">
                  {[
                    { title: "Procure um Posto de Saúde", desc: "Vá à Unidade Básica de Saúde (UBS) mais próxima. Não precisa de encaminhamento, é só chegar e pedir informação.", icon: MapPin },
                    { title: "Agende o Preventivo", desc: "O exame é gratuito no SUS para mulheres de 25 a 64 anos. Marque uma data que você esteja tranquila.", icon: Calendar },
                    { title: "Realize o Exame", desc: "O profissional usa um 'escovinha' para pegar uma amostra. Dura menos de 5 minutos!", icon: Stethoscope },
                    { title: "Busque o Resultado", desc: "Essa é a parte que muita gente esquece! Volte para pegar o laudo, mesmo que ache que está tudo bem.", icon: Clock },
                    { title: "Siga as Orientações", desc: "Se o resultado der alguma alteração, não se desespere. Muitas vezes é só uma inflamação comum.", icon: Heart },
                  ].map((step, i) => (
                    <div key={i} className={`relative flex items-center gap-8 md:justify-between ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="hidden md:block md:w-[45%]" />
                      <div className="absolute left-8 -translate-x-1/2 w-12 h-12 bg-white border-4 border-pink-500 rounded-full flex items-center justify-center z-10 md:left-1/2">
                        <step.icon size={20} className="text-pink-600" />
                      </div>
                      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-pink-50 md:w-[45%] md:flex-none">
                        <h4 className="font-bold text-lg text-pink-600 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Real-World Action */}
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-pink-100 text-center space-y-8">
                <h3 className="text-2xl font-bold">Pronta para agir?</h3>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button 
                    onClick={setReminder}
                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${
                      reminderSet ? 'bg-green-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    {reminderSet ? <CheckCircle2 size={20} /> : <Calendar size={20} />}
                    {reminderSet ? "Lembrete Ativado!" : "Me lembre de agendar"}
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all">
                    <MapPin size={20} />
                    Onde fazer o exame?
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  * Simulação: No app real, isso buscaria UBS via GPS ou enviaria uma notificação em 6 meses.
                </p>
              </div>

              {/* 6. Human Connection (Testimonials) */}
              <div className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-center">Vozes de Coragem</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {TESTIMONIALS.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 flex gap-4 italic text-gray-600">
                      <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-pink-100" referrerPolicy="no-referrer" />
                      <div className="space-y-2">
                        <p className="text-sm">"{t.text}"</p>
                        <p className="text-xs font-bold text-pink-500 not-italic">— {t.name}, {t.age} anos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="flex justify-center gap-4 text-pink-300">
            <Heart size={24} />
            <ShieldCheck size={24} />
            <User size={24} />
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Cuidar de Si - Saúde da Mulher. <br />
            Este aplicativo é educativo e não substitui uma consulta médica profissional.
          </p>
          <div className="flex justify-center gap-6 text-xs font-bold text-pink-400 uppercase tracking-widest">
            <button onClick={() => setCurrentScreen('home')} className="hover:text-pink-600">Início</button>
            <button onClick={() => setCurrentScreen('education')} className="hover:text-pink-600">Educação</button>
            <button className="hover:text-pink-600">Privacidade</button>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-pink-500 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-pink-600 transition-colors"
        >
          <MessageCircle size={28} />
        </motion.button>
      )}

      {/* Chatbot Modal */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
