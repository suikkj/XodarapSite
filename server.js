const express = require('express');
const fs = require('fs').promises;
const path = require('path');
// 1. ADICIONE ESTA LINHA NO TOPO PARA CARREGAR AS VARIÁVEIS DE AMBIENTE
require('dotenv').config(); 
const { supabase, supabaseAdmin } = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Função auxiliar para pegar o usuário a partir do token JWT
async function getUserFromToken(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return { user: null, error: { message: 'Token não fornecido.' } };
    return await supabase.auth.getUser(token);
}

// Middleware para verificar o token JWT e a role de ADMIN
const checkAdminRole = async (req, res, next) => {
    try {
        const { data: { user }, error: userError } = await getUserFromToken(req);
        if (userError || !user) {
            console.log('DEBUG: checkAdminRole falhou - Token inválido ou não fornecido.');
            return res.status(401).json({ error: 'Acesso não autorizado. Token inválido.' });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // --- LOG DE DIAGNÓSTICO ---
        console.log(`DEBUG: Verificando permissão para o usuário ID: ${user.id}`);

        if (profileError || !profile) {
            console.log(`DEBUG: checkAdminRole falhou - Perfil não encontrado para o usuário ID: ${user.id}`);
            return res.status(403).json({ error: 'Perfil de usuário não encontrado.' });
        }

        // --- LOG DE DIAGNÓSTICO ---
        console.log(`DEBUG: Role encontrada no banco de dados: '${profile.role}'. Comparando com 'workerAdmin'.`);

        if (profile.role !== 'workerAdmin') {
            console.log(`DEBUG: checkAdminRole falhou - Acesso negado. Role '${profile.role}' não é 'workerAdmin'.`);
            return res.status(403).json({ error: 'Acesso negado. Permissão de administrador necessária.' });
        }

        console.log('DEBUG: checkAdminRole SUCESSO - Permissão concedida.');
        req.user = user; // Passa o usuário para a próxima rota
        next();
    } catch (error) {
        console.error('DEBUG: Erro catastrófico no middleware checkAdminRole:', error);
        res.status(500).json({ error: 'Erro ao verificar permissões de administrador.' });
    }
};

// NOVO MIDDLEWARE: Middleware para verificar se o usuário está autenticado (qualquer role)
const requireAuth = async (req, res, next) => {
    try {
        const { data: { user }, error: userError } = await getUserFromToken(req);
        if (userError || !user) {
            return res.status(401).json({ error: 'Acesso não autorizado. Token inválido ou expirado.' });
        }
        req.user = user; // Passa o usuário para a próxima rota
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar autenticação.' });
    }
};


// --- ROTAS DE PÁGINAS ---

// 2. CRIE UM OBJETO COM AS CHAVES PÚBLICAS PARA REUTILIZAR
const clientSideSupabaseConfig = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
};

// 3. ATUALIZE TODAS AS ROTAS QUE RENDERIZAM PÁGINAS PARA INJETAR AS CHAVES
app.get('/', (req, res) => res.render('index', clientSideSupabaseConfig));
app.get('/login', (req, res) => res.render('login', clientSideSupabaseConfig));
app.get('/dashboard', (req, res) => res.render('dashboard', clientSideSupabaseConfig));
app.get('/admin/dashboard', (req, res) => res.render('admin-dashboard', clientSideSupabaseConfig));
// A rota /admin parece redundante, considere remover se não for usada
app.get('/admin', (req, res) => res.render('admin', clientSideSupabaseConfig));


// --- ROTAS DA API DE AUTENTICAÇÃO ---
app.post('/api/register', async (req, res) => {
    // ... seu código de registro existente ...
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, senha e nome de usuário são obrigatórios.' });
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username }
            }
        });

        if (error) {
            if (error.message.includes("User already registered")) {
                return res.status(400).json({ error: 'Este email já está registrado.' });
            }
            return res.status(error.status || 500).json({ error: error.message });
        }

        if (data.user && !data.session) {
            return res.status(200).json({ success: true, message: 'Registro realizado! Verifique seu email para confirmar a conta.' });
        }

        res.status(200).json({ success: true, message: 'Registro e login realizados com sucesso!', session: data.session });
    } catch (e) {
        console.error('Erro na rota /api/register:', e);
        res.status(500).json({ error: 'Erro interno do servidor. Verifique os logs do console.' });
    }
});

app.post('/api/login', async (req, res) => {
    // ... seu código de login existente ...
});


