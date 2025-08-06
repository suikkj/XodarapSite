/*
  Este arquivo define as ocupações disponíveis para os investigadores.
  - 'name': O nome exibido na interface.
  - 'credit_rating': A faixa de Crédito sugerida para a ocupação.
  - 'points': Uma função que calcula os pontos de perícia ocupacionais com base nos valores (v) das características do personagem.
  - 'skills': Uma lista de IDs de perícias ou categorias de perícias que são consideradas ocupacionais.
  - As regras de "outras perícias" devem ser gerenciadas pelo jogador, pois não podem ser automatizadas.
*/
const occupations = {
    'acrobata': {
        name: 'Acrobata',
        credit_rating: '9-20',
        points: (v) => v.edu * 2 + v.dex * 2,
        skills: [
            'char-skill-arremessar',
            'char-skill-encontrar',
            'char-skill-escalar',
            'char-skill-esquivar',
            'char-skill-natacao',
            'char-skill-saltar'
            // mais duas perícias
        ]
    },
    'advogado': {
        name: 'Advogado',
        credit_rating: '30-80',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-contabilidade',
            'char-skill-leis',
            'char-skill-usar-biblioteca',
            'interpessoal',
            'char-skill-psicologia'
            // mais duas perícias
        ]
    },
    'agente-federal': {
        name: 'Agente Federal',
        credit_rating: '20-40',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-armas-de-fogo-pistolas',
            'char-skill-leis',
            'char-skill-dirigir',
            'char-skill-encontrar',
            'char-skill-esconder', // Furtividade
            'char-skill-lutar-brigar',
            'char-skill-persuadir'
            // mais uma perícia
        ]
    },
    'agente-funerario': {
        name: 'Agente Funerário',
        credit_rating: '20-40',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-ciencia', // Biologia e Química
            'char-skill-contabilidade',
            'char-skill-dirigir',
            'char-skill-historia',
            'interpessoal',
            'char-skill-ocultismo',
            'char-skill-psicologia'
        ]
    },
    'agricultor': {
        name: 'Agricultor',
        credit_rating: '9-30',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-arte-criacao', // Agricultura
            'char-skill-rep-mecanicos',
            'char-skill-dirigir',
            'interpessoal',
            'char-skill-mundo-natural',
            'char-skill-op-maq-pesadas',
            'char-skill-rastrear'
            // mais uma perícia
        ]
    },
    'alienista': {
        name: 'Alienista [Clássica]',
        credit_rating: '10-60',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-ciencia', // Biologia e Química
            'char-skill-leis',
            'char-skill-escutar',
            'char-skill-medicina',
            'char-skill-lingua-outra',
            'char-skill-psicanalise',
            'char-skill-psicologia'
        ]
    },
    'alpinista': {
        name: 'Alpinista',
        credit_rating: '30-60',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-escalar',
            'char-skill-escutar',
            'char-skill-navegacao',
            'char-skill-lingua-outra',
            'char-skill-primeiros-socorros',
            'char-skill-rastrear',
            'char-skill-saltar',
            'char-skill-sobrevivencia'
        ]
    },
    'andarilho': {
        name: 'Andarilho',
        credit_rating: '0-5',
        points: (v) => v.edu * 2 + Math.max(v.apa, v.dex, v.for) * 2,
        skills: [
            'char-skill-escalar',
            'char-skill-saltar',
            'char-skill-escutar',
            'char-skill-navegacao',
            'interpessoal',
            'char-skill-esconder', // Furtividade
            'char-skill-mundo-natural'
            // mais duas perícias
        ]
    },
    'animador': {
        name: 'Animador',
        credit_rating: '9-70',
        points: (v) => v.edu * 2 + v.apa * 2,
        skills: [
            'char-skill-arte-criacao', // Atuação, Canto, Comediante
            'char-skill-disfarces',
            'char-skill-escutar',
            'interpessoal',
            'char-skill-psicologia'
            // mais duas perícias
        ]
    },
    'antiquario': {
        name: 'Antiquário',
        credit_rating: '30-70',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-arte-criacao',
            'char-skill-estimar', // Avaliação
            'char-skill-historia',
            'char-skill-usar-biblioteca',
            'char-skill-lingua-outra',
            'interpessoal',
            'char-skill-encontrar'
            // mais uma perícia
        ]
    },
    'apostador': {
        name: 'Apostador',
        credit_rating: '8-50',
        points: (v) => v.edu * 2 + Math.max(v.apa, v.dex) * 2,
        skills: [
            'char-skill-arte-criacao', // Atuação
            'char-skill-contabilidade',
            'char-skill-encontrar',
            'char-skill-escutar',
            'interpessoal',
            'char-skill-prestidigitacao',
            'char-skill-psicologia'
            // mais uma perícia
        ]
    },
    'arqueologo': {
        name: 'Arqueólogo',
        credit_rating: '10-40',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-arqueologia',
            'char-skill-estimar', // Avaliação
            'char-skill-historia',
            'char-skill-usar-biblioteca',
            'char-skill-lingua-outra',
            'char-skill-rep-mecanicos',
            'char-skill-encontrar',
            'char-skill-navegacao'
        ]
    },
    'artista': {
        name: 'Artista',
        credit_rating: '9-50',
        points: (v) => v.edu * 2 + Math.max(v.pow, v.dex) * 2,
        skills: [
            'char-skill-arte-criacao',
            'char-skill-historia',
            'char-skill-mundo-natural',
            'interpessoal',
            'char-skill-lingua-outra',
            'char-skill-psicologia',
            'char-skill-encontrar'
            // mais uma perícia
        ]
    },
    'atleta': {
        name: 'Atleta',
        credit_rating: '9-70',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-escalar',
            'char-skill-saltar',
            'char-skill-lutar-brigar',
            'interpessoal',
            'char-skill-nadar',
            'char-skill-arremessar'
            // mais uma perícia
        ]
    },
    'autor': {
        name: 'Autor',
        credit_rating: '9-30',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-arte-criacao', // Literatura
            'char-skill-historia',
            'char-skill-usar-biblioteca',
            'char-skill-mundo-natural',
            'char-skill-lingua-outra',
            'char-skill-psicologia'
            // mais uma perícia
        ]
    },
    'bibliotecario': {
        name: 'Bibliotecário',
        credit_rating: '9-35',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-contabilidade',
            'char-skill-usar-biblioteca',
            'char-skill-lingua-outra',
            'char-skill-lingua-mater'
            // mais quatro perícias
        ]
    },
    'clero': {
        name: 'Clero, Membro do',
        credit_rating: '9-60',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-contabilidade',
            'char-skill-historia',
            'char-skill-usar-biblioteca',
            'char-skill-escutar',
            'char-skill-lingua-outra',
            'interpessoal',
            'char-skill-psicologia'
            // mais uma perícia
        ]
    },
    'criminoso': {
        name: 'Criminoso',
        credit_rating: '5-65',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'interpessoal',
            'char-skill-esconder', // Furtividade
            'char-skill-disfarces',
            'char-skill-armas-de-fogo-pistolas',
            'char-skill-chaveiro',
            'char-skill-rep-mecanicos',
            'char-skill-prestidigitacao'
            // mais uma perícia
        ]
    },
    'detetive-particular': {
        name: 'Detetive Particular',
        credit_rating: '9-30',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-arte-criacao', // Fotografia
            'char-skill-disfarces',
            'char-skill-leis',
            'char-skill-usar-biblioteca',
            'interpessoal',
            'char-skill-psicologia',
            'char-skill-encontrar'
            // mais uma perícia
        ]
    },
    'diletante': {
        name: 'Diletante',
        credit_rating: '50-99',
        points: (v) => v.edu * 2 + v.apa * 2,
        skills: [
            'char-skill-arte-criacao',
            'char-skill-armas-de-fogo-pistolas',
            'char-skill-lingua-outra',
            'interpessoal'
            // mais três perícias
        ]
    },
    'engenheiro': {
        name: 'Engenheiro',
        credit_rating: '30-70',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-arte-criacao', // Desenho Técnico
            'char-skill-ciencia', // Engenharia, Física
            'char-skill-usar-biblioteca',
            'char-skill-rep-eletronicos',
            'char-skill-rep-mecanicos',
            'char-skill-op-maq-pesadas'
            // mais uma perícia
        ]
    },
    'fanatico': {
        name: 'Fanático',
        credit_rating: '0-30',
        points: (v) => v.edu * 2 + v.apa * 2,
        skills: [
            'char-skill-historia',
            'interpessoal',
            'char-skill-psicologia',
            'char-skill-esconder' // Furtividade
            // mais três perícias
        ]
    },
    'fazendeiro': {
        name: 'Fazendeiro',
        credit_rating: '9-30',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-arte-criacao', // Trabalhos de Fazenda
            'char-skill-dirigir', // Automóveis
            'interpessoal',
            'char-skill-rep-mecanicos',
            'char-skill-mundo-natural',
            'char-skill-op-maq-pesadas',
            'char-skill-rastrear',
            'char-skill-primeiros-socorros'
            // mais uma perícia
        ]
    },
    'hacker': {
        name: 'Hacker',
        credit_rating: '10-70',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-usar-eletronicos', // Usar Computadores
            'char-skill-rep-eletronicos',
            'char-skill-usar-biblioteca',
            'interpessoal',
            'char-skill-encontrar'
            // mais duas perícias
        ]
    },
    'investigador-policia': {
        name: 'Investigador de Polícia',
        credit_rating: '20-50',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-arte-criacao', // Atuar ou Disfarce
            'char-skill-armas-de-fogo-pistolas',
            'char-skill-leis',
            'interpessoal',
            'char-skill-psicologia',
            'char-skill-encontrar'
            // mais uma perícia
        ]
    },
    'jornalista': {
        name: 'Jornalista',
        credit_rating: '9-30',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-arte-criacao', // Fotografia
            'char-skill-historia',
            'char-skill-usar-biblioteca',
            'char-skill-lingua-mater',
            'interpessoal',
            'char-skill-psicologia'
            // mais duas perícias
        ]
    },
    'medico': {
        name: 'Médico',
        credit_rating: '30-80',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-primeiros-socorros',
            'char-skill-lingua-outra', // Latim
            'char-skill-medicina',
            'char-skill-psicologia',
            'char-skill-ciencia' // Biologia, Farmácia
            // mais duas perícias
        ]
    },
    'membro-tribo': {
        name: 'Membro de Tribo',
        credit_rating: '0-15',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-escalar',
            'char-skill-lutar-brigar',
            'char-skill-arremessar',
            'char-skill-mundo-natural',
            'char-skill-escutar',
            'char-skill-ocultismo',
            'char-skill-encontrar',
            'char-skill-nadar',
            'char-skill-sobrevivencia'
            // mais uma perícia
        ]
    },
    'missionario': {
        name: 'Missionário',
        credit_rating: '0-30',
        points: (v) => v.edu * 2 + v.apa * 2,
        skills: [
            'char-skill-arte-criacao',
            'char-skill-primeiros-socorros',
            'char-skill-rep-mecanicos',
            'char-skill-medicina',
            'char-skill-mundo-natural',
            'interpessoal'
            // mais duas perícias
        ]
    },
    'musico': {
        name: 'Músico',
        credit_rating: '9-30',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.pow) * 2,
        skills: [
            'char-skill-arte-criacao', // Instrumento
            'interpessoal'
            // mais quatro perícias
        ]
    },
    'oficial-policia': {
        name: 'Oficial de Polícia',
        credit_rating: '9-30',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-lutar-brigar',
            'char-skill-armas-de-fogo-pistolas',
            'char-skill-primeiros-socorros',
            'interpessoal',
            'char-skill-dirigir',
            'char-skill-psicologia',
            'char-skill-encontrar'
            // mais uma perícia
        ]
    },
    'oficial-militar': {
        name: 'Oficial Militar',
        credit_rating: '20-70',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-contabilidade',
            'char-skill-armas-de-fogo-pistolas',
            'char-skill-navegacao',
            'interpessoal',
            'char-skill-psicologia',
            'char-skill-sobrevivencia'
            // mais uma perícia
        ]
    },
    'parapsicologo': {
        name: 'Parapsicólogo',
        credit_rating: '9-30',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-antropologia',
            'char-skill-arte-criacao', // Fotografia
            'char-skill-historia',
            'char-skill-usar-biblioteca',
            'char-skill-ocultismo',
            'char-skill-lingua-outra',
            'char-skill-psicologia'
            // mais uma perícia
        ]
    },
    'piloto': {
        name: 'Piloto',
        credit_rating: '20-70',
        points: (v) => v.edu * 2 + v.dex * 2,
        skills: [
            'char-skill-rep-eletronicos',
            'char-skill-rep-mecanicos',
            'char-skill-navegacao',
            'char-skill-op-maq-pesadas',
            'char-skill-pilotar',
            'char-skill-ciencia' // Astronomia
            // mais duas perícias
        ]
    },
    'professor': {
        name: 'Professor',
        credit_rating: '20-70',
        points: (v) => v.edu * 4,
        skills: [
            'char-skill-usar-biblioteca',
            'char-skill-lingua-outra',
            'char-skill-lingua-mater',
            'char-skill-psicologia'
            // mais quatro perícias
        ]
    },
    'profissional-entretenimento': {
        name: 'Profissional de Entretenimento',
        credit_rating: '9-70',
        points: (v) => v.edu * 2 + v.apa * 2,
        skills: [
            'char-skill-arte-criacao', // Atuação
            'char-skill-disfarces',
            'interpessoal',
            'char-skill-escutar',
            'char-skill-psicologia'
            // mais duas perícias
        ]
    },
    'soldado': {
        name: 'Soldado',
        credit_rating: '9-30',
        points: (v) => v.edu * 2 + Math.max(v.dex, v.for) * 2,
        skills: [
            'char-skill-escalar',
            'char-skill-nadar',
            'char-skill-esquivar',
            'char-skill-lutar-brigar',
            'char-skill-esconder', // Furtividade
            'char-skill-sobrevivencia',
            'char-skill-rep-mecanicos',
            'char-skill-primeiros-socorros',
            'char-skill-lingua-outra'
        ]
    }
};