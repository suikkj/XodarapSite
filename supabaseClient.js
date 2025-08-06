// c:\Users\lucas\Documents\Projetos programação\Xodarap\supabaseClient.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Verificação mais detalhada das variáveis de ambiente
if (!supabaseUrl) throw new Error("Variável de ambiente SUPABASE_URL não encontrada. Verifique seu arquivo .env.");
if (!supabaseAnonKey) throw new Error("Variável de ambiente SUPABASE_ANON_KEY não encontrada. Verifique seu arquivo .env.");
if (!supabaseServiceKey) throw new Error("Variável de ambiente SUPABASE_SERVICE_KEY não encontrada. Verifique seu arquivo .env.");

// Cliente público (para operações do lado do cliente)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente de Admin (para operações seguras do lado do servidor)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase, supabaseAdmin };
