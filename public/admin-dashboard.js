document.addEventListener('DOMContentLoaded', () => {
    // 1. USE O OBJETO 'window.SUPABASE_CONFIG'
    const SUPABASE_URL = window.SUPABASE_CONFIG.URL;
    const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.ANON_KEY;
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const mainContent = document.querySelector('.main-content');
    const logoutButton = document.getElementById('logout-button');
    let adminDashboardInitialized = false;

    // --- FUNÇÃO DE NOTIFICAÇÃO (TOAST) ---
    function showToast(message, type = 'info') {
        // Remove qualquer toast existente para não empilhar
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Força um reflow para a animação funcionar na criação
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove o toast após 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove o elemento do DOM após a animação de saída
            toast.addEventListener('transitionend', () => toast.remove());
        }, 4000);
    }

    function initializeAdminDashboard(session) {
        if (adminDashboardInitialized) return;
        adminDashboardInitialized = true;

        const sidebarNav = document.querySelector('.sidebar-nav');
        const sidebarLinks = sidebarNav.querySelectorAll('a');

        // --- CONTEÚDO DAS SEÇÕES (ADAPTADO DO DASHBOARD.JS) ---
        const contentSections = {
            '#conta': `
                <header class="content-header">
                    <h1>Sua Conta (Admin)</h1>
                    <p>Visualize as informações da sua conta profissional.</p>
                </header>
                <div class="account-details-container">
                    <div class="coc-section" id="personal-info-section">
                        <div class="section-header"><h3>Informações Pessoais</h3></div>
                        <div class="info-grid">
                            <div class="info-item"><label>Nome de Usuário</label><input type="text" value="Admin" disabled></div>
                            <div class="info-item"><label>Email</label><input type="email" value="${session.user.email}" disabled></div>
                        </div>
                    </div>
                    <div class="coc-section" id="professional-info-section">
                        <div class="section-header"><h3>Informações Profissionais</h3></div>
                        <div class="info-grid">
                            <div class="info-item"><label>ID do Funcionário</label><input type="text" value="XDRP-ADMIN" disabled></div>
                            <div class="info-item"><label>Cargo (Categoria)</label><input type="text" value="Administrador do Sistema" disabled></div>
                            <div class="info-item"><label>Status</label><input type="text" value="Ativo" disabled></div>
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
                <header class="content-header"><h1>Arquivos Confidenciais</h1><p>Acesso irrestrito a todos os documentos e projetos.</p></header>
                <section class="content-section">
                    <h2>Navegador de Arquivos (Visão de Admin)</h2>
                    <div class="file-browser">
                        <div class="file-item folder"><i class="fas fa-folder"></i> Projeto Chronos (workerB)</div>
                        <div class="file-item folder"><i class="fas fa-folder"></i> Projeto Paradoxo (workerA)</div>
                        <div class="file-item"><i class="fas fa-file-pdf"></i> Relatório_Anual_2014.pdf</div>
                    </div>
                </section>`,
            '#administracao': `
                <header class="content-header">
                    <h1>Administração de Usuários</h1>
                    <p>Gerencie os usuários e suas permissões.</p>
                </header>
                <div class="admin-user-management">
                    <div class="user-list-container">
                        <h2>Usuários Registrados</h2>
                        <ul id="user-list" class="user-list"><p>Carregando usuários...</p></ul>
                    </div>
                    <div class="user-details-container">
                        <h2>Detalhes do Usuário</h2>
                        <div id="user-details"><p>Selecione um usuário para ver os detalhes.</p></div>
                    </div>
                </div>`
        };

        // --- FUNÇÕES DE DADOS (ADMIN) ---
        async function fetchUsers() {
            try {
                const response = await fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Falha ao carregar usuários.');
                }
                const users = await response.json();
                renderUserList(users);
            } catch (error) {
                console.error(error.message);
                const userList = document.getElementById('user-list');
                if(userList) userList.innerHTML = `<p style="color: red;">${error.message}</p>`;
            }
        }

        function renderUserList(users) {
            const userList = document.getElementById('user-list');
            if (!userList) return;
            userList.innerHTML = ''; // Limpa a lista antes de renderizar

            users.forEach(user => {
                // 1. Criar um elemento 'li' (item de lista)
                const userElement = document.createElement('li');
                userElement.className = 'user-item';
                userElement.dataset.userId = user.id;

                // 2. Montar o HTML interno com as classes corretas
                //    - 'user-info' para o email
                //    - 'user-role' e a própria role como classe para a tag
                userElement.innerHTML = `
                    <span class="user-info">${user.username || user.email}</span>
                    <span class="user-role ${user.role}">${user.role}</span>
                `;

                // 3. Adicionar o evento de clique
                userElement.addEventListener('click', () => {
                    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
                    userElement.classList.add('active');
                    const userDetails = document.getElementById('user-details');
                    if(userDetails) userDetails.innerHTML = `<p>Carregando detalhes para <strong>${user.username || user.email}</strong>...</p>`;
                    // AQUI: Ativamos a função para buscar os detalhes do usuário
                    fetchUserDetails(user.id);
                });

                userList.appendChild(userElement);
            });
        }

        async function fetchUserDetails(userId) {
            const userDetailsContainer = document.getElementById('user-details');
            try {
                const response = await fetch(`/api/admin/sheet/${userId}`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Falha ao carregar detalhes do usuário.');
                }

                const sheetData = await response.json();
                renderUserDetails(sheetData, userId); // Passa o ID do usuário também

            } catch (error) {
                console.error('Erro ao buscar detalhes do usuário:', error.message);
                if (userDetailsContainer) {
                    userDetailsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
                }
            }
        }

        // FUNÇÃO CORRIGIDA: Usa o 'session' para o token e aceita dados como parâmetro.
        async function updateUserSheet(userId, dataToSave) {
            // 1. Obter a sessão mais recente para garantir um token válido
            const { data: { session: currentSession }, error: sessionError } = await supabaseClient.auth.getSession();

            // 2. Validar se a sessão foi obtida com sucesso
            if (sessionError || !currentSession) {
                console.error('Erro ao obter sessão:', sessionError?.message);
                showToast('Sessão inválida ou expirada. Por favor, faça login novamente.', 'error');
                return;
            }

            try {
                const response = await fetch(`/api/admin/sheet/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        // 3. Usar o token recém-obtido
                        'Authorization': `Bearer ${currentSession.access_token}`
                    },
                    body: JSON.stringify(dataToSave)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha ao atualizar a ficha.');
                }

                const updatedSheet = await response.json();
                showToast('Ficha do usuário atualizada com sucesso!', 'success');
                
                // Re-renderiza os detalhes com os dados atualizados e na ordem correta.
                renderUserDetails(updatedSheet, userId); 

            } catch (error) {
                console.error('Erro ao atualizar a ficha:', error);
                showToast(`Erro: ${error.message}`, 'error'); // Usando o toast para o erro
                // Em caso de erro, reabilita o botão para que o usuário possa tentar novamente.
                const editButton = document.getElementById('edit-sheet-btn');
                if(editButton) {
                    editButton.disabled = false;
                    editButton.textContent = 'SALVAR ALTERAÇÕES';
                }
            }
        }

        function renderUserDetails(sheetData, userId) {
            const userDetailsContainer = document.getElementById('user-details');
            if (!userDetailsContainer) return;

            // Se a ficha estiver vazia, mostra a opção para criar uma.
            if (!sheetData || Object.keys(sheetData).length === 0) {
                userDetailsContainer.innerHTML = `
                    <div class="coc-section">
                        <p>Este usuário ainda não possui uma ficha de dados.</p>
                        <button id="create-sheet-btn" class="cta-button" style="margin-top: 1rem;">Criar Ficha Padrão</button>
                    </div>
                `;
                // Adiciona o evento para o botão de criar ficha
                document.getElementById('create-sheet-btn').addEventListener('click', () => {
                    const defaultSheet = {
                        username: 'Novo Usuário',
                        email: 'email@dominio.com',
                        role: 'WORKERD',
                        status: 'Ativo',
                        manager: 'Não definido',
                        department: 'Não definido',
                        employee_id: 'XDRP-000',
                        birthdate: '01/01/2000',
                        hire_date: new Date().toLocaleDateString('pt-BR'),
                    };
                    // Salva a ficha padrão e recarrega os detalhes
                    updateUserSheet(userId, defaultSheet);
                });
                return;
            }

            // Objeto de mapeamento de chaves para rótulos amigáveis
            const fieldLabels = {
                'username': 'Nome de Usuário',
                'email': 'Email',
                // 'role': 'Cargo', // Removido daqui para ser tratado separadamente
                'status': 'Status',
                'manager': 'Gerente',
                'department': 'Departamento',
                'employee_id': 'ID do Funcionário',
                'birthdate': 'Data de Nascimento',
                'hire_date': 'Data de Contratação',
            };

            // Lista de cargos possíveis para o dropdown
            const roles = ['workerAdmin', 'workerA', 'workerB', 'workerC', 'workerD'];
            let roleOptionsHtml = roles.map(r => 
                `<option value="${r}" ${sheetData.role === r ? 'selected' : ''}>${r}</option>`
            ).join('');

            // Gera o HTML dos campos de texto
            let infoGridHtml = '';
            for (const key in fieldLabels) {
                const label = fieldLabels[key];
                const value = sheetData[key] || '';
                infoGridHtml += `
                    <div class="info-item">
                        <label>${label}</label>
                        <input type="text" value="${value}" data-key="${key}" disabled>
                    </div>
                `;
            }

            // Monta o HTML final, inserindo o dropdown de cargo
            const detailsHtml = `
                <div class="coc-section" id="user-details-content">
                    <div class="info-grid">
                        ${infoGridHtml}
                        <!-- Dropdown para o Cargo -->
                        <div class="info-item">
                            <label>Cargo</label>
                            <select id="user-role-select" class="role-select" disabled>
                                ${roleOptionsHtml}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="sheet-actions" style="margin-top: 1.5rem;">
                    <button id="edit-sheet-btn" class="cta-button-edit">EDITAR FICHA</button>
                    <button id="delete-sheet-btn" class="cta-button-danger">APAGAR FICHA</button>
                </div>
            `;

            userDetailsContainer.innerHTML = detailsHtml;

            // --- LÓGICA DOS BOTÕES ---
            const editButton = document.getElementById('edit-sheet-btn');
            const infoInputs = userDetailsContainer.querySelectorAll('.info-grid input');
            const roleSelect = document.getElementById('user-role-select');

            editButton.addEventListener('click', () => {
                const isEditing = editButton.textContent.includes('SALVAR');

                if (isEditing) {
                    // --- LÓGICA PARA SALVAR ---
                    editButton.textContent = 'SALVANDO...';
                    editButton.disabled = true;

                    // 1. Coleta os dados da ficha (como antes)
                    const updatedSheetData = {};
                    infoInputs.forEach(input => {
                        updatedSheetData[input.dataset.key] = input.value;
                    });
                    
                    // 2. Coleta a nova role do dropdown
                    const newRole = roleSelect.value;

                    // CORREÇÃO: Adiciona a nova role aos dados da ficha a serem salvos
                    updatedSheetData.role = newRole;

                    // 3. Cria duas promessas: uma para atualizar a ficha, outra para a role
                    const updateSheetPromise = updateUserSheet(userId, updatedSheetData);
                    const updateRolePromise = updateUserRole(userId, newRole);

                    // 4. Executa ambas em paralelo e lida com o resultado
                    Promise.all([updateSheetPromise, updateRolePromise]).then(() => {
                        showToast('Ficha e cargo atualizados com sucesso!', 'success');
                        infoInputs.forEach(input => input.disabled = true);
                        roleSelect.disabled = true;
                        editButton.textContent = 'EDITAR FICHA';
                        fetchUsers(); // Atualiza a lista de usuários para refletir a nova role
                    }).catch(error => {
                        // O erro já é tratado dentro das funções, mas podemos logar aqui se quisermos
                        console.error("Falha em uma das atualizações:", error);
                    }).finally(() => {
                        editButton.disabled = false;
                    });

                } else {
                    // --- LÓGICA PARA HABILITAR EDIÇÃO ---
                    infoInputs.forEach(input => {
                        input.disabled = false;
                    });
                    roleSelect.disabled = false; // Habilita o dropdown
                    editButton.textContent = 'SALVAR ALTERAÇÕES';
                }
            });
        }

        // NOVA FUNÇÃO para atualizar apenas a role
        async function updateUserRole(userId, newRole) {
            const { data: { session: currentSession }, error: sessionError } = await supabaseClient.auth.getSession();
            if (sessionError || !currentSession) {
                showToast('Sessão inválida. Faça login novamente.', 'error');
                return Promise.reject('Sessão inválida');
            }

            try {
                const response = await fetch(`/api/admin/role/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentSession.access_token}`
                    },
                    body: JSON.stringify({ role: newRole })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha ao atualizar o cargo.');
                }
                // Não precisa de toast aqui, pois o Promise.all terá um geral
                return Promise.resolve();
            } catch (error) {
                showToast(`Erro ao atualizar cargo: ${error.message}`, 'error');
                return Promise.reject(error.message);
            }
        }


        // --- LÓGICA DE RENDERIZAÇÃO (DO DASHBOARD.JS) ---
        async function renderContent(hash) {
            mainContent.innerHTML = contentSections[hash] || '<div>Página não encontrada.</div>';

            // Lógica específica para a seção de administração
            if (hash === '#administracao') {
                await fetchUsers();
            }
        }

        // --- EVENT LISTENERS E INICIALIZAÇÃO (DO DASHBOARD.JS) ---
        sidebarNav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || !link.getAttribute('href').startsWith('#')) return;

            e.preventDefault();
            const hash = link.getAttribute('href');
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            localStorage.setItem('activeAdminTab', hash); // Usando uma chave diferente para o admin
            renderContent(hash);
        });

        const initialHash = localStorage.getItem('activeAdminTab') || '#conta';
        const linkToActivate = document.querySelector(`.sidebar-nav a[href="${initialHash}"]`);
        
        if (linkToActivate) {
            linkToActivate.click();
        } else {
            // Se o link salvo não existir, clica no primeiro link disponível
            document.querySelector('.sidebar-nav a').click();
        }
    }

    // --- VERIFICAÇÃO DE AUTENTICAÇÃO ---
    function checkForSupabase() {
        if (window.supabase) {
            const { createClient } = window.supabase;
            supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await supabaseClient.auth.signOut();
                    localStorage.clear();
                    window.location.href = '/login';
                });
            }

            let authCheckCompleted = false;
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (authCheckCompleted) return;
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    authCheckCompleted = true;
                    if (session) {
                        const userRole = localStorage.getItem('userRole');
                        if (userRole === 'workerAdmin') {
                            initializeAdminDashboard(session);
                        } else {
                            window.location.href = '/dashboard';
                        }
                    } else {
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