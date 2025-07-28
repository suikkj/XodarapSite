# Xodarap - Portal Corporativo e Plataforma ARG

Este projeto é uma aplicação web multifacetada que serve como um portal corporativo para a empresa fictícia "Xodarap". Ele combina funcionalidades de um dashboard de funcionário com elementos de um Jogo de Realidade Alternativa (ARG), incluindo um sistema de ficha de personagem inspirado em RPGs de mesa.

## ✨ Funcionalidades Principais

-   **Autenticação de Usuários**: Sistema completo de registro e login.
-   **Controle de Acesso Baseado em Papéis (RBAC)**:
    -   **`workerAdmin`**: Acesso total ao painel de administração para gerenciar usuários e dados.
    -   **`workerA` a `workerD`**: Níveis de permissão hierárquicos que restringem o acesso a diferentes seções do dashboard.
-   **Dashboards Distintos**:
    -   **`/dashboard`**: Painel para funcionários, com seções dinâmicas baseadas em suas permissões.
    -   **`/admin/dashboard`**: Painel de administração para gerenciamento de usuários.
-   **Dashboard do Funcionário**:
    -   **Conta**: Visualização dos dados profissionais.
    -   **Ficha**: Uma ficha de personagem interativa (estilo Call of Cthulhu) com atributos, perícias e cálculos automáticos.
    -   **Rolagem de Dados**: Funcionalidade de rolagem de d100 integrada à ficha.
    -   **Seções Restritas**: Acesso a "Documentos", "Projetos" e "Arquivos Confidenciais" determinado pelo nível de permissão.
-   **Painel de Administração**:
    -   Visualização de todos os usuários registrados.
    -   Edição de dados e do cargo (`role`) de cada usuário.
    -   Criação e gerenciamento de fichas de dados para os usuários.

## 🚀 Tecnologias Utilizadas

-   **Backend**: Node.js, Express.js
-   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
-   **Motor de Template**: EJS (Embedded JavaScript)
-   **Autenticação e Banco de Dados**: Supabase
    -   Autenticação de usuários.
    -   Banco de dados PostgreSQL para armazenar perfis de usuário, cargos e fichas de dados (`sheet_data`).
-   **Ícones**: Font Awesome

## 📂 Estrutura do Projeto

```
/
├── public/                     # Arquivos estáticos (CSS, JS do cliente, fontes)
│   ├── admin-dashboard.js      # Lógica do painel de admin
│   ├── admin_style.css         # Estilos específicos do painel de admin
│   ├── auth.js                 # Lógica de login e registro
│   ├── dashboard.js            # Lógica do dashboard do funcionário
│   ├── dashboard_style.css     # Estilos do dashboard
│   ├── occupations.js          # Definições das ocupações para a ficha
│   └── style.css               # Estilos globais
├── admin-dashboard.ejs         # Template do painel de admin
├── dashboard.ejs               # Template do dashboard do funcionário
├── index.ejs                   # Template da página inicial
├── login.ejs                   # Template da página de login
├── package.json                # Dependências e scripts do projeto
├── server.js                   # Servidor Express e rotas da API
└── supabaseClient.js           # Configuração dos clientes Supabase
```

## ⚙️ Instalação e Configuração

1.  **Clone o repositório:**
    ```sh
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    ```

3.  **Configure o Supabase:**
    -   Crie um novo projeto no [Supabase](https://supabase.com/).
    -   Vá para **Project Settings > API** e copie a URL do projeto e a chave `anon public`.
    -   Vá para **Project Settings > Database** e copie a sua senha do banco de dados.
    -   Vá para **Authentication > Providers** e habilite o provedor de Email. Desative a opção "Confirm email" para facilitar os testes iniciais.

4.  **Configure as Variáveis de Ambiente:**
    -   Renomeie o arquivo `.env.example` (se houver) para `.env` ou crie um novo.
    -   Adicione as chaves do seu projeto Supabase:
        ```.env
        SUPABASE_URL=SUA_URL_SUPABASE
        SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
        SUPABASE_SERVICE_KEY=SUA_CHAVE_SERVICE_ROLE
        ```

5.  **Configure o Banco de Dados Supabase:**
    -   Vá para o **SQL Editor** no seu painel Supabase.
    -   Execute o seguinte SQL para criar a tabela `profiles` e habilitar o RLS (Row Level Security):
        ```sql
        -- Cria a tabela para armazenar perfis de usuário
        CREATE TABLE public.profiles (
          id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'workerD',
          sheet_data JSONB,
          PRIMARY KEY (id)
        );

        -- Habilita a segurança em nível de linha
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Política: Usuários podem ver seus próprios perfis
        CREATE POLICY "Allow individual read access" ON public.profiles FOR SELECT USING (auth.uid() = id);

        -- Política: Usuários podem atualizar seus próprios perfis
        CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING (auth.uid() = id);

        -- Função para criar um perfil automaticamente quando um novo usuário se registra
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, role)
          VALUES (new.id, 'workerD');
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Gatilho que chama a função acima após cada novo registro
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
        ```

6.  **Inicie o servidor:**
    ```sh
    npm start
    ```

7.  Acesse a aplicação em `http://localhost:3000`.
