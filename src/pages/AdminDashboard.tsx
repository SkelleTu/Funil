import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, FileText, Eye, Clock, MapPin, Monitor, Calendar } from 'lucide-react';

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

interface Event {
  id: number;
  visitor_id: string;
  event_type: string;
  event_data: any;
  page_url: string;
  timestamp: string;
  ip_address: string;
  city: string;
  country: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'registrations' | 'events'>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadData();
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
      const [statsRes, visitorsRes, registrationsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/visitors?limit=100', { credentials: 'include' }),
        fetch('/api/admin/registrations?limit=100', { credentials: 'include' }),
        fetch('/api/admin/events?limit=200', { credentials: 'include' })
      ]);

      const statsData = await statsRes.json();
      const visitorsData = await visitorsRes.json();
      const registrationsData = await registrationsRes.json();
      const eventsData = await eventsRes.json();

      setStats(statsData);
      setVisitors(visitorsData.visitors);
      setRegistrations(registrationsData.registrations);
      setEvents(eventsData.events);
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
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Painel de Analytics</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Visitantes</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalVisitors}</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Últimas 24h</p>
                  <p className="text-3xl font-bold mt-1">{stats.visitorsLast24h}</p>
                </div>
                <Clock className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total Eventos</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalEvents}</p>
                </div>
                <Activity className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-200 text-sm">Cadastros</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalRegistrations}</p>
                </div>
                <FileText className="w-12 h-12 text-pink-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm">Visualizações</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPageViews}</p>
                </div>
                <Eye className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-700">
          {['overview', 'visitors', 'registrations', 'events'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && 'Visão Geral'}
              {tab === 'visitors' && 'Visitantes'}
              {tab === 'registrations' && 'Cadastros'}
              {tab === 'events' && 'Eventos'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'visitors' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Lista de Visitantes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Localização</th>
                    <th className="text-left p-3">Dispositivo</th>
                    <th className="text-left p-3">Navegador</th>
                    <th className="text-left p-3">Primeira Visita</th>
                    <th className="text-left p-3">Última Visita</th>
                    <th className="text-left p-3">Visitas</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3 font-mono text-sm">{visitor.visitor_id.substring(0, 12)}...</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {visitor.city}, {visitor.country}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Monitor className="w-4 h-4" />
                          {visitor.device_type}
                        </div>
                      </td>
                      <td className="p-3">{visitor.browser}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(visitor.first_visit)}
                        </div>
                      </td>
                      <td className="p-3">{formatDate(visitor.last_visit)}</td>
                      <td className="p-3">
                        <span className="bg-blue-600 px-2 py-1 rounded">{visitor.total_visits}</span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => viewVisitorDetails(visitor.visitor_id)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Cadastros Realizados</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Telefone</th>
                    <th className="text-left p-3">Localização</th>
                    <th className="text-left p-3">Dispositivo</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3">{formatDate(reg.registered_at)}</td>
                      <td className="p-3 font-medium">{reg.name}</td>
                      <td className="p-3">{reg.email}</td>
                      <td className="p-3">{reg.phone}</td>
                      <td className="p-3">{reg.city}, {reg.country}</td>
                      <td className="p-3">{reg.device_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Eventos Recentes</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="bg-gray-700/50 p-4 rounded-lg flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-600 px-2 py-1 rounded text-sm">{event.event_type}</span>
                      <span className="text-gray-400 text-sm">{formatDate(event.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{event.page_url}</p>
                    {event.event_data && (
                      <pre className="text-xs text-gray-400 mt-2 bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event.event_data, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 ml-4">
                    {event.city}, {event.country}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Visitantes Recentes</h2>
              <div className="space-y-3">
                {visitors.slice(0, 5).map((visitor) => (
                  <div key={visitor.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm">{visitor.visitor_id.substring(0, 16)}...</span>
                      <span className="text-xs text-gray-400">{formatDate(visitor.last_visit)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>📍 {visitor.city}, {visitor.country}</div>
                      <div>💻 {visitor.device_type}</div>
                      <div>🌐 {visitor.browser}</div>
                      <div>🔢 {visitor.total_visits} visitas</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Cadastros Recentes</h2>
              <div className="space-y-3">
                {registrations.slice(0, 5).map((reg) => (
                  <div key={reg.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{reg.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(reg.registered_at)}</span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>📧 {reg.email}</div>
                      {reg.phone && <div>📞 {reg.phone}</div>}
                      <div>📍 {reg.city}, {reg.country}</div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedVisitor(null)}>
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Detalhes do Visitante</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">ID do Visitante</p>
                <p className="font-mono">{selectedVisitor.visitor.visitor_id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Visitas</p>
                <p className="font-bold text-xl">{selectedVisitor.visitor.total_visits}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Localização</p>
                <p>{selectedVisitor.visitor.city}, {selectedVisitor.visitor.region}, {selectedVisitor.visitor.country}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Dispositivo</p>
                <p>{selectedVisitor.visitor.device_type} - {selectedVisitor.visitor.browser}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Eventos ({selectedVisitor.events.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedVisitor.events.map((event: any) => (
                  <div key={event.id} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="text-purple-400">{event.event_type}</span>
                      <span className="text-gray-400 text-sm">{formatDate(event.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Páginas Visitadas ({selectedVisitor.pageViews.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedVisitor.pageViews.map((page: any) => (
                  <div key={page.id} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm">{page.page_url}</p>
                        <p className="text-xs text-gray-400">{page.page_title}</p>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <p>{page.time_spent}s</p>
                        <p>{page.scroll_depth}% scroll</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedVisitor.registration && (
              <div>
                <h3 className="font-bold mb-2">Dados de Cadastro</h3>
                <div className="bg-gray-700 p-4 rounded">
                  <p><strong>Email:</strong> {selectedVisitor.registration.email}</p>
                  <p><strong>Nome:</strong> {selectedVisitor.registration.name}</p>
                  {selectedVisitor.registration.phone && (
                    <p><strong>Telefone:</strong> {selectedVisitor.registration.phone}</p>
                  )}
                  <p><strong>Data:</strong> {formatDate(selectedVisitor.registration.registered_at)}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedVisitor(null)}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
