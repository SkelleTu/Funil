import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware para verificar autenticação de admin
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Rota de login admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ email: admin.email, id: admin.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, email: admin.email });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Criar admin (apenas para setup inicial)
app.post('/api/admin/create', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se já existe admin
    const existing = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Admin já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    res.json({ success: true, message: 'Admin criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Verificar autenticação
app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ authenticated: true, email: req.adminEmail });
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

// Registrar visitante
app.post('/api/analytics/visitor', async (req, res) => {
  try {
    const { visitorId, userData } = req.body;
    
    const existing = await pool.query('SELECT * FROM visitors WHERE visitor_id = $1', [visitorId]);

    if (existing.rows.length > 0) {
      // Atualizar visitante existente
      await pool.query(
        `UPDATE visitors SET 
          last_visit = CURRENT_TIMESTAMP,
          total_visits = total_visits + 1,
          ip_address = COALESCE($2, ip_address),
          user_agent = COALESCE($3, user_agent)
        WHERE visitor_id = $1`,
        [visitorId, userData.ip, userData.userAgent]
      );
    } else {
      // Criar novo visitante
      await pool.query(
        `INSERT INTO visitors 
        (visitor_id, ip_address, country, city, region, user_agent, device_type, browser, os, referrer, landing_page)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          visitorId,
          userData.ip || null,
          userData.country || null,
          userData.city || null,
          userData.region || null,
          userData.userAgent || null,
          userData.deviceType || null,
          userData.browser || null,
          userData.os || null,
          userData.referrer || null,
          userData.landingPage || null
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar visitante:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Registrar evento
app.post('/api/analytics/event', async (req, res) => {
  try {
    const { visitorId, eventType, eventData, pageUrl, sessionId } = req.body;

    await pool.query(
      `INSERT INTO events (visitor_id, event_type, event_data, page_url, session_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [visitorId, eventType, JSON.stringify(eventData), pageUrl, sessionId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Registrar visualização de página
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    const { visitorId, pageUrl, pageTitle, sessionId, timeSpent, scrollDepth } = req.body;

    await pool.query(
      `INSERT INTO page_views (visitor_id, page_url, page_title, session_id, time_spent, scroll_depth)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [visitorId, pageUrl, pageTitle, sessionId, timeSpent || 0, scrollDepth || 0]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar page view:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Registrar dados de cadastro
app.post('/api/analytics/registration', async (req, res) => {
  try {
    const { visitorId, email, name, phone, registrationData } = req.body;

    await pool.query(
      `INSERT INTO registrations (visitor_id, email, name, phone, registration_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [visitorId, email, name, phone, JSON.stringify(registrationData)]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar dados:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Obter estatísticas gerais
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const [visitors, events, registrations, pageViews] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM visitors'),
      pool.query('SELECT COUNT(*) as count FROM events'),
      pool.query('SELECT COUNT(*) as count FROM registrations'),
      pool.query('SELECT COUNT(*) as count FROM page_views')
    ]);

    const recentVisitors = await pool.query(
      'SELECT COUNT(*) as count FROM visitors WHERE last_visit > NOW() - INTERVAL \'24 hours\''
    );

    res.json({
      totalVisitors: parseInt(visitors.rows[0].count),
      totalEvents: parseInt(events.rows[0].count),
      totalRegistrations: parseInt(registrations.rows[0].count),
      totalPageViews: parseInt(pageViews.rows[0].count),
      visitorsLast24h: parseInt(recentVisitors.rows[0].count)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Listar visitantes
app.get('/api/admin/visitors', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM visitors 
       ORDER BY last_visit DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) as count FROM visitors');

    res.json({
      visitors: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar visitantes:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Detalhes de um visitante específico
app.get('/api/admin/visitor/:visitorId', authMiddleware, async (req, res) => {
  try {
    const { visitorId } = req.params;

    const [visitor, events, pageViews, registration] = await Promise.all([
      pool.query('SELECT * FROM visitors WHERE visitor_id = $1', [visitorId]),
      pool.query(
        'SELECT * FROM events WHERE visitor_id = $1 ORDER BY timestamp DESC',
        [visitorId]
      ),
      pool.query(
        'SELECT * FROM page_views WHERE visitor_id = $1 ORDER BY viewed_at DESC',
        [visitorId]
      ),
      pool.query(
        'SELECT * FROM registrations WHERE visitor_id = $1 ORDER BY registered_at DESC LIMIT 1',
        [visitorId]
      )
    ]);

    if (visitor.rows.length === 0) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    res.json({
      visitor: visitor.rows[0],
      events: events.rows,
      pageViews: pageViews.rows,
      registration: registration.rows[0] || null
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do visitante:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Listar eventos recentes
app.get('/api/admin/events', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const result = await pool.query(
      `SELECT e.*, v.ip_address, v.city, v.country 
       FROM events e 
       LEFT JOIN visitors v ON e.visitor_id = v.visitor_id 
       ORDER BY e.timestamp DESC 
       LIMIT $1`,
      [limit]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Listar registros
app.get('/api/admin/registrations', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT r.*, v.ip_address, v.city, v.country, v.device_type 
       FROM registrations r 
       LEFT JOIN visitors v ON r.visitor_id = v.visitor_id 
       ORDER BY r.registered_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) as count FROM registrations');

    res.json({
      registrations: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de Analytics rodando na porta ${PORT}`);
});
