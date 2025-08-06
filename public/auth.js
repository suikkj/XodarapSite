document.addEventListener('DOMContentLoaded', () => {
    // 1. REMOVA AS CONSTANTES ANTIGAS E USE O OBJETO 'window.SUPABASE_CONFIG'
    const SUPABASE_URL = window.SUPABASE_CONFIG.URL;
    const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.ANON_KEY;
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerMessage = document.getElementById('registerMessage');

    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Alternar entre formulários
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // --- LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // 1. Autenticar o usuário
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

            if (loginError) {
                throw new Error(loginError.message);
            }

            if (loginData.user) {
                // 2. Login bem-sucedido. Agora, buscar a role na tabela 'profiles'.
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles') // O nome da sua tabela que contém a role
                    .select('role')
                    .eq('id', loginData.user.id)
                    .single();

                if (profileError) {
                    // Se houver erro ao buscar o perfil, trata como erro de login
                    throw new Error("Não foi possível carregar os dados do perfil: " + profileError.message);
                }

                // 3. Usar a role do perfil ou um padrão se não for encontrada
                const userRole = profileData ? profileData.role : 'workerD';
                localStorage.setItem('userRole', userRole);

                // 4. Redirecionar com base na role correta
                if (userRole === 'workerAdmin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            }

        } catch (error) {
            console.error('Login Error:', error.message); 
            loginError.textContent = 'Email ou senha inválidos. Verifique suas credenciais ou se o seu email foi confirmado.';
        }
    });

    // --- LÓGICA DE REGISTRO ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerMessage.textContent = '';
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            registerMessage.textContent = 'As senhas não coincidem.';
            return;
        }
        if (password.length < 6) {
            registerMessage.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao registrar.');
            }

            registerMessage.style.color = 'var(--accent-color)';
            registerMessage.textContent = data.message;

            // Se o registro já logou o usuário, redireciona
            if (data.session) {
                localStorage.setItem('userRole', 'workerD'); // Role padrão para novos usuários
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            }

        } catch (error) {
            registerMessage.style.color = 'var(--error-color)';
            registerMessage.textContent = error.message;
        }
    });
});
