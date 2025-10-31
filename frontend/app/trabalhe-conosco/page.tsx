'use client';

import Link from 'next/link';
import { Brain, ArrowLeft, Briefcase, Users, Zap, Heart, TrendingUp, Globe, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TrabalheConoscoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    vaga: '',
    linkedin: '',
    portfolio: '',
    mensagem: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envio do formulário
    console.log('Formulário enviado:', formData);
    alert('Obrigado pelo seu interesse! Entraremos em contato em breve.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Brain className="h-8 w-8 text-violet-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                CardFlow
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl mb-4">
              <Briefcase className="h-12 w-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Trabalhe Conosco
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Junte-se a uma equipe apaixonada por transformar a educação através da tecnologia.
              Estamos sempre em busca de talentos excepcionais!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Por que trabalhar no CardFlow?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={<Users className="h-8 w-8" />}
              title="Time Colaborativo"
              description="Trabalhe com profissionais talentosos em um ambiente inclusivo e respeitoso"
              delay={0.1}
            />
            <BenefitCard
              icon={<Zap className="h-8 w-8" />}
              title="Inovação Constante"
              description="Utilize as tecnologias mais modernas e participe de projetos desafiadores"
              delay={0.2}
            />
            <BenefitCard
              icon={<Heart className="h-8 w-8" />}
              title="Bem-estar"
              description="Horários flexíveis, home office e cultura que valoriza equilíbrio"
              delay={0.3}
            />
            <BenefitCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Crescimento"
              description="Plano de carreira estruturado com oportunidades de desenvolvimento"
              delay={0.4}
            />
            <BenefitCard
              icon={<Globe className="h-8 w-8" />}
              title="Impacto Global"
              description="Seus projetos impactam milhares de estudantes ao redor do mundo"
              delay={0.5}
            />
            <BenefitCard
              icon={<Briefcase className="h-8 w-8" />}
              title="Benefícios"
              description="Vale alimentação, plano de saúde, auxílio educação e muito mais"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Vagas Abertas
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Confira nossas oportunidades atuais
            </p>
          </motion.div>

          <div className="space-y-6">
            <JobCard
              title="Desenvolvedor(a) Full Stack"
              department="Engenharia"
              location="Remoto • São Paulo, SP"
              type="CLT • Tempo Integral"
              description="Buscamos desenvolvedor(a) experiente em React, Next.js, Node.js e Laravel para construir features inovadoras."
              requirements={[
                '3+ anos de experiência com desenvolvimento web',
                'Domínio de TypeScript, React e Next.js',
                'Experiência com APIs RESTful e GraphQL',
                'Conhecimento em testes automatizados',
              ]}
              delay={0.1}
            />

            <JobCard
              title="Designer UI/UX"
              department="Produto"
              location="Remoto • São Paulo, SP"
              type="CLT • Tempo Integral"
              description="Procuramos designer criativo para criar experiências incríveis e interfaces intuitivas para nossos usuários."
              requirements={[
                '2+ anos de experiência em design de produto',
                'Portfolio com casos de estudo detalhados',
                'Proficiência em Figma e ferramentas de prototipagem',
                'Conhecimento de design systems e acessibilidade',
              ]}
              delay={0.2}
            />

            <JobCard
              title="Engenheiro(a) de Machine Learning"
              department="IA & Data Science"
              location="Remoto • São Paulo, SP"
              type="CLT • Tempo Integral"
              description="Oportunidade para trabalhar com algoritmos de aprendizado e personalização da experiência de estudo."
              requirements={[
                'Mestrado ou experiência equivalente em ML/AI',
                'Forte conhecimento em Python, TensorFlow/PyTorch',
                'Experiência com sistemas de recomendação',
                'Publicações ou projetos open source são um plus',
              ]}
              delay={0.3}
            />

            <JobCard
              title="Product Manager"
              department="Produto"
              location="Híbrido • São Paulo, SP"
              type="CLT • Tempo Integral"
              description="Lidere o desenvolvimento de produtos que impactam a jornada de aprendizado de milhares de estudantes."
              requirements={[
                '3+ anos de experiência como PM em produtos digitais',
                'Capacidade analítica e tomada de decisão baseada em dados',
                'Excelentes habilidades de comunicação e liderança',
                'Experiência em EdTech é um diferencial',
              ]}
              delay={0.4}
            />

            <JobCard
              title="DevOps Engineer"
              department="Infraestrutura"
              location="Remoto • São Paulo, SP"
              type="CLT • Tempo Integral"
              description="Ajude-nos a escalar nossa infraestrutura e manter alta disponibilidade para nossos usuários globais."
              requirements={[
                '3+ anos de experiência com AWS/Azure/GCP',
                'Experiência com Docker, Kubernetes e CI/CD',
                'Conhecimento em monitoramento e observabilidade',
                'Scripting com Python, Bash ou similar',
              ]}
              delay={0.5}
            />

            <JobCard
              title="Customer Success Manager"
              department="Sucesso do Cliente"
              location="Remoto • São Paulo, SP"
              type="CLT • Tempo Integral"
              description="Seja o elo entre nossos usuários e o produto, garantindo satisfação e sucesso contínuo."
              requirements={[
                '2+ anos de experiência em CS ou suporte técnico',
                'Excelente comunicação escrita e verbal',
                'Capacidade de entender necessidades dos usuários',
                'Conhecimento básico de métricas SaaS (NPS, churn, etc)',
              ]}
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Candidate-se
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Não encontrou a vaga ideal? Envie seu currículo mesmo assim!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="telefone"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label
                    htmlFor="vaga"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Vaga de Interesse *
                  </label>
                  <select
                    id="vaga"
                    name="vaga"
                    required
                    value={formData.vaga}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione uma vaga</option>
                    <option value="fullstack">Desenvolvedor(a) Full Stack</option>
                    <option value="uiux">Designer UI/UX</option>
                    <option value="ml">Engenheiro(a) de Machine Learning</option>
                    <option value="pm">Product Manager</option>
                    <option value="devops">DevOps Engineer</option>
                    <option value="cs">Customer Success Manager</option>
                    <option value="outro">Outra oportunidade</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="linkedin.com/in/seu-perfil"
                  />
                </div>

                <div>
                  <label
                    htmlFor="portfolio"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Portfolio / GitHub
                  </label>
                  <input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="github.com/seu-perfil"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mensagem"
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Por que você quer trabalhar no CardFlow? *
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  required
                  rows={6}
                  value={formData.mensagem}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  placeholder="Conte-nos sobre sua experiência, motivação e o que você pode trazer para o time..."
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                <span>Enviar Candidatura</span>
              </motion.button>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Ao enviar, você concorda com nossa{' '}
                <Link href="/privacidade" className="text-violet-600 dark:text-violet-400 hover:underline">
                  Política de Privacidade
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-violet-400" />
            <span className="text-xl font-bold text-white">CardFlow</span>
          </div>
          <p className="text-sm">© 2025 CardFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function BenefitCard({
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="text-violet-600 dark:text-violet-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}

function JobCard({
  title,
  department,
  location,
  type,
  description,
  requirements,
  delay,
}: {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-3 py-1 rounded-full">
                {department}
              </span>
              <span>{location}</span>
              <span>•</span>
              <span>{type}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requisitos:</h4>
          <ul className="space-y-2">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-violet-600 dark:text-violet-400 mt-1">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
