import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, FileText, Eye, Clock, MapPin, Monitor, LogOut, Calendar, Mail, Phone, User } from 'lucide-react';

interface Stats {
  totalVisitors: number;
  totalEvents: number;
  totalRegistrations: number;
  totalPageViews: number;
  visitorsLast24h: number;
}

interface Visitor {
  id: number;
  visitor_id: string;
  first_visit: string;
  last_visit: string;
  ip_address: string;
  country: string;
  city: string;
  region: string;
  device_type: string;
  browser: string;
  os: string;
  referrer: string;
  landing_page: string;
  total_visits: number;
  total_time_spent: number;
}

interface Registration {
  id: number;
  visitor_id: string;
  email: string;
  name: string;
  phone: string;
  registered_at: string;
  ip_address: string;
  city: string;
  country: string;
  device_type: string;
  registration_data: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'registrations'>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        credentials: 'include'
      });

      if (!response.ok) {
        navigate('/admin/login');
      }
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, visitorsRes, registrationsRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/visitors?limit=100', { credentials: 'include' }),
        fetch('/api/admin/registrations?limit=100', { credentials: 'include' })
      ]);

      const statsData = await statsRes.json();
      const visitorsData = await visitorsRes.json();
      const registrationsData = await registrationsRes.json();

      setStats(statsData);
      setVisitors(visitorsData.visitors);
      setRegistrations(registrationsData.registrations);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewVisitorDetails = async (visitorId: string) => {
    try {
      const response = await fetch(`/api/admin/visitor/${visitorId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setSelectedVisitor(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translateEventType = (eventType: string, eventData: any) => {
    switch (eventType) {
      case 'click':
        if (eventData?.text) {
          return `Clicou em "${eventData.text.substring(0, 50)}"`;
        }
        return 'Clicou na página';
      case 'scroll':
        return `Rolou a página até ${eventData?.depth || 0}%`;
      case 'visibility_change':
        return eventData?.hidden ? 'Saiu da aba' : 'Voltou para a aba';
      default:
        return eventType;
    }
  };

  const getPageName = (url: string) => {
    if (!url) return 'Página';
    if (url.includes('/registration') || url.includes('registro')) return 'Página de Cadastro';
    if (url.includes('/confirmation') || url.includes('confirmacao')) return 'Página de Confirmação';
    return 'Página Inicial';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"></div>

      {/* Header */}
      <div className="relative border-b border-pink-500/20 backdrop-blur-sm bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <p className="text-purple-300 mt-1">Fórmula Engajamento - Dados dos Clientes</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/20"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total de Visitantes</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalVisitors}</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Hoje</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.visitorsLast24h}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Interações</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalEvents}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-pink-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-300 text-sm font-medium">Cadastros</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalRegistrations}</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <FileText className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">Páginas Vistas</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalPageViews}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Eye className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'visitors', label: 'Visitantes', icon: Users },
            { id: 'registrations', label: 'Cadastros', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-purple-500/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'visitors' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Lista de Visitantes</h2>
            <div className="space-y-4">
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-6 hover:border-pink-500/40 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <MapPin className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {visitor.city}, {visitor.country}
                          </p>
                          <p className="text-purple-300 text-sm">{visitor.region}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm">Dispositivo</p>
                      </div>
                      <p className="text-white font-medium">{visitor.device_type}</p>
                      <p className="text-purple-300 text-sm">{visitor.browser}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm">Última Visita</p>
                      </div>
                      <p className="text-white font-medium">{formatDate(visitor.last_visit)}</p>
                      <p className="text-purple-300 text-sm">{visitor.total_visits} visitas</p>
                    </div>
                  </div>

                  <button
                    onClick={() => viewVisitorDetails(visitor.visitor_id)}
                    className="mt-4 w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 border border-pink-500/30"
                  >
                    Ver Todos os Detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Pessoas Cadastradas</h2>
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-pink-500/20 rounded-xl">
                          <User className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-xl">{reg.name}</p>
                          <p className="text-purple-300 text-sm">{formatDate(reg.registered_at)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <p className="text-white break-all">{reg.email}</p>
                        </div>
                        {reg.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-purple-400" />
                            <p className="text-white">{reg.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm font-medium">Localização</p>
                      </div>
                      <p className="text-white font-medium mb-1">
                        {reg.city}, {reg.country}
                      </p>

                      <div className="flex items-center gap-2 mt-4">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm">Cadastrou pelo: <span className="text-white font-medium">{reg.device_type}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Visitantes Recentes</h2>
              <div className="space-y-4">
                {visitors.slice(0, 5).map((visitor) => (
                  <div key={visitor.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-pink-400" />
                        <span className="text-white font-medium">{visitor.city}, {visitor.country}</span>
                      </div>
                      <span className="text-purple-300 text-xs">{formatDate(visitor.last_visit)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-200">{visitor.device_type}</span>
                      </div>
                      <div className="text-purple-200">{visitor.browser}</div>
                      <div className="text-pink-300 font-medium">{visitor.total_visits} visitas</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Cadastros Recentes</h2>
              <div className="space-y-4">
                {registrations.slice(0, 5).map((reg) => (
                  <div key={reg.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-bold text-lg">{reg.name}</span>
                      <span className="text-purple-300 text-xs">{formatDate(reg.registered_at)}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-200 break-all">{reg.email}</span>
                      </div>
                      {reg.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-200">{reg.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-200">{reg.city}, {reg.country}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes do visitante */}
      {selectedVisitor && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" 
          onClick={() => setSelectedVisitor(null)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 border-2 border-pink-500/30 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Detalhes Completos do Visitante
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Localização</p>
                <p className="text-white font-bold text-lg break-words">
                  {selectedVisitor.visitor.city}, {selectedVisitor.visitor.region}, {selectedVisitor.visitor.country}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Total de Visitas</p>
                <p className="text-white font-bold text-2xl">{selectedVisitor.visitor.total_visits}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Dispositivo</p>
                <p className="text-white font-medium break-words">
                  {selectedVisitor.visitor.device_type} - {selectedVisitor.visitor.browser}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Sistema</p>
                <p className="text-white font-medium break-words">{selectedVisitor.visitor.os}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Ações Realizadas ({selectedVisitor.events.length})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {selectedVisitor.events.map((event: any) => (
                  <div key={event.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-4">
                        <p className="text-pink-300 font-medium break-words">
                          {translateEventType(event.event_type, event.event_data)}
                        </p>
                        <p className="text-purple-300 text-sm mt-1 break-all">{getPageName(event.page_url)}</p>
                      </div>
                      <span className="text-purple-400 text-xs whitespace-nowrap">{formatDate(event.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Páginas Visitadas ({selectedVisitor.pageViews.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {selectedVisitor.pageViews.map((page: any) => (
                  <div key={page.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium break-words">{getPageName(page.page_url)}</p>
                        <p className="text-purple-300 text-sm mt-1">Ficou {page.time_spent} segundos na página</p>
                        <p className="text-purple-400 text-sm">Rolou {page.scroll_depth}% da página</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedVisitor.registration && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Dados de Cadastro</h3>
                <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 p-6 rounded-xl">
                  <div className="space-y-3">
                    <div>
                      <p className="text-purple-300 text-sm">Nome</p>
                      <p className="text-white font-bold text-lg break-words">{selectedVisitor.registration.name}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Email</p>
                      <p className="text-white font-medium break-all">{selectedVisitor.registration.email}</p>
                    </div>
                    {selectedVisitor.registration.phone && (
                      <div>
                        <p className="text-purple-300 text-sm">Telefone</p>
                        <p className="text-white font-medium">{selectedVisitor.registration.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-purple-300 text-sm">Data do Cadastro</p>
                      <p className="text-white font-medium">{formatDate(selectedVisitor.registration.registered_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedVisitor(null)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/30"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
