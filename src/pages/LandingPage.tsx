import { useState, useRef, useEffect } from 'react';
import { Play, CheckCircle, Zap, Users, TrendingUp, Award, Target, Rocket } from 'lucide-react';
import Logo from '../components/Logo';

interface LandingPageProps {
  onNavigate: () => void;
}

function LandingPage({ onNavigate }: LandingPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLDivElement>(null);

  const handlePlayClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setPlaybackRate(8);

      setTimeout(() => {
        setPlaybackRate(4);
      }, 2000);

      setTimeout(() => {
        setPlaybackRate(2);
      }, 4000);

      setTimeout(() => {
        setPlaybackRate(1);
      }, 6000);
    }
  };

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"></div>

      <div className="relative">
        <header className="container mx-auto px-4 py-8">
          <Logo />
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30">
              <p className="text-pink-300 font-semibold">Fórmula Engajamento</p>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              Quase acabando...
            </h1>

            <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
              Aprenda a transformar cada curtida, comentário e compartilhamento em <span className="text-pink-400 font-semibold">crescimento real</span>.
            </p>
          </div>

          <div
            ref={videoRef}
            className="max-w-4xl mx-auto mb-16 relative group"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
                {!isPlaying ? (
                  <button
                    onClick={handlePlayClick}
                    className="group-hover:scale-110 transition-transform duration-300"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/50">
                      <Play className="w-12 h-12 text-white ml-2" fill="white" />
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-pink-300 text-lg">
                        Reproduzindo {playbackRate > 1 ? `${playbackRate}x` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onNavigate}
              className="w-full mt-6 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
            >
              Quero Transformar Meu Engajamento
            </button>

            <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-400" />
                <span>Método Comprovado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <span>Resultados Reais</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-400" />
                <span>Suporte Exclusivo</span>
              </div>
            </div>
          </div>

          <section className="max-w-6xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              O Que Você Vai Aprender
            </h2>
            <p className="text-center text-gray-400 text-lg mb-12">
              Desenvolva habilidades práticas que transformarão sua presença digital
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: 'Engajamento Real',
                  description: 'Aprenda técnicas comprovadas para aumentar curtidas, comentários e compartilhamentos de forma orgânica.',
                  color: 'from-pink-500 to-rose-500'
                },
                {
                  icon: Rocket,
                  title: 'Crescimento Acelerado',
                  description: 'Estratégias para fazer seu perfil crescer de forma consistente e sustentável.',
                  color: 'from-purple-500 to-violet-500'
                },
                {
                  icon: Users,
                  title: 'Comunidade Engajada',
                  description: 'Construa uma audiência fiel que realmente se importa com seu conteúdo.',
                  color: 'from-pink-500 to-purple-500'
                },
                {
                  icon: Target,
                  title: 'Conteúdo que Converte',
                  description: 'Crie postagens que gerem conversas e transformem seguidores em clientes.',
                  color: 'from-rose-500 to-pink-500'
                },
                {
                  icon: Zap,
                  title: 'Viralização Estratégica',
                  description: 'Entenda os algoritmos e faça seus conteúdos alcançarem milhares de pessoas.',
                  color: 'from-violet-500 to-purple-500'
                },
                {
                  icon: Award,
                  title: 'Resultados Rápidos',
                  description: 'Implemente as estratégias e veja os resultados já nas primeiras semanas.',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
                >
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-4xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/80 backdrop-blur-sm border-2 border-pink-500/30 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Conheça Seu Mentor
                </h2>
                <p className="text-gray-400 text-lg">
                  Aprenda com quem realmente entende de engajamento nas redes sociais
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-6xl font-bold text-transparent bg-gradient-to-br from-pink-400 to-purple-400 bg-clip-text">
                    JC
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Júlio Calori</h3>
                  <p className="text-pink-400 text-lg mb-4">Conhecido como "Julião"</p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Especialista em estratégias de engajamento digital com mais de 8 mil seguidores no Instagram e presença ativa em múltiplas plataformas de redes sociais.
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    Julião transformou sua experiência prática em um método comprovado que já ajudou centenas de pessoas a crescerem suas marcas pessoais e negócios nas redes sociais.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-3xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl p-8 md:p-12 text-center">
              <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                <p className="text-white font-bold">Oferta Especial</p>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comece Sua Transformação
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Invista no seu crescimento digital hoje mesmo
              </p>

              <div className="mb-8">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text mb-2">
                  R$ 49,99
                </div>
                <p className="text-gray-400">Investimento único</p>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 mb-8 text-left">
                <p className="text-white font-semibold mb-4 text-center">O que está incluído:</p>
                <ul className="space-y-3">
                  {[
                    'Acesso vitalício ao curso completo',
                    '8 módulos práticos e objetivos',
                    'Material de apoio em PDF',
                    'Templates prontos para usar',
                    'Grupo exclusivo de alunos',
                    'Certificado de conclusão',
                    'Atualizações gratuitas',
                    'Suporte direto com o Julião'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onNavigate}
                className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105 mb-6"
              >
                Quero Garantir Minha Vaga Agora
              </button>

              <div className="space-y-2 text-sm">
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  <span className="text-green-400">🔒</span> Pagamento 100% seguro
                </p>
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Garantia de 7 dias
                </p>
                <p className="text-pink-400 font-semibold flex items-center justify-center gap-2">
                  <span>⚠️</span> Oferta por tempo limitado - Apenas 15 vagas restantes
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <Logo />
                  <p className="text-gray-400 mt-4">
                    Transforme seu engajamento em crescimento real.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-4">Contato</h4>
                  <p className="text-gray-400 mb-2">contato@formulaengajamento.com</p>
                  <p className="text-pink-400">@juliao</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-4">Localização</h4>
                  <p className="text-gray-400">Araras, São Paulo</p>
                  <p className="text-gray-400">Brasil</p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                <p>© 2025 Fórmula Engajamento. Todos os direitos reservados.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
