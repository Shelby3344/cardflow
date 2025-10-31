'use client';

import Link from 'next/link';
import { Brain, ArrowLeft, Lock, Eye, Database, Shield, Cookie, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacidadePage() {
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
              <Lock className="h-12 w-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Política de Privacidade
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
                  <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    1. Introdução
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  A privacidade dos nossos usuários é fundamental para nós. Esta Política de
                  Privacidade descreve como o CardFlow coleta, usa, armazena e protege suas
                  informações pessoais. Ao usar nossos serviços, você concorda com as práticas
                  descritas nesta política.
                </p>
              </div>

              {/* Informações Coletadas */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    2. Informações que Coletamos
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      2.1 Informações Fornecidas por Você
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Nome completo e endereço de e-mail (ao criar conta)</li>
                      <li>Senha criptografada</li>
                      <li>Foto de perfil (opcional)</li>
                      <li>Informações de pagamento (processadas por provedores terceiros)</li>
                      <li>Conteúdo criado (flashcards, decks, anotações)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      2.2 Informações Coletadas Automaticamente
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Endereço IP e localização geográfica aproximada</li>
                      <li>Tipo de dispositivo, sistema operacional e navegador</li>
                      <li>Páginas visitadas e tempo de uso</li>
                      <li>Dados de interação com os serviços</li>
                      <li>Logs de acesso e atividades</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      2.3 Cookies e Tecnologias Similares
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Utilizamos cookies essenciais para autenticação, preferências e análise de
                      desempenho. Você pode gerenciar cookies através das configurações do navegador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Como Usamos */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    3. Como Usamos suas Informações
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  Usamos suas informações para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Fornecer, manter e melhorar nossos serviços</li>
                  <li>Processar transações e enviar confirmações</li>
                  <li>Personalizar sua experiência de aprendizado</li>
                  <li>Enviar notificações importantes sobre sua conta</li>
                  <li>Responder suas solicitações de suporte</li>
                  <li>Prevenir fraudes e garantir segurança</li>
                  <li>Analisar uso e tendências para melhorias</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Enviar e-mails de marketing (com seu consentimento)</li>
                </ul>
              </div>

              {/* Compartilhamento */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Compartilhamento de Informações
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">NÃO vendemos</strong> suas
                    informações pessoais. Compartilhamos dados apenas nas seguintes situações:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-gray-900 dark:text-white">Provedores de Serviço:</strong>{' '}
                      Empresas que nos ajudam a operar (hospedagem, pagamentos, análises)
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">Requisitos Legais:</strong>{' '}
                      Quando exigido por lei ou para proteger direitos
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">Transferências Empresariais:</strong>{' '}
                      Em caso de fusão, aquisição ou venda de ativos
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">Com seu Consentimento:</strong>{' '}
                      Quando você autoriza explicitamente
                    </li>
                  </ul>
                </div>
              </div>

              {/* Segurança */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      5. Segurança dos Dados
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                      Implementamos medidas de segurança rigorosas para proteger suas informações:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Criptografia SSL/TLS para dados em trânsito</li>
                      <li>Criptografia de senhas com bcrypt</li>
                      <li>Autenticação JWT segura</li>
                      <li>Backups regulares e redundância de dados</li>
                      <li>Monitoramento de segurança 24/7</li>
                      <li>Controles de acesso rigorosos</li>
                      <li>Auditorias de segurança regulares</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Seus Direitos */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    6. Seus Direitos (LGPD)
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>
                    <strong className="text-gray-900 dark:text-white">Acesso:</strong> Solicitar cópia
                    dos seus dados pessoais
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">Correção:</strong> Atualizar
                    informações incorretas ou incompletas
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">Exclusão:</strong> Solicitar
                    remoção dos seus dados (direito ao esquecimento)
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">Portabilidade:</strong> Receber
                    seus dados em formato estruturado
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">Revogação:</strong> Retirar
                    consentimento a qualquer momento
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">Oposição:</strong> Opor-se ao
                    processamento de seus dados
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">Informação:</strong> Saber como
                    seus dados são tratados
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  Para exercer esses direitos, entre em contato em{' '}
                  <a
                    href="mailto:privacidade@cardflow.com"
                    className="text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    privacidade@cardflow.com
                  </a>
                </p>
              </div>

              {/* Retenção */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Retenção de Dados
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Mantemos suas informações pelo tempo necessário para fornecer os serviços e
                  cumprir obrigações legais. Quando você exclui sua conta, removemos seus dados
                  pessoais dentro de 30 dias, exceto informações que devemos reter por exigências
                  legais (como dados de transação por 5 anos).
                </p>
              </div>

              {/* Menores */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Privacidade de Menores
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Nossos serviços são destinados a usuários com 13 anos ou mais. Usuários entre 13 e
                  18 anos devem ter autorização dos pais ou responsáveis. Não coletamos
                  intencionalmente dados de crianças menores de 13 anos. Se identificarmos tal
                  coleta, excluiremos os dados imediatamente.
                </p>
              </div>

              {/* Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    9. Política de Cookies
                  </h2>
                </div>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed">Usamos os seguintes tipos de cookies:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-gray-900 dark:text-white">Essenciais:</strong>{' '}
                      Necessários para autenticação e funcionamento básico
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">Preferências:</strong>{' '}
                      Lembram suas configurações e idioma
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">Análise:</strong> Nos ajudam
                      a entender como você usa o site
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">Marketing:</strong> Usados
                      para anúncios relevantes (com consentimento)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Transferências Internacionais */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Transferências Internacionais
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Seus dados são armazenados principalmente no Brasil. Quando transferimos dados
                  para outros países (como uso de serviços em nuvem), garantimos proteções
                  adequadas através de cláusulas contratuais padrão e certificações de segurança.
                </p>
              </div>

              {/* Alterações */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Alterações nesta Política
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças
                  significativas por e-mail ou aviso proeminente no site. Recomendamos revisar esta
                  página regularmente para se manter informado.
                </p>
              </div>

              {/* Contato DPO */}
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-6 w-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      12. Encarregado de Dados (DPO)
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                      Para questões sobre privacidade, exercício de direitos ou reclamações, entre
                      em contato com nosso Encarregado de Proteção de Dados:
                    </p>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>
                        <strong className="text-gray-900 dark:text-white">E-mail:</strong>{' '}
                        dpo@cardflow.com
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-white">E-mail alternativo:</strong>{' '}
                        privacidade@cardflow.com
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-white">Telefone:</strong> +55 (11)
                        1234-5678
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-white">Endereço:</strong> São
                        Paulo, SP, Brasil
                      </li>
                    </ul>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                      Você também pode registrar uma reclamação com a Autoridade Nacional de
                      Proteção de Dados (ANPD) em{' '}
                      <a
                        href="https://www.gov.br/anpd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        www.gov.br/anpd
                      </a>
                    </p>
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