// --- ROTAS DA API DA FICHA (AGORA USANDO O MIDDLEWARE requireAuth) ---
app.get('/api/sheet', requireAuth, async (req, res) => {
    try {
        // O usuário já foi verificado pelo middleware e está em req.user
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('sheet_data')
            .eq('id', req.user.id) // Usamos o ID do usuário autenticado
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        res.status(200).json(profile?.sheet_data || {});

    } catch (error) {
        console.error('Erro ao obter dados da ficha:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// ROTA ATUALIZADA: Esta rota agora usa a mesma lógica de mesclagem da rota do admin.
app.post('/api/sheet', requireAuth, async (req, res) => {
    try {
        // O usuário já foi verificado pelo middleware e está em req.user
        const updates = req.body; // As novas informações vêm do corpo da requisição

        // 1. Busca a ficha atual do usuário
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('sheet_data')
            .eq('id', req.user.id) // Usamos o ID do usuário autenticado
            .single();

        // Se houver um erro que não seja "nenhuma linha encontrada", é um problema.
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        // 2. Mescla os dados existentes com os novos
        const currentSheetData = profile?.sheet_data || {};
        const newSheetData = { ...currentSheetData, ...updates };

        // 3. Usa 'upsert' para criar ou atualizar o perfil com os dados mesclados
        const { data, error: upsertError } = await supabase
            .from('profiles')
            .update({ sheet_data: newSheetData })
            .eq('id', req.user.id) // Usamos o ID do usuário autenticado
            .select()
            .single();

        if (upsertError) {
            throw upsertError;
        }

        res.status(200).json({ message: 'Dados salvos com sucesso!', data: data.sheet_data });

    } catch (error) {
        console.error('Erro ao salvar dados da ficha:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao salvar a ficha.' });
    }
});


// --- ROTAS DA API DO ADMIN (PROTEGIDAS) ---

// Rota para buscar todos os usuários. Agora usa a VIEW.
app.get('/api/admin/users', checkAdminRole, async (req, res) => {
    try {
        // Usamos o cliente admin para consultar a nossa nova view 'users_with_profiles'
        const { data: users, error: listError } = await supabaseAdmin
            .from('users_with_profiles') // <-- MUDANÇA PRINCIPAL AQUI
            .select('*'); // A view já tem os dados combinados

        if (listError) {
            console.error('Erro na consulta à view Supabase:', listError.message);
            throw new Error('Falha ao consultar a lista de usuários na view.');
        }

        // A formatação fica mais simples, pois os dados já vêm prontos
        const formattedUsers = users.map(u => ({
            id: u.id,
            username: u.email, // Usando o email como nome de usuário
            email: u.email,
            role: u.role
        }));

        res.status(200).json(formattedUsers);

    } catch (error) {
        console.error('Erro na rota /api/admin/users:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar usuários.' });
    }
});

app.get('/api/admin/sheet/:userId', checkAdminRole, async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('profiles')
            .select('sheet_data')
            .eq('id', userId)
            .single();

        // Se houver um erro, mas NÃO for o erro "nenhuma linha encontrada",
        // então é um problema real e devemos retornar 500.
        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar ficha do usuário:', error);
            return res.status(500).json({ error: 'Erro no banco de dados ao buscar ficha.' });
        }

        // Se encontrou o perfil, retorna a ficha (ou um objeto vazio se a ficha for nula).
        // Se não encontrou (data é null), também retorna um objeto vazio.
        res.status(200).json(data?.sheet_data || {});

    } catch (error) {
        console.error('Erro catastrófico na rota /api/admin/sheet/:userId :', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// ROTA CORRIGIDA: Substitua o bloco de código duplicado por este.
app.patch('/api/admin/sheet/:userId', checkAdminRole, async (req, res) => {
    const { userId } = req.params;
    const updates = req.body; // Dados que vêm do front-end (ex: { 'user-status': 'Inativo' })

    if (!userId || !updates) {
        return res.status(400).json({ error: 'ID do usuário e dados para atualização são obrigatórios.' });
    }

    try {
        // 1. Busca a ficha atual do usuário no banco
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('sheet_data')
            .eq('id', userId)
            .single();

        // Se houver um erro que não seja "nenhuma linha encontrada", lance-o.
        // O erro 'PGRST116' é esperado se o usuário ainda não tiver uma ficha.
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Erro ao buscar ficha para atualização:', fetchError);
            throw new Error('Não foi possível encontrar a ficha do usuário para atualizar.');
        }

        // 2. Mescla os dados existentes com os novos dados recebidos
        const currentSheetData = profile?.sheet_data || {};
        const newSheetData = { ...currentSheetData, ...updates };

        // 3. Atualiza a ficha no banco com os dados mesclados
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ sheet_data: newSheetData })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('Erro ao salvar a ficha atualizada:', updateError);
            throw new Error('Falha ao salvar as alterações no banco de dados.');
        }

        res.status(200).json(updatedProfile.sheet_data);

    } catch (error) {
        console.error(`Erro na rota PATCH /api/admin/sheet/${userId}:`, error.message);
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao atualizar a ficha.' });
    }
});

// NOVA ROTA: Atualizar a ROLE de um usuário específico (ADMIN)
app.patch('/api/admin/role/:userId', checkAdminRole, async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    // Validação simples
    if (!role) {
        return res.status(400).json({ error: 'O novo cargo (role) é obrigatório.' });
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar cargo no Supabase:', error);
            throw new Error('Falha ao comunicar com o banco de dados.');
        }

        if (!data) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Cargo atualizado com sucesso!', updatedProfile: data });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INICIA O SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse a aplicação em http://localhost:${PORT}`);
});
