import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Uso: node scripts/create-admin.js <email> <senha>');
  process.exit(1);
}

async function createAdmin() {
  try {
    const existing = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Admin com este email já existe');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    console.log('✅ Admin criado com sucesso!');
    console.log(`📧 Email: ${email}`);
    console.log('🔐 Senha: [protegida]');
    console.log('\n🔗 Acesse o painel admin em: /admin/login');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
}

createAdmin();
