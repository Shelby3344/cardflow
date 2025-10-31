'use client';

import Link from 'next/link';
import { Brain, ArrowLeft, Scale, FileText, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermosPage() {
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl mb-4">
              <Scale className="h-12 w-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Termos de Uso
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Última atualização: 30 de outubro de 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-8 md:p-12 space-y-8">
              {/* Introdução */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    1. Introdução
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Bem-vindo ao CardFlow! Estes Termos de Uso ("Termos") regem seu acesso e uso da
                  plataforma CardFlow, incluindo nosso site, aplicativos móveis e todos os serviços
                  relacionados (coletivamente, os "Serviços"). Ao acessar ou usar nossos Serviços,
                  você concorda em estar vinculado a estes Termos.
                </p>
              </div>

              {/* Aceitação dos Termos */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Aceitação dos Termos
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  Ao criar uma conta ou usar nossos Serviços, você declara que:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Tem pelo menos 13 anos de idade</li>
                  <li>Possui capacidade legal para aceitar estes Termos</li>
                  <li>Não foi anteriormente suspenso ou removido dos Serviços</li>
                  <li>Seu uso dos Serviços está em conformidade com todas as leis aplicáveis</li>
                </ul>
              </div>

              {/* Contas de Usuário */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Contas de Usuário
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">3.1 Criação de Conta:</strong> Para
                    usar determinados recursos, você deve criar uma conta fornecendo informações precisas
                    e completas. Você é responsável por manter a confidencialidade de suas credenciais.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">3.2 Responsabilidade:</strong> Você
                    é responsável por todas as atividades que ocorrem em sua conta. Notifique-nos
                    imediatamente sobre qualquer uso não autorizado.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">3.3 Exclusão de Conta:</strong> Você
                    pode excluir sua conta a qualquer momento através das configurações. A exclusão é
                    permanente e irreversível.
                  </p>
                </div>
              </div>

              {/* Uso dos Serviços */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Uso dos Serviços
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">4.1 Licença:</strong> Concedemos a
                    você uma licença limitada, não exclusiva, intransferível e revogável para usar os
                    Serviços para fins pessoais e não comerciais.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">4.2 Restrições:</strong> Você
                    concorda em NÃO:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Usar os Serviços para qualquer finalidade ilegal</li>
                    <li>Violar direitos de propriedade intelectual</li>
                    <li>Tentar hackear ou comprometer a segurança dos Serviços</li>
                    <li>Enviar spam, malware ou conteúdo malicioso</li>
                    <li>Fazer engenharia reversa do software</li>
                    <li>Usar bots ou scripts automatizados sem autorização</li>
                    <li>Revender ou redistribuir os Serviços</li>
                  </ul>
                </div>
              </div>

              {/* Conteúdo do Usuário */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Conteúdo do Usuário
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">5.1 Propriedade:</strong> Você
                    mantém todos os direitos sobre o conteúdo que cria (flashcards, decks, anotações).
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">5.2 Licença para Nós:</strong> Ao
                    criar conteúdo, você nos concede uma licença mundial, livre de royalties para
                    hospedar, armazenar, processar e exibir seu conteúdo conforme necessário para
                    fornecer os Serviços.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">5.3 Responsabilidade:</strong> Você
                    é responsável por seu conteúdo e declara que possui todos os direitos necessários.
                  </p>
                </div>
              </div>

              {/* Planos e Pagamentos */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Planos e Pagamentos
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">6.1 Plano Gratuito:</strong> Oferecemos
                    funcionalidades básicas gratuitamente com algumas limitações.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">6.2 Planos Pagos:</strong> Recursos
                    premium estão disponíveis mediante assinatura. Os preços e recursos podem ser
                    alterados mediante aviso prévio de 30 dias.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">6.3 Reembolsos:</strong> Oferecemos
                    reembolso total dentro de 7 dias após a compra inicial. Após esse período, os
                    pagamentos não são reembolsáveis.
                  </p>
                </div>
              </div>

              {/* Propriedade Intelectual */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Propriedade Intelectual
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Os Serviços e todos os materiais relacionados (incluindo código, design, marcas,
                  logos e conteúdo) são de propriedade do CardFlow e protegidos por leis de direitos
                  autorais, marcas registradas e outras leis de propriedade intelectual.
                </p>
              </div>

              {/* Rescisão */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Rescisão
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Podemos suspender ou encerrar seu acesso aos Serviços imediatamente, sem aviso
                  prévio, por qualquer motivo, incluindo violação destes Termos. Você pode encerrar
                  sua conta a qualquer momento excluindo-a através das configurações.
                </p>
              </div>

              {/* Isenção de Garantias */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      9. Isenção de Garantias
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      OS SERVIÇOS SÃO FORNECIDOS "COMO ESTÃO" E "CONFORME DISPONÍVEIS". NÃO GARANTIMOS
                      QUE OS SERVIÇOS SERÃO ININTERRUPTOS, LIVRES DE ERROS OU SEGUROS. VOCÊ USA OS
                      SERVIÇOS POR SUA CONTA E RISCO.
                    </p>
                  </div>
                </div>
              </div>

              {/* Limitação de Responsabilidade */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Limitação de Responsabilidade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  NA MÁXIMA EXTENSÃO PERMITIDA POR LEI, O CARDFLOW NÃO SERÁ RESPONSÁVEL POR DANOS
                  INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, OU QUALQUER PERDA
                  DE LUCROS OU RECEITAS.
                </p>
              </div>

              {/* Lei Aplicável */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Lei Aplicável
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem
                  considerar conflitos de disposições legais.
                </p>
              </div>

              {/* Alterações aos Termos */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  12. Alterações aos Termos
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Podemos atualizar estes Termos periodicamente. Notificaremos você sobre mudanças
                  materiais por e-mail ou através dos Serviços. O uso continuado após as alterações
                  constitui aceitação dos novos Termos.
                </p>
              </div>

              {/* Contato */}
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      13. Contato
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                      Se você tiver dúvidas sobre estes Termos, entre em contato conosco:
                    </p>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>
                        <strong className="text-gray-900 dark:text-white">E-mail:</strong>{' '}
                        legal@cardflow.com
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-white">Endereço:</strong>{' '}
                        São Paulo, SP, Brasil
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
