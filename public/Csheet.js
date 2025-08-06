// Este arquivo encapsula toda a lógica da Ficha de Investigador.

// A função 'showToast' é necessária para a rolagem de dados.
// Ela será passada como argumento de 'dashboard.js'.

// O objeto 'occupations' é carregado globalmente em 'occupations.js'
// e estará disponível como 'window.occupations'.

// Função principal para inicializar a ficha de personagem
async function initializeCharacterSheet(mainContent, session, showToast) {
    const occupations = window.occupations || {};

    // --- FUNÇÕES DE DADOS (loadSheetData, saveSheetData) ---
    async function loadSheetData() {
        try {
            const token = session.access_token;
            const response = await fetch('/api/sheet', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error('Dados da ficha não encontrados, usando valores padrão.');
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar dados da ficha:', error);
            return null;
        }
    }

    async function saveSheetData(data) {
        try {
            const token = session.access_token;
            const response = await fetch('/api/sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Falha ao salvar os dados.');
            console.log('Dados salvos com sucesso!');
            showToast('Ficha salva com sucesso!', 'success');
            return await response.json();
        } catch (error) {
            console.error('Erro ao salvar dados da ficha:', error);
            showToast('Erro ao salvar a ficha.', 'error');
        }
    }

    // --- LÓGICA DE ROLAGEM DE DADOS ---
    function rollD100() {
        return Math.floor(Math.random() * 100) + 1;
    }

    function evaluateRoll(roll, targetValue) {
        const extremeSuccess = Math.floor(targetValue / 5);
        const hardSuccess = Math.floor(targetValue / 2);

        if (roll === 1) return { level: 'Sucesso Crítico!', type: 'success' };
        if (roll === 100) return { level: 'Falha Crítica!', type: 'error' };
        if (targetValue < 100 && roll > 95) return { level: 'Falha Crítica!', type: 'error' };

        if (roll <= extremeSuccess) return { level: 'Sucesso Extremo', type: 'success' };
        if (roll <= hardSuccess) return { level: 'Sucesso Bom', type: 'success' };
        if (roll <= targetValue) return { level: 'Sucesso Normal', type: 'info' };
        
        return { level: 'Falha', type: 'error' };
    }

    function handleDiceRoll(e) {
        const button = e.currentTarget;
        const targetValue = parseInt(button.dataset.targetValue, 10);
        const label = button.dataset.label;

        if (isNaN(targetValue)) {
            showToast('Valor da perícia/atributo inválido.', 'error');
            return;
        }

        const roll = rollD100();
        const result = evaluateRoll(roll, targetValue);

        const toastMessage = `
            <strong>${label}</strong><br>
            Rolagem: <strong>${roll}</strong> (Alvo: ${targetValue})<br>
            Resultado: <span class="toast-result ${result.type}">${result.level}</span>
        `;
        showToast(toastMessage, result.type, 5000);
    }

    // --- LÓGICA DE EDIÇÃO E CÁLCULO DA FICHA ---
    function handleEditToggle(e) {
        const button = e.currentTarget;
        const section = button.closest('.coc-section');
        const isEditing = section.classList.contains('editing');
        const inputs = section.querySelectorAll('input, textarea, select');
        const resourceButtons = section.querySelectorAll('.adjust-btn');

        if (isEditing) {
            section.classList.remove('editing');
            button.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            inputs.forEach(input => input.disabled = true);
            resourceButtons.forEach(btn => btn.disabled = true);
            const sheetData = collectAllSheetData();
            saveSheetData(sheetData);
        } else {
            section.classList.add('editing');
            button.innerHTML = '<i class="fas fa-save"></i>';
            inputs.forEach(input => input.disabled = false);
            resourceButtons.forEach(btn => btn.disabled = false);
        }
    }

    function collectAllSheetData() {
        const data = {};
        document.querySelectorAll('#ficha input, #ficha textarea, #ficha select').forEach(input => {
            if (input.id) {
                data[input.id] = input.value;
            }
        });
        // Salva também os valores atuais de vida e sanidade
        data['char-hp-current'] = document.getElementById('char-hp-current')?.textContent || '0';
        data['char-san-current'] = document.getElementById('char-san-current')?.textContent || '0';
        return data;
    }

    function populateSheet(data) {
        if (!data) return;
        Object.keys(data).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.value = data[id];
                } else if (element.tagName === 'SPAN') {
                    // Para popular os valores atuais de HP e SAN
                    element.textContent = data[id];
                }
            }
        });
    }

    function updateResourceBars() {
        const hpCurrent = parseInt(document.getElementById('char-hp-current').textContent, 10) || 0;
        const hpMax = parseInt(document.getElementById('char-hp-max').textContent, 10) || 1;
        const sanCurrent = parseInt(document.getElementById('char-san-current').textContent, 10) || 0;
        const sanMax = parseInt(document.getElementById('char-san-max').textContent, 10) || 1;

        const hpPercentage = (hpCurrent / hpMax) * 100;
        const sanPercentage = (sanCurrent / sanMax) * 100;

        document.getElementById('hp-bar-fill').style.width = `${hpPercentage}%`;
        document.getElementById('san-bar-fill').style.width = `${sanPercentage}%`;
    }

    function updateSkillPointPools(charValues) {
        const occupationSelect = document.getElementById('char-occupation');
        if (!occupationSelect) return;

        const selectedOccupationKey = occupationSelect.value;
        const occupation = occupations[selectedOccupationKey];

        document.querySelectorAll('.skill-item').forEach(item => item.classList.remove('occupational-skill'));

        let maxOccPoints = 0;
        if (occupation && typeof occupation.points === 'function') {
            maxOccPoints = occupation.points(charValues);
            occupation.skills.forEach(skillIdentifier => {
                if (skillIdentifier === 'interpessoal') {
                    document.querySelectorAll('[data-category="interpessoal"]').forEach(item => item.classList.add('occupational-skill'));
                } else {
                    const skillElement = document.getElementById(`char-skill-${skillIdentifier}`);
                    if (skillElement) skillElement.classList.add('occupational-skill');
                }
            });
        }
        const maxPersPoints = (charValues.int || 0) * 2;

        let spentOccPoints = 0;
        let spentPersPoints = 0;
        document.querySelectorAll('.skill-input').forEach(input => {
            const value = parseInt(input.value, 10) || 0;
            if (value > 0) {
                if (input.closest('.skill-item').classList.contains('occupational-skill')) {
                    spentOccPoints += value;
                } else {
                    spentPersPoints += value;
                }
            }
        });

        document.getElementById('occupational-points-spent').textContent = spentOccPoints;
        document.getElementById('occupational-points-max').textContent = maxOccPoints;
        document.getElementById('personal-points-spent').textContent = spentPersPoints;
        document.getElementById('personal-points-max').textContent = maxPersPoints;
    }

    function calculateSheet() {
        const values = {};
        document.querySelectorAll('.char-input').forEach(input => {
            if (input.id) {
                const key = input.id.replace('char-', '');
                values[key] = parseInt(input.value, 10) || 0;
            }
        });

        // Calcular valores derivados dos atributos
        document.querySelectorAll('#attributes-section .stat-item').forEach(item => {
            const input = item.querySelector('.char-input');
            const value = parseInt(input.value, 10) || 0;
            item.querySelector('.stat-derived span:first-child').textContent = Math.floor(value / 2);
            item.querySelector('.stat-derived span:last-child').textContent = Math.floor(value / 5);
            const rollBtn = item.querySelector('.roll-btn');
            if (rollBtn) rollBtn.dataset.targetValue = value;
        });

        // Calcular HP, SAN, DB, Build, MOV
        const hpMax = Math.floor((values.con + values.siz) / 10);
        const sanMax = values.pow;
        const hpCurrentSpan = document.getElementById('char-hp-current');
        const sanCurrentSpan = document.getElementById('char-san-current');
        document.getElementById('char-hp-max').textContent = hpMax;
        document.getElementById('char-san-max').textContent = sanMax;
        document.getElementById('char-san-fifth').textContent = Math.floor(sanMax / 5);

        if (parseInt(hpCurrentSpan.textContent, 10) === 0 || isNaN(parseInt(hpCurrentSpan.textContent, 10))) {
            hpCurrentSpan.textContent = hpMax;
        }
        if (parseInt(sanCurrentSpan.textContent, 10) === 0 || isNaN(parseInt(sanCurrentSpan.textContent, 10))) {
            sanCurrentSpan.textContent = sanMax;
        }

        const strPlusSiz = values.for + values.siz;
        let db = 'Nenhum';
        let build = 0;
        if (strPlusSiz >= 2 && strPlusSiz <= 64) { db = '-2'; build = -2; }
        else if (strPlusSiz <= 84) { db = '-1'; build = -1; }
        else if (strPlusSiz <= 124) { db = 'Nenhum'; build = 0; }
        else if (strPlusSiz <= 164) { db = '+1d4'; build = 1; }
        else if (strPlusSiz <= 204) { db = '+1d6'; build = 2; }
        document.getElementById('char-db').textContent = db;
        document.getElementById('char-build').textContent = build;

        let mov = 7;
        if (values.dex < values.siz && values.for < values.siz) mov = 7;
        else if (values.dex > values.siz && values.for > values.siz) mov = 9;
        else mov = 8;
        const age = parseInt(document.getElementById('char-age').value, 10) || 0;
        if (age >= 40 && age < 50) mov -= 1;
        if (age >= 50 && age < 60) mov -= 2;
        if (age >= 60 && age < 70) mov -= 3;
        if (age >= 70 && age < 80) mov -= 4;
        if (age >= 80) mov -= 5;
        document.getElementById('char-mov').textContent = mov;

        // Calcular Perícias
        document.querySelectorAll('.skill-item').forEach(item => {
            let baseValue = 0;
            const skillAttr = item.dataset.baseSkill;
            if (skillAttr) {
                const multiplier = parseFloat(item.dataset.baseSkillMultiplier) || 1;
                baseValue = Math.floor((values[skillAttr] || 0) * multiplier);
                item.querySelector('.skill-base-value').textContent = `(${baseValue}%)`;
            } else {
                baseValue = parseInt(item.dataset.base, 10) || 0;
            }
            const investedPoints = Math.min(parseInt(item.querySelector('.skill-input').value, 10) || 0, 99);
            const total = baseValue + investedPoints;
            item.querySelector('.skill-total').textContent = total;
            item.querySelector('.skill-half').textContent = Math.floor(total / 2);
            item.querySelector('.skill-fifth').textContent = Math.floor(total / 5);
            const rollButton = item.querySelector('.roll-btn');
            if (rollButton) {
                rollButton.dataset.targetValue = total;
            }
        });

        updateResourceBars();
        updateSkillPointPools(values);
    }

    function handleResourceAdjust(e) {
        const button = e.currentTarget;
        const resource = button.dataset.resource; // 'hp' or 'san'
        const amount = parseInt(button.dataset.amount, 10);

        const currentEl = document.getElementById(`char-${resource}-current`);
        const maxEl = document.getElementById(`char-${resource}-max`);

        let currentValue = parseInt(currentEl.textContent, 10);
        const maxValue = parseInt(maxEl.textContent, 10);

        currentValue = Math.max(0, Math.min(maxValue, currentValue + amount));
        currentEl.textContent = currentValue;

        updateResourceBars();
    }

    // --- CONTEÚDO HTML DA FICHA ---
    const sheetHTML = `
        <header class="content-header">
            <h1>Ficha de Investigador</h1>
            <div class="header-actions">
                <button id="save-sheet-btn" class="cta-button"><i class="fas fa-save"></i> Salvar Alterações</button>
            </div>
        </header>
        <div class="new-sheet-layout" id="ficha">
            <!-- SEÇÃO DE INFORMAÇÕES E RECURSOS -->
            <div class="sheet-section-info">
                <div class="info-basic">
                    <div class="info-avatar"><i class="fas fa-user-secret"></i></div>
                    <div class="info-fields">
                        <div class="field-item"><label for="char-name">Nome</label><input type="text" id="char-name" class="char-input"></div>
                        <div class="field-item"><label for="char-player">Jogador</label><input type="text" id="char-player" class="char-input"></div>
                        <div class="field-item"><label for="char-occupation">Ocupação</label>
                            <select id="char-occupation" class="char-input">
                                <option value="">-- Selecione --</option>
                            </select>
                        </div>
                        <div class="field-item"><label for="char-age">Idade</label><input type="number" id="char-age" class="char-input"></div>
                        <div class="field-item"><label for="char-sex">Sexo</label><input type="text" id="char-sex" class="char-input"></div>
                        <div class="field-item"><label for="char-birthplace">Nascimento</label><input type="text" id="char-birthplace" class="char-input"></div>
                    </div>
                </div>
                <div class="info-resources">
                     <div class="resource-stat-container">
                        <label>Pontos de Vida</label>
                        <div class="resource-bar-wrapper">
                            <div class="resource-controls">
                                <button class="adjust-btn" data-resource="hp" data-amount="-1">&lsaquo;</button>
                            </div>
                            <div class="resource-bar">
                                <div id="hp-bar-fill" class="resource-bar-fill hp"></div>
                                <div class="resource-value-text"><span id="char-hp-current">0</span> / <span id="char-hp-max">0</span></div>
                            </div>
                            <div class="resource-controls">
                                <button class="adjust-btn" data-resource="hp" data-amount="1">&rsaquo;</button>
                            </div>
                        </div>
                    </div>
                    <div class="resource-stat-container">
                        <label>Pontos de Sanidade</label>
                        <div class="resource-bar-wrapper">
                             <div class="resource-controls">
                                <button class="adjust-btn" data-resource="san" data-amount="-1">&lsaquo;</button>
                            </div>
                            <div class="resource-bar">
                                <div id="san-bar-fill" class="resource-bar-fill san"></div>
                                <div class="resource-value-text"><span id="char-san-current">0</span> / <span id="char-san-max">0</span></div>
                            </div>
                            <div class="resource-controls">
                                <button class="adjust-btn" data-resource="san" data-amount="1">&rsaquo;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SEÇÃO DE CARACTERÍSTICAS -->
            <div class="sheet-section-attributes">
                 <div class="section-header"><h3>Características</h3></div>
                 <div class="stats-grid">
                    <div class="stat-item"><label>FOR</label><input type="number" id="char-for" class="char-input"><div class="stat-derived"><span id="char-for-half"></span><span id="char-for-fifth"></span></div><button class="roll-btn" data-label="FOR"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>CON</label><input type="number" id="char-con" class="char-input"><div class="stat-derived"><span id="char-con-half"></span><span id="char-con-fifth"></span></div><button class="roll-btn" data-label="CON"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>TAM</label><input type="number" id="char-siz" class="char-input"><div class="stat-derived"><span id="char-siz-half"></span><span id="char-siz-fifth"></span></div><button class="roll-btn" data-label="TAM"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>DES</label><input type="number" id="char-dex" class="char-input"><div class="stat-derived"><span id="char-dex-half"></span><span id="char-dex-fifth"></span></div><button class="roll-btn" data-label="DES"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>APA</label><input type="number" id="char-app" class="char-input"><div class="stat-derived"><span id="char-app-half"></span><span id="char-app-fifth"></span></div><button class="roll-btn" data-label="APA"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>INT</label><input type="number" id="char-int" class="char-input"><div class="stat-derived"><span id="char-int-half"></span><span id="char-int-fifth"></span></div><button class="roll-btn" data-label="INT"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>POD</label><input type="number" id="char-pow" class="char-input"><div class="stat-derived"><span id="char-pow-half"></span><span id="char-pow-fifth"></span></div><button class="roll-btn" data-label="POD"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>EDU</label><input type="number" id="char-edu" class="char-input"><div class="stat-derived"><span id="char-edu-half"></span><span id="char-edu-fifth"></span></div><button class="roll-btn" data-label="EDU"><i class="fas fa-dice-d20"></i></button></div>
                    <div class="stat-item"><label>Sorte</label><input type="number" id="char-luck" class="char-input"><div class="stat-derived"><span id="char-luck-half"></span><span id="char-luck-fifth"></span></div><button class="roll-btn" data-label="Sorte"><i class="fas fa-dice-d20"></i></button></div>
                </div>
            </div>

            <!-- SEÇÃO DE PERÍCIAS -->
            <div class="sheet-section-skills">
                <div class="section-header">
                    <h3>Perícias</h3>
                    <div class="skill-point-pools">
                        <div class="skill-point-pool">
                            <label>Ocupacionais:</label>
                            <div class="points-display"><span id="occupational-points-spent">0</span> / <span id="occupational-points-max">0</span></div>
                        </div>
                        <div class="skill-point-pool">
                            <label>Pessoais:</label>
                            <div class="points-display"><span id="personal-points-spent">0</span> / <span id="personal-points-max">0</span></div>
                        </div>
                    </div>
                </div>
                <div class="skills-grid-header">
                    <span class="header-skill">Perícia</span>
                    <span class="header-invested">Treino</span>
                    <span class="header-total">Total</span>
                    <span class="header-derived">½</span>
                    <span class="header-derived">⅕</span>
                    <span class="header-roll">Rolar</span>
                </div>
                <div class="skills-grid">
                    <!-- As perícias serão inseridas aqui pelo JS -->
                </div>
            </div>

            <!-- SEÇÃO DE COMBATE -->
            <div class="sheet-section-combat">
                <div class="section-header"><h3>Combate</h3></div>
                <div class="combat-stats">
                    <div class="combat-stat-item"><label>Bônus de Dano (DB)</label><span id="char-db"></span></div>
                    <div class="combat-stat-item"><label>Corpo (Build)</label><span id="char-build"></span></div>
                    <div class="combat-stat-item"><label>Movimento (MOV)</label><span id="char-mov"></span></div>
                    <div class="combat-stat-item"><label>Esquiva</label><span id="combat-dodge-total"></span></div>
                </div>
                <div class="combat-weapons-header">
                    <span>Arma</span><span>Dano</span><span>Perícia</span><span>Alcance</span><span>Munição</span><span>Rajada</span>
                </div>
                <div class="combat-weapons">
                    <div class="weapon-item">
                        <input type="text" placeholder="Lutar (Brigar)" class="weapon-name">
                        <input type="text" placeholder="1d3+DB" class="weapon-damage">
                        <span class="weapon-skill" id="weapon-skill-brawl">0</span>
                        <input type="text" placeholder="Toque" class="weapon-range">
                        <input type="text" placeholder="-" class="weapon-ammo">
                        <input type="text" placeholder="-" class="weapon-burst">
                    </div>
                     <div class="weapon-item">
                        <input type="text" placeholder="Arma de Fogo" class="weapon-name">
                        <input type="text" placeholder="1d10" class="weapon-damage">
                        <span class="weapon-skill" id="weapon-skill-firearm">0</span>
                        <input type="text" placeholder="15m" class="weapon-range">
                        <input type="text" placeholder="12" class="weapon-ammo">
                        <input type="text" placeholder="1" class="weapon-burst">
                    </div>
                    <!-- Adicionar mais armas se necessário -->
                </div>
            </div>
        </div>
    `;

    // --- LISTA DE PERÍCIAS (para facilitar a renderização) ---
    const skillsList = [
        {id: 'antropologia', name: 'Antropologia', base: 1},
        {id: 'armas-de-fogo-pistolas', name: 'Armas de Fogo (Pistolas)', base: 20},
        {id: 'armas-de-fogo-rifles-escopetas', name: 'Armas de Fogo (Rifles/Escopetas)', base: 25},
        {id: 'arqueologia', name: 'Arqueologia', base: 1},
        {id: 'arremessar', name: 'Arremessar', base: 20},
        {id: 'arte-criacao', name: 'Arte/Criação', base: 5, spec: true, placeholder: 'Fotografia'},
        {id: 'chaveiro', name: 'Chaveiro', base: 1},
        {id: 'ciencia', name: 'Ciência', base: 1, spec: true, placeholder: 'Química'},
        {id: 'contabilidade', name: 'Contabilidade', base: 5},
        {id: 'credito', name: 'Crédito', base: 1},
        {id: 'dirigir', name: 'Dirigir', base: 20},
        {id: 'disfarces', name: 'Disfarces', base: 5},
        {id: 'encontrar', name: 'Encontrar', base: 25},
        {id: 'escalar', name: 'Escalar', base: 20},
        {id: 'esconder', name: 'Esconder', base: 20},
        {id: 'escutar', name: 'Escutar', base: 25},
        {id: 'esquivar', name: 'Esquivar', baseSkill: 'dex', baseSkillMultiplier: 0.5},
        {id: 'estimar', name: 'Estimar', base: 5},
        {id: 'historia', name: 'História', base: 5},
        {id: 'intimidar', name: 'Intimidar', base: 15, category: 'interpessoal'},
        {id: 'labia', name: 'Lábia', base: 5, category: 'interpessoal'},
        {id: 'leis', name: 'Leis', base: 5},
        {id: 'lingua-mater', name: 'Língua (Materna)', baseSkill: 'edu', baseSkillMultiplier: 1},
        {id: 'lingua-outra', name: 'Língua (Outra)', base: 1, spec: true, placeholder: 'Inglês'},
        {id: 'lutar-brigar', name: 'Lutar (Brigar)', base: 25},
        {id: 'medicina', name: 'Medicina', base: 1},
        {id: 'mitologia-cthulhu', name: 'Mitologia Cthulhu', base: 0},
        {id: 'mundo-natural', name: 'Mundo Natural', base: 10},
        {id: 'nadar', name: 'Nadar', base: 20},
        {id: 'navegacao', name: 'Navegação', base: 10},
        {id: 'ocultismo', name: 'Ocultismo', base: 5},
        {id: 'op-maq-pesadas', name: 'Op. Máq. Pesadas', base: 1, spec: true, placeholder: 'Escavadeira'},
        {id: 'persuadir', name: 'Persuadir', base: 10, category: 'interpessoal'},
        {id: 'pilotar', name: 'Pilotar', base: 1, spec: true, placeholder: 'Avião'},
        {id: 'prestidigitacao', name: 'Prestidigitação', base: 10},
        {id: 'primeiros-socorros', name: 'Primeiros Socorros', base: 30},
        {id: 'psicanalise', name: 'Psicanálise', base: 1},
        {id: 'psicologia', name: 'Psicologia', base: 10},
        {id: 'rastrear', name: 'Rastrear', base: 10},
        {id: 'rep-eletronicos', name: 'Rep. Eletrônicos', base: 10},
        {id: 'rep-mecanicos', name: 'Rep. Mecânicos', base: 10},
        {id: 'saltar', name: 'Saltar', base: 20},
        {id: 'seducao', name: 'Sedução', base: 15, category: 'interpessoal'},
        {id: 'sobrevivencia', name: 'Sobrevivência', base: 10},
        {id: 'usar-biblioteca', name: 'Usar Biblioteca', base: 20},
        {id: 'usar-eletronicos', name: 'Usar Eletrônicos', base: 1}
    ];

    function renderSkills() {
        const skillsGrid = document.querySelector('.skills-grid');
        if (!skillsGrid) return;
        skillsGrid.innerHTML = '';
        skillsList.forEach(skill => {
            const skillId = `char-skill-${skill.id}`;
            const specInput = skill.spec ? `<input type="text" class="skill-spec" placeholder="(${skill.placeholder})">` : '';
            const baseValueText = skill.baseSkill ? `(${skill.baseSkill.toUpperCase()}/${skill.baseSkillMultiplier === 0.5 ? 2 : 1})` : `(${String(skill.base).padStart(2, '0')}%)`;

            const skillHTML = `
                <div id="${skillId}" class="skill-item" 
                     data-base="${skill.base || 0}" 
                     ${skill.baseSkill ? `data-base-skill="${skill.baseSkill}"` : ''}
                     ${skill.baseSkillMultiplier ? `data-base-skill-multiplier="${skill.baseSkillMultiplier}"` : ''}
                     ${skill.category ? `data-category="${skill.category}"` : ''}>
                    
                    <div class="skill-name-container">
                        <i class="fas fa-diamond"></i>
                        <label class="skill-name">${skill.name} ${specInput}</label>
                        <span class="skill-base-value" style="display:none;">${baseValueText}</span>
                    </div>
                    <input type="number" class="skill-input" value="0" max="99">
                    <span class="skill-total"></span>
                    <span class="skill-half"></span>
                    <span class="skill-fifth"></span>
                    <button class="roll-btn" data-label="${skill.name}"><i class="fas fa-dice-d20"></i></button>
                </div>
            `;
            skillsGrid.innerHTML += skillHTML;
        });
    }

    // --- INICIALIZAÇÃO DA RENDERIZAÇÃO ---
    mainContent.innerHTML = sheetHTML;
    renderSkills();

    // Preencher o seletor de ocupações
    const occupationSelect = document.getElementById('char-occupation');
    if (occupationSelect && occupations) {
        Object.keys(occupations).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = occupations[key].name;
            occupationSelect.appendChild(option);
        });
    }

    // Carregar dados salvos, popular a ficha e calcular os valores
    const savedData = await loadSheetData();
    if (savedData) {
        populateSheet(savedData);
    }
    calculateSheet();

    // Adicionar todos os event listeners
    document.querySelectorAll('#ficha .roll-btn').forEach(button => {
        button.addEventListener('click', handleDiceRoll);
    });
    document.querySelectorAll('#ficha .adjust-btn').forEach(button => {
        button.addEventListener('click', handleResourceAdjust);
    });
    document.querySelectorAll('#ficha .char-input, #ficha .skill-input').forEach(input => {
        input.addEventListener('input', calculateSheet);
    });

    // Listener para o botão de salvar principal
    const saveButton = document.getElementById('save-sheet-btn');
    if(saveButton) {
        saveButton.addEventListener('click', () => {
            const sheetData = collectAllSheetData();
            saveSheetData(sheetData);
        });
    }
}