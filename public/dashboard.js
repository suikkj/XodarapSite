document.addEventListener('DOMContentLoaded', () => {
    // 1. USE O OBJETO 'window.SUPABASE_CONFIG'
    const SUPABASE_URL = window.SUPABASE_CONFIG.URL;
    const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.ANON_KEY;
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    let dashboardInitialized = false;

    // --- DEFINIÇÃO DE PERMISSÕES ---
    const permissions = {
        '#conta':               ['workerD', 'workerC', 'workerB', 'workerA'],
        '#ficha':               ['workerC', 'workerB', 'workerA'],
        '#documentos':          ['workerC', 'workerB', 'workerA'],
        '#projetos':            ['workerC', 'workerB', 'workerA'],
        '#chat':                ['workerC', 'workerB', 'workerA'],
        '#arquivos-confidenciais': ['workerB', 'workerA']
    };

    // O objeto 'occupations' foi movido para occupations.js

    function initializeDashboard(session) {
        if (dashboardInitialized) return;
        dashboardInitialized = true;

        const userRole = localStorage.getItem('userRole');
        console.log(`Sessão válida. Role: ${userRole}. Inicializando o dashboard...`);

        if (!userRole || userRole === 'workerAdmin') {
            // Se for admin, ele não deveria estar aqui. Redireciona para o painel correto.
            // Se não tiver role, redireciona para o login.
            window.location.href = userRole === 'workerAdmin' ? '/admin/dashboard' : '/login';
            return;
        }

        const mainContent = document.querySelector('.main-content');
        const sidebarNav = document.querySelector('.sidebar-nav');

        // --- FILTRAR SIDEBAR COM BASE NA ROLE ---
        const sidebarLinks = sidebarNav.querySelectorAll('a');
        const visibleLinks = [];
        sidebarLinks.forEach(link => {
            const target = link.getAttribute('href');
            
            // --- INÍCIO DA CORREÇÃO ---
            // Ignora o botão de logout e o link de admin (que é adicionado depois)
            if (link.id === 'logout-button' || link.href.includes('/admin/dashboard')) {
                link.style.display = ''; // Garante que ele seja sempre visível
                return; // Pula para o próximo link
            }
            // --- FIM DA CORREÇÃO ---

            if (permissions[target] && permissions[target].includes(userRole)) {
                link.style.display = ''; // Garante que o link seja visível
                visibleLinks.push(link);
            } else if (target.startsWith('#')) { // Esconde apenas links de navegação
                link.style.display = 'none';
            }
        });

        // --- FUNÇÃO DE NOTIFICAÇÃO (TOAST) ---
        // Esta função é usada por Csheet.js, por isso permanece aqui.
        function showToast(message, type = 'info', duration = 4000) {
            const existingToast = document.querySelector('.custom-toast');
            if (existingToast) {
                existingToast.remove();
            }

            const toast = document.createElement('div');
            toast.className = `custom-toast ${type}`;
            toast.innerHTML = message; // Usar innerHTML para permitir quebras de linha

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            setTimeout(() => {
                toast.classList.remove('show');
                toast.addEventListener('transitionend', () => toast.remove());
            }, duration);
        }

        // --- FUNÇÃO PARA CARREGAR DADOS DA CONTA ---
        // A função de carregar dados da ficha foi movida para Csheet.js
        async function loadAccountData() {
            try {
                const token = session.access_token;
                const response = await fetch('/api/sheet', { // Assumindo que a mesma API retorna os dados
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    console.error('Dados da conta não encontrados.');
                    return null;
                }
                return await response.json();
            } catch (error) {
                console.error('Erro ao carregar dados da conta:', error);
                return null;
            }
        }
        
        // --- CONTEÚDO DAS SEÇÕES ---
        // O conteúdo de '#ficha' foi movido para Csheet.js
        const contentSections = {
            '#conta': `
                <header class="content-header">
                    <h1>Sua Conta</h1>
                    <p>Visualize as informações da sua conta profissional.</p>
                </header>
                <div class="account-details-container">
                    <div class="coc-section" id="personal-info-section">
                        <div class="section-header"><h3>Informações Pessoais</h3></div>
                        <div class="info-grid">
                            <div class="info-item"><label>Nome de Usuário</label><input type="text" id="account-username" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Email</label><input type="email" id="account-email" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Data de Nascimento</label><input type="text" id="account-birthdate" value="Carregando..." disabled></div>
                        </div>
                    </div>
                    <div class="coc-section" id="professional-info-section">
                        <div class="section-header"><h3>Informações Profissionais</h3></div>
                        <div class="info-grid">
                            <div class="info-item"><label>ID do Funcionário</label><input type="text" id="account-employee_id" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Cargo (Categoria)</label><input type="text" id="account-role" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Departamento</label><input type="text" id="account-department" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Data de Contratação</label><input type="text" id="account-hire_date" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Gerente Direto</label><input type="text" id="account-manager" value="Carregando..." disabled></div>
                            <div class="info-item"><label>Status</label><input type="text" id="account-status" value="Carregando..." disabled></div>
                        </div>
                    </div>
                </div>`,
            '#documentos': `
                <header class="content-header"><h1>Documentos</h1><p>Faça o upload e gerencie seus documentos.</p></header>
                <section class="content-section">
                    <h2>Enviar Novo Documento</h2>
                    <div class="upload-area"><p>Arraste e solte arquivos aqui ou clique para selecionar</p></div>
                    <h2>Documentos Enviados</h2>
                    <ul class="document-list">
                        <li class="document-item"><span>Contrato_Assinado.pdf</span><button class="cta-button-edit">Baixar</button></li>
                        <li class="document-item"><span>Certificado_React_Avançado.pdf</span><button class="cta-button-edit">Baixar</button></li>
                    </ul>
                </section>`,
            '#projetos': `
                <header class="content-header"><h1>Projetos</h1><p>Visualize os projetos nos quais você está alocado.</p></header>
                <section class="content-section">
                    <h2>Meus Projetos</h2>
                    <div class="project-grid">
                        <div class="project-card"><h3>Sistema de Gestão Interna</h3><p>Desenvolvimento do novo CRM da empresa.</p><span class="project-status">Em Andamento</span></div>
                        <div class="project-card"><h3>Portal do Cliente V2</h3><p>Migração do portal legado para nova arquitetura.</p><span class="project-status">Em Andamento</span></div>
                        <div class="project-card"><h3>API de Pagamentos</h3><p>Manutenção e novas features na API.</p><span class="project-status">Concluído</span></div>
                    </div>
                </section>`,
            '#chat': `
                <header class="content-header"><h1>Chat</h1><p>Comunique-se com a equipe e administradores.</p></header>
                <section class="content-section">
                    <div class="chat-window">
                        <div class="message-list"><!-- Mensagens apareceriam aqui --></div>
                        <div class="chat-input"><input type="text" placeholder="Digite sua mensagem..."><button>Enviar</button></div>
                    </div>
                </section>`,
            '#arquivos-confidenciais': `
                <header class="content-header"><h1>Arquivos Confidenciais</h1><p>Acesso restrito a documentos e projetos.</p></header>
                <section class="content-section">
                    <h2>Navegador de Arquivos</h2>
                    <div class="file-browser">
                        <!-- Exemplo de item. Isso será populado dinamicamente -->
                        <div class="file-item folder"><i class="fas fa-folder"></i> Projeto Chronos (workerB)</div>
                        <div class="file-item folder locked"><i class="fas fa-folder-lock"></i> Projeto Paradoxo (workerA)</div>
                        <div class="file-item"><i class="fas fa-file-pdf"></i> Relatório_Anual_2014.pdf</div>
                    </div>
                </section>`
        };
        
        async function renderContent(hash) {
            // Se a aba for a ficha, chama a função de Csheet.js
            if (hash === '#ficha') {
                // Verifica se a função do Csheet.js já foi carregada
                if (typeof initializeCharacterSheet === 'function') {
                    await initializeCharacterSheet(mainContent, session, showToast);
                } else {
                    mainContent.innerHTML = '<div>Carregando módulo da ficha... Por favor, aguarde.</div>';
                    // Adiciona um pequeno delay para esperar o script carregar, se necessário
                    setTimeout(() => renderContent(hash), 100);
                }
                return;
            }

            // Lógica para as outras seções
            mainContent.innerHTML = contentSections[hash] || '<div>Página não encontrada ou sem permissão.</div>';
            
            // Carrega os dados da conta do usuário
            if (hash === '#conta') {
                const accountData = await loadAccountData();
                if (accountData) {
                    for (const key in accountData) {
                        // Garante que estamos preenchendo apenas os campos da conta
                        const input = document.getElementById(`account-${key}`);
                        if (input) {
                            input.value = accountData[key] || '';
                        }
                    }
                }
            }
        }

        // --- EVENT LISTENERS E INICIALIZAÇÃO ---
        sidebarNav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || link.style.display === 'none' || !link.getAttribute('href').startsWith('#')) return;

            e.preventDefault();
            const hash = link.getAttribute('href');
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            localStorage.setItem('activeDashboardTab', hash);
            renderContent(hash);
        });

        let initialHash = localStorage.getItem('activeDashboardTab') || '#conta';
        let linkToActivate = document.querySelector(`.sidebar-nav a[href="${initialHash}"]`);

        if (!linkToActivate || linkToActivate.style.display === 'none') {
            linkToActivate = visibleLinks[0];
            initialHash = linkToActivate ? linkToActivate.getAttribute('href') : '#';
        }
        
        if (linkToActivate) {
            sidebarLinks.forEach(l => l.classList.remove('active'));
            linkToActivate.classList.add('active');
            renderContent(initialHash);
        } else {
            mainContent.innerHTML = "<h1>Bem-vindo!</h1><p>Você não tem permissão para visualizar nenhuma seção.</p>";
        }
    }

    function checkForSupabase() {
        if (window.supabase) {
            const { createClient } = window.supabase;
            supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // --- INÍCIO DA LÓGICA DE LOGOUT ---
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', async (e) => {
                    e.preventDefault(); // Previne o comportamento padrão do link
                    
                    await supabaseClient.auth.signOut();
                    localStorage.clear(); // Limpa a sessão do navegador
                    window.location.href = '/login'; // Redireciona para o login
                });
            }
            // --- FIM DA LÓGICA DE LOGOUT ---

            // --- INÍCIO: ADICIONAR LINK DE ADMIN ---
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'workerAdmin') {
                const sidebarNav = document.querySelector('.sidebar-nav');
                const logoutButton = document.getElementById('logout-button');
                
                if (sidebarNav && logoutButton) {
                    const adminLink = document.createElement('a');
                    adminLink.href = '/admin/dashboard';
                    adminLink.innerHTML = '<i class="fas fa-user-shield"></i> Painel Admin';
                    
                    // Insere o link de admin antes do botão de sair
                    sidebarNav.insertBefore(adminLink, logoutButton);
                }
            }
            // --- FIM: ADICIONAR LINK DE ADMIN ---

            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (session) {
                    initializeDashboard(session);
                } else {
                    if (!dashboardInitialized) {
                        window.location.href = '/login';
                    }
                }
            });
        } else {
            setTimeout(checkForSupabase, 50);
        }
    }

    checkForSupabase();
});