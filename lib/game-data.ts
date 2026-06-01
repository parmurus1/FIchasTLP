// ============================================================
// Ao Tauarua — Dados do Sistema de Jogo
// ============================================================

export type Atributo = 'FOR' | 'DES' | 'CON' | 'INT' | 'CAR' | 'LIVRE';

export interface Ancestralidade {
  nome: string;
  pv: number;
  tamanho: string;
  deslocamento: string;
  bonuses: Atributo[];
  defeitos: Atributo[];
  idiomas: string[];
  tracos: string[];
  heranças: { id: string; nome: string; desc: string }[];
  habilidade_racial: string;
  habilidade_racial_desc: string;
}

export const ANCESTRALIDADES: Record<string, Ancestralidade> = {
  Abissal: {
    nome: 'Abissal',
    pv: 8,
    tamanho: 'Médio',
    deslocamento: '30 pés',
    bonuses: ['DES', 'INT', 'LIVRE'],
    defeitos: ['CAR'],
    idiomas: ['Comum', 'Infernal', 'Abissal'],
    tracos: ['Abissal', 'Humanoide'],
    heranças: [
      { id: 'sombrio', nome: 'Abissal Sombrio', desc: 'Visão no Escuro + +2 Furtividade em pouca luz.' },
      { id: 'sangue-quente', nome: 'Abissal Sangue-Quente', desc: 'Resistência 2 a fogo + +2 em Atletismo contra empurrões.' },
      { id: 'lingua-prata', nome: 'Abissal Língua de Prata', desc: '+2 em Diplomacia ou Enganação. Pode pedir favores a hostis.' },
    ],
    habilidade_racial: 'Toque Angustiante',
    habilidade_racial_desc: '1x/encontro: +1d4 dano e +1 Intimidação contra o alvo até o fim do próximo turno.',
  },
  Selléto: {
    nome: 'Selléto',
    pv: 8,
    tamanho: 'Médio',
    deslocamento: '20 pés',
    bonuses: ['DES', 'INT', 'LIVRE'],
    defeitos: ['CAR'],
    idiomas: ['Comum (entende)', 'Selléto (entende)'],
    tracos: ['Selléto', 'Humanoide', 'Eidolônico'],
    heranças: [
      { id: 'veu-pano', nome: 'Selléto do Véu de Pano', desc: '+2 Furtividade. Ocultar sob leve cobertura.' },
      { id: 'sombra-viva', nome: 'Selléto da Sombra Viva', desc: 'Resistência 2 a dano negativo + Visão no Escuro.' },
      { id: 'olhos-ampliados', nome: 'Selléto dos Olhos Ampliados', desc: '+1 Percepção. Sem penalidade no escuro.' },
    ],
    habilidade_racial: 'Sussurro do Além',
    habilidade_racial_desc: 'Telepatia 30 pés. 1x/descanso: Distorção de Voz (ação livre).',
  },
  'Alto Goblin': {
    nome: 'Alto Goblin',
    pv: 8,
    tamanho: 'Pequeno',
    deslocamento: '25 pés',
    bonuses: ['INT', 'DES', 'LIVRE'],
    defeitos: ['CON'],
    idiomas: ['Comum', 'Goblin'],
    tracos: ['Goblin', 'Humanoide'],
    heranças: [
      { id: 'urbanita', nome: 'Alto Goblin Urbanita', desc: '+2 Acrobacia para Escalar/Saltar. Ignora terreno urbano difícil.' },
      { id: 'espertinho', nome: 'Alto Goblin Espertinho', desc: '+1 Percepção para iniciativa. Sacar como ação gratuita 1x/encontro.' },
      { id: 'maos-ligeiras', nome: 'Alto Goblin Mãos Ligeiras', desc: '+2 Ladroagem. Roubar/Esconder com distração leve.' },
    ],
    habilidade_racial: 'Pulo Nervoso',
    habilidade_racial_desc: '1x/encontro: refaz teste de Reflexo/Acrobacia. +5 pés de deslocamento até fim da cena.',
  },
  Anão: {
    nome: 'Anão',
    pv: 10,
    tamanho: 'Médio',
    deslocamento: '20 pés',
    bonuses: ['CON', 'INT', 'LIVRE'],
    defeitos: ['CAR'],
    idiomas: ['Comum', 'Anão'],
    tracos: ['Anão', 'Humanoide'],
    heranças: [
      { id: 'bebum', nome: 'Anão Bebum', desc: 'Resistência a Veneno. +1 Fortitude contra Enjoado/Náusea. Pós-álcool: +1 dano desarmado.' },
      { id: 'forja', nome: 'Anão de Forja', desc: 'Resistência 2 a fogo + treinamento em Ferraria.' },
      { id: 'colinas', nome: 'Anão das Colinas', desc: 'Ignora terreno rochoso. +2 Atletismo para Escalar.' },
    ],
    habilidade_racial: 'Estabilidade Enânica',
    habilidade_racial_desc: '+3 contra empurrar, derrubar ou ser movido involuntariamente.',
  },
  Elfo: {
    nome: 'Elfo',
    pv: 6,
    tamanho: 'Médio',
    deslocamento: '30 pés',
    bonuses: ['INT', 'DES', 'LIVRE'],
    defeitos: ['CON'],
    idiomas: ['Comum', 'Élfico'],
    tracos: ['Elfo', 'Humanoide'],
    heranças: [
      { id: 'bosques', nome: 'Elfo dos Bosques', desc: '+5 pés em florestas + Visão no Escuro.' },
      { id: 'celico', nome: 'Elfo Célico', desc: 'Detectar magia 1x/descanso.' },
      { id: 'ancestral', nome: 'Elfo Ancestral', desc: 'Ganhe um talento de nível 1 de outro ancestral.' },
    ],
    habilidade_racial: 'Graça Élfica',
    habilidade_racial_desc: '1x/encontro: ignora dano de queda pela metade + +2 Reflexos por 1 rodada.',
  },
  Humano: {
    nome: 'Humano',
    pv: 8,
    tamanho: 'Médio',
    deslocamento: '25 pés',
    bonuses: ['LIVRE', 'LIVRE'],
    defeitos: [],
    idiomas: ['Comum', '+ 1 idioma à escolha'],
    tracos: ['Humano', 'Humanoide'],
    heranças: [
      { id: 'perito', nome: 'Herança Perita', desc: 'Treinado em 1 perícia extra. No nível 5 torna-se Especialista.' },
      { id: 'meio-elfo', nome: 'Meio Elfo', desc: 'Traço Elfo, Visão na Penumbra. Pode pegar talentos de Elfo/Humano.' },
      { id: 'meio-faricc', nome: 'Meio Faricc', desc: 'Traço Faricc, Biblioteca Viva. Pode pegar talentos de Faricc/Humano.' },
    ],
    habilidade_racial: 'Natureza Cooperativa',
    habilidade_racial_desc: '+4 de circunstância em testes para Auxiliar.',
  },
  'Demi-Humano': {
    nome: 'Demi-Humano',
    pv: 7,
    tamanho: 'Médio',
    deslocamento: '25 pés',
    bonuses: ['LIVRE', 'LIVRE', 'LIVRE'],
    defeitos: [],
    idiomas: ['Comum', 'Silvestre'],
    tracos: ['Humanoide', 'Bestial'],
    heranças: [
      { id: 'rocheda', nome: 'Demi-Humano Rocheda', desc: '+2 Atletismo para Resistir. Redução de Dano 1 no 1º golpe por combate.' },
      { id: 'agil', nome: 'Demi-Humano Ágil', desc: '+2 Acrobacia. Ignora 1,5m de terreno difícil por rodada.' },
      { id: 'marinho', nome: 'Demi-Humano Marinho', desc: '+2 Atletismo para Nadar. Prender respiração até 5 minutos.' },
    ],
    habilidade_racial: 'Adaptabilidade Instintiva',
    habilidade_racial_desc: '1x/encontro: refaz teste de perícia que falhou. +1 circunstância na próxima ação relacionada.',
  },
  Froppy: {
    nome: 'Froppy',
    pv: 6,
    tamanho: 'Pequeno',
    deslocamento: '15 pés (25 pés nadando)',
    bonuses: ['DES', 'LIVRE', 'LIVRE'],
    defeitos: ['FOR'],
    idiomas: ['Comum', 'Miclitano'],
    tracos: ['Miclitano', 'Humanoide', 'Anfíbio'],
    heranças: [
      { id: 'quadrupede', nome: 'Froppy Quadrúpede', desc: '+5 pés ao correr (Stride).' },
      { id: 'pantano', nome: 'Froppy de Pântano', desc: 'Ignora terreno difícil de lama/brejo/água rasa.' },
      { id: 'acido', nome: 'Froppy Ácido-Defensivo', desc: 'Agressor corpo a corpo sofre 1 dano ácido (1x/turno).' },
    ],
    habilidade_racial: 'Escapulir Escorregadio',
    habilidade_racial_desc: '+2 Acrobacia para Escape. Escapar mesmo de criaturas maiores.',
  },
  Faricc: {
    nome: 'Faricc',
    pv: 12,
    tamanho: 'Grande',
    deslocamento: '25 pés',
    bonuses: ['INT', 'LIVRE'],
    defeitos: ['FOR'],
    idiomas: ['Comum', 'Faricc'],
    tracos: ['Humanoide', 'Faricc'],
    heranças: [
      { id: 'mente-primitiva', nome: 'Faricc da Mente Primitiva', desc: '+2 Recordar Conhecimento. 1x/cena: rola 2x e fica com o melhor.' },
      { id: 'sangue-misturado', nome: 'Faricc de Sangue Misturado', desc: 'Um traço racial adicional de uma raça ancestral mista.' },
      { id: 'olhos-ancestrais', nome: 'Faricc dos Olhos Ancestrais', desc: 'Visão no Escuro + +3 Percepção contra ilusões/disfarces.' },
    ],
    habilidade_racial: 'Biblioteca Viva',
    habilidade_racial_desc: '1x/descanso: considere treinado em qualquer perícia baseada em INT por 10 minutos.',
  },
};

export interface Biografia {
  nome: string;
  desc: string;
  bonuses: Atributo[][];  // each sub-array is a choice group, LIVRE means free pick
  pericias: string[];
}

export const BIOGRAFIAS: Record<string, Biografia> = {
  'Acólito': {
    nome: 'Acólito',
    desc: 'Passou boa parte da vida em convento ou monastério religioso.',
    bonuses: [['INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Religião', 'Saber: Escrita'],
  },
  'Acrobata': {
    nome: 'Acrobata',
    desc: 'Ganhou dinheiro se apresentando como acrobata em circos ou ruas.',
    bonuses: [['FOR', 'DES', 'LIVRE'], ['LIVRE']],
    pericias: ['Acrobacia', 'Saber: Circo'],
  },
  'Advogado': {
    nome: 'Advogado',
    desc: 'Instruído em assuntos legais, capaz de argumentar em corte.',
    bonuses: [['INT', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Diplomacia', 'Saber: Leis'],
  },
  'Apostador': {
    nome: 'Apostador',
    desc: 'A emoção da vitória o levou aos jogos de azar.',
    bonuses: [['DES', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Dissimulação', 'Saber: Jogos'],
  },
  'Apresentador': {
    nome: 'Apresentador',
    desc: 'Aprendeu a entreter multidões como ator, músico ou mágico.',
    bonuses: [['DES', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Performance', 'Saber: Teatro'],
  },
  'Artesão': {
    nome: 'Artesão',
    desc: 'Praticou uma forma específica de construção ou manufatura.',
    bonuses: [['FOR', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Manufatura', 'Saber: Guilda'],
  },
  'Artista': {
    nome: 'Artista',
    desc: 'A arte é sua maior paixão, independentemente da forma.',
    bonuses: [['DES', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Manufatura', 'Saber: Artes'],
  },
  'Batedor': {
    nome: 'Batedor',
    desc: 'Chama os ermos de lar, vivendo entre trilhas e guiando viajantes.',
    bonuses: [['DES', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Sobrevivência', 'Saber: Terreno (escolha)'],
  },
  'Caçador': {
    nome: 'Caçador',
    desc: 'Perseguiu e abateu animais e criaturas dos ermos.',
    bonuses: [['DES', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Sobrevivência', 'Saber: Curtume'],
  },
  'Caçador de Recompensas': {
    nome: 'Caçador de Recompensas',
    desc: 'Enche os bolsos capturando infratores da lei.',
    bonuses: [['FOR', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Sobrevivência', 'Saber: Leis'],
  },
  'Charlatão': {
    nome: 'Charlatão',
    desc: 'Viajava vendendo falsas adivinhações e fingindo ser nobre exilado.',
    bonuses: [['INT', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Dissimulação', 'Saber: Submundo'],
  },
  'Criança de Rua': {
    nome: 'Criança de Rua',
    desc: 'Sobreviveu batendo carteiras nas ruas de uma cidade grande.',
    bonuses: [['DES', 'CON', 'LIVRE'], ['LIVRE']],
    pericias: ['Ladroagem', 'Dissimulação'],
  },
  'Criminoso': {
    nome: 'Criminoso',
    desc: 'Viveu uma vida de crimes como independente ou membro do submundo.',
    bonuses: [['DES', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Furtividade', 'Saber: Submundo'],
  },
  'Detetive': {
    nome: 'Detetive',
    desc: 'Solucionou crimes como inspetor ou investigador privado.',
    bonuses: [['INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Sociedade', 'Saber: Submundo'],
  },
  'Discípulo Marcial': {
    nome: 'Discípulo Marcial',
    desc: 'Passou por treinamento intenso para tornar-se grande combatente.',
    bonuses: [['FOR', 'DES', 'LIVRE'], ['LIVRE']],
    pericias: ['Acrobacia ou Atletismo (escolha)', 'Saber: Guerra'],
  },
  'Emissário': {
    nome: 'Emissário',
    desc: 'Como diplomata ou mensageiro, viajou por várias terras distantes.',
    bonuses: [['INT', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Sociedade', 'Saber: Cidade (escolha)'],
  },
  'Encantador de Animais': {
    nome: 'Encantador de Animais',
    desc: 'Sempre sentiu forte ligação com os animais.',
    bonuses: [['CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Natureza', 'Saber: Terreno (escolha)'],
  },
  'Eremita': {
    nome: 'Eremita',
    desc: 'Viveu solitariamente em local isolado, como caverna ou oásis remoto.',
    bonuses: [['CON', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Natureza ou Ocultismo (escolha)', 'Saber: Terreno (escolha)'],
  },
  'Estudioso': {
    nome: 'Estudioso',
    desc: 'Isolou-se do mundo exterior para aprender tudo que pode.',
    bonuses: [['INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Arcanismo / Natureza / Ocultismo / Religião (escolha)', 'Saber: Acadêmico'],
  },
  'Funileiro': {
    nome: 'Funileiro',
    desc: 'Tem necessidade de resolver problemas através de invenções.',
    bonuses: [['DES', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Manufatura', 'Saber: Engenharia'],
  },
  'Gladiador': {
    nome: 'Gladiador',
    desc: 'Aprendeu a arte do combate nos sanguinários jogos de arena.',
    bonuses: [['FOR', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Performance', 'Saber: Gladiatório'],
  },
  'Guarda': {
    nome: 'Guarda',
    desc: 'Serviu em uma guarda por patriotismo ou necessidade financeira.',
    bonuses: [['FOR', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Intimidação', 'Saber: Guerra'],
  },
  'Herbalista': {
    nome: 'Herbalista',
    desc: 'Aprendeu as propriedades curativas de várias ervas.',
    bonuses: [['CON', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Natureza', 'Saber: Herbalismo'],
  },
  'Lavrador': {
    nome: 'Lavrador',
    desc: 'Lavrou a terra e cuidou da colheita com costas fortes.',
    bonuses: [['CON', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Atletismo', 'Saber: Agricultura'],
  },
  'Marinheiro': {
    nome: 'Marinheiro',
    desc: 'Ouve o chamado do mar desde novo, navegando entre nações.',
    bonuses: [['FOR', 'DES', 'LIVRE'], ['LIVRE']],
    pericias: ['Atletismo', 'Saber: Navegação'],
  },
  'Médico de Campo': {
    nome: 'Médico de Campo',
    desc: 'No caos da batalha, aprendeu a tratar os feridos rapidamente.',
    bonuses: [['CON', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Medicina', 'Saber: Guerra'],
  },
  'Mercador': {
    nome: 'Mercador',
    desc: 'Permutou mercadorias por dinheiro em lojas, mercados ou caravanas.',
    bonuses: [['INT', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Diplomacia', 'Saber: Mercantil'],
  },
  'Mineirador': {
    nome: 'Mineirador',
    desc: 'Passou a vida arrancando minerais das profundezas escuras da terra.',
    bonuses: [['FOR', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Sobrevivência', 'Saber: Mineração'],
  },
  'Nobre': {
    nome: 'Nobre',
    desc: 'Cresceu sob pesadas obrigações e traições intrigas da nobreza.',
    bonuses: [['INT', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Sociedade', 'Saber: Genealogia ou Heráldica'],
  },
  'Nômade': {
    nome: 'Nômade',
    desc: 'Viajou por toda parte, aprendendo a sobreviver na estrada.',
    bonuses: [['CON', 'INT', 'LIVRE'], ['LIVRE']],
    pericias: ['Sobrevivência', 'Saber: Terreno (escolha)'],
  },
  'Operário': {
    nome: 'Operário',
    desc: 'Passou anos realizando trabalho físico árduo.',
    bonuses: [['FOR', 'CON', 'LIVRE'], ['LIVRE']],
    pericias: ['Atletismo', 'Saber: Trabalho'],
  },
  'Prisioneiro': {
    nome: 'Prisioneiro',
    desc: 'Foi aprisionado por crimes (culpado ou não) ou escravizado.',
    bonuses: [['FOR', 'CON', 'LIVRE'], ['LIVRE']],
    pericias: ['Furtividade', 'Saber: Submundo'],
  },
  'Soldado': {
    nome: 'Soldado',
    desc: 'Entrou em batalha como mercenário, protetor nômade ou miliciano.',
    bonuses: [['FOR', 'CON', 'LIVRE'], ['LIVRE']],
    pericias: ['Intimidação', 'Saber: Guerra'],
  },
  'Taverneiro': {
    nome: 'Taverneiro',
    desc: 'Trabalhou num bar, especialista em bebida e socialização.',
    bonuses: [['CON', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Diplomacia', 'Saber: Álcool'],
  },
  'Vidente': {
    nome: 'Vidente',
    desc: 'Aprendeu formas tradicionais de adivinhação do futuro.',
    bonuses: [['INT', 'CAR', 'LIVRE'], ['LIVRE']],
    pericias: ['Ocultismo', 'Saber: Vidência'],
  },
};

// Bônus de proficiência de salvamento por nível
// 'T' = Treinado (+2), 'E' = Especialista (+4), '' = sem proficiência (só mod atributo)
export type NivelSalvamento = 'T' | 'E' | '';

export interface Classe {
  nome: string;
  atributo_chave: string;
  pv: number;
  descricao: string;
  pericias: string[];
  escolas: { id: string; nome: string; desc: string }[];
  talentos: { id: string; nome: string; desc: string }[];
  habilidade: string;
  habilidade_desc: string;
  salvamentos: { fortitude: NivelSalvamento; reflexos: NivelSalvamento; vontade: NivelSalvamento };
}

export const BONUS_SALVAMENTO: Record<NivelSalvamento, number> = {
  'T': 2,
  'E': 4,
  '': 0,
};

export const ARMADURAS = [
  { id: 'nenhuma',      nome: 'Sem Armadura',         ca_bonus: 0,  tipo: 'nenhuma',  desc: 'CA base = 10 + mod DES' },
  { id: 'couro',        nome: 'Armadura de Couro',     ca_bonus: 2,  tipo: 'leve',     desc: 'Leve. +2 CA. Sem penalidade de DES.' },
  { id: 'brigantina',   nome: 'Brigantina',             ca_bonus: 3,  tipo: 'leve',     desc: 'Leve. +3 CA.' },
  { id: 'cota-malha',   nome: 'Cota de Malha',          ca_bonus: 4,  tipo: 'media',    desc: 'Média. +4 CA. –1 DES máx.' },
  { id: 'escamas',      nome: 'Armadura de Escamas',    ca_bonus: 5,  tipo: 'media',    desc: 'Média. +5 CA. –2 DES máx.' },
  { id: 'placas',       nome: 'Armadura de Placas',     ca_bonus: 6,  tipo: 'pesada',   desc: 'Pesada. +6 CA. Sem bônus de DES.' },
  { id: 'escudo-leve',  nome: '+ Escudo Leve',          ca_bonus: 1,  tipo: 'escudo',   desc: 'Escudo pequeno. +1 CA.' },
  { id: 'escudo-torre', nome: '+ Escudo de Torre',      ca_bonus: 2,  tipo: 'escudo',   desc: 'Escudo grande. +2 CA. –1 DES.' },
];

export const CLASSES: Record<string, Classe> = {
  Arcano: {
    nome: 'Arcano',
    atributo_chave: 'INT',
    pv: 6,
    descricao: 'Manipulam magia através da escrita de runas e pergaminhos.',
    pericias: ['Artesanato', 'Arcanismo', '+ 1 à escolha'],
    escolas: [
      { id: 'tocha', nome: 'Escola da Tocha Interior', desc: '+1 dano ígneo. Inimigos atingidos ficam Iluminados 1 rodada.' },
      { id: 'sussurro', nome: 'Escola do Sussurro Arcano', desc: '+2 para ocultar pergaminhos. Magias ilusórias têm +1 CD.' },
      { id: 'geometria', nome: 'Escola da Trama Geométrica', desc: '+1 concentração. Escudos arcanos duram 1 rodada extra.' },
    ],
    talentos: [
      { id: 'runa-estavel', nome: 'Runa Estável', desc: 'Erra a magia? O pergaminho não é destruído. Pode tentar de novo.' },
      { id: 'traco-acelerado', nome: 'Traço Acelerado', desc: 'Crie 1 pergaminho como Ação Única (1x/encontro).' },
      { id: 'catalisador', nome: 'Catalisador Improvisado', desc: 'Substitua 1 ingrediente por outro similar (–1 CD).' },
    ],
    habilidade: 'Leitor da Trama',
    habilidade_desc: 'Reconhece imediatamente pergaminhos falsos, corrompidos ou piratas.',
    salvamentos: { fortitude: '', reflexos: 'T', vontade: 'E' },
  },
  Alquimista: {
    nome: 'Alquimista',
    atributo_chave: 'INT',
    pv: 8,
    descricao: 'Mentes inquietas que transformam ciência e improvisação em arte.',
    pericias: ['Ofício (Alquimia)', 'Sobrevivência', '+ 2 à escolha'],
    escolas: [
      { id: 'bombardeiro', nome: 'Bombardeiro', desc: 'Bombas +1 dano base. Talento "Bombardeio Preciso".' },
      { id: 'cirurgiao', nome: 'Cirurgião', desc: 'Tratar feridos +2. Elixires de cura restauram +2 PV.' },
      { id: 'mutagenico', nome: 'Mutagênico', desc: 'Resistência 1 a Cortante/Perfurante/Contusão sob mutagênico.' },
    ],
    talentos: [
      { id: 'prep-precisa', nome: 'Preparação Precisa', desc: 'Criação Rápida produz 2 itens do mesmo tipo com 1 reagente.' },
      { id: 'bombardeio', nome: 'Bombardeio Direcionado', desc: 'Inimigos adjacentes não recebem dano de splash.' },
      { id: 'mutagenico-inst', nome: 'Mutagênico Instintivo', desc: '+1 Reflexos e Atletismo sob mutagênico.' },
    ],
    habilidade: 'Criação Rápida',
    habilidade_desc: 'Cria itens alquímicos como Ação Única, usando 1 reagente cada.',
    salvamentos: { fortitude: 'T', reflexos: 'E', vontade: 'T' },
  },
  Bárbaro: {
    nome: 'Bárbaro',
    atributo_chave: 'FOR',
    pv: 12,
    descricao: 'Guerreiros movidos pela fúria, força bruta e instintos selvagens.',
    pericias: ['Atletismo', '+ 2 à escolha'],
    escolas: [
      { id: 'animal', nome: 'Instinto do Animal', desc: 'Ataque natural, Resistência 1 física, +2 Intimidação em fúria.' },
      { id: 'furia-ardente', nome: 'Instinto da Fúria Ardente', desc: '+2 PV/nível. Ataques ignoram 1 ponto de resistência.' },
      { id: 'berserker', nome: 'Instinto do Berserker', desc: '+3 dano (vs +2). –1 CA. Críticos marciais +1d6.' },
    ],
    talentos: [
      { id: 'golpe-brutal', nome: 'Golpe Brutal', desc: '2 ações: +2 dano. Crítico: +4 dano.' },
      { id: 'ameaca', nome: 'Ameaça Instintiva', desc: 'Ao entrar em fúria: Desmoralizar grátis (+2).' },
      { id: 'resist-selvagem', nome: 'Resistência Selvagem', desc: 'Resistência 2 Contusão ou Cortante. Em fúria: 3.' },
    ],
    habilidade: 'Impetuosidade Barbarica',
    habilidade_desc: 'Sem penalidade com armas improvisadas. Qualquer objeto pesado vira arma.',
    salvamentos: { fortitude: 'E', reflexos: 'T', vontade: 'T' },
  },
  Bardo: {
    nome: 'Bardo',
    atributo_chave: 'CAR',
    pv: 8,
    descricao: 'Mestres da inspiração, música e manipulação emocional.',
    pericias: ['Diplomacia', 'Atuação', '+ 3 à escolha'],
    escolas: [
      { id: 'orador', nome: 'Estilo do Orador', desc: '+2 Diplomacia ou Intimidação. +1 social com multidões.' },
      { id: 'musicista', nome: 'Estilo do Musicista', desc: 'Inspirados ganham +1 dano. +2 Atuação (instrumentos).' },
      { id: 'performer', nome: 'Estilo do Performer Corporal', desc: '+2 Acrobacia. Inspiração concede +1 CA para 1 aliado.' },
    ],
    talentos: [
      { id: 'melodia', nome: 'Melodia Alojadora', desc: 'Ao Inspirar: aliado pode refazer teste para remover condição.' },
      { id: 'arpejo', nome: 'Arpejo Desestabilizante', desc: 'Atuação vs Vontade: –1 a –2 ataques, ou Atordoado 1 (crítico).' },
      { id: 'ritmo', nome: 'Ritmo das Lâminas', desc: '+1 ataque e +1 dano sonoro 1x/rodada sob Inspiração.' },
    ],
    habilidade: 'Memória Artística',
    habilidade_desc: 'Lembra qualquer fala, música ou texto das últimas 24h. +2 vs trapaças.',
    salvamentos: { fortitude: 'T', reflexos: 'T', vontade: 'E' },
  },
  Campeão: {
    nome: 'Campeão',
    atributo_chave: 'CAR',
    pv: 10,
    descricao: 'Guerreiros devotos que protegem inocentes seguindo código moral.',
    pericias: ['Religião', '+ 2 à escolha'],
    escolas: [
      { id: 'coragem', nome: 'Doutrina da Coragem', desc: '+2 vs Medo. Golpe causa dano Contusão. Aliados adj +1.' },
      { id: 'justica', nome: 'Doutrina da Justiça', desc: '+2 redução ao Interpor-se. Golpe causa dano Radiante.' },
      { id: 'retaliacao', nome: 'Doutrina da Retaliação', desc: 'Ao sofrer dano adjacente: +1 no próximo ataque. Golpe Ígneo.' },
    ],
    talentos: [
      { id: 'escudo', nome: 'Escudo Inquebrável', desc: '+1 bônus de escudo. Levantar Escudo: +2 vs distância.' },
      { id: 'juramento', nome: 'Juramento de Proteção', desc: '1x/encontro: declare aliado "protegido". +1 CA para ele.' },
      { id: 'aura-det', nome: 'Aura da Determinação', desc: 'Aliados 10 pés: +1 vs efeitos mentais (+2 com discurso).' },
    ],
    habilidade: 'Postura da Convicção',
    habilidade_desc: '+1 CA em combate. Com escudo levantado: +2 CA.',
    salvamentos: { fortitude: 'T', reflexos: 'T', vontade: 'E' },
  },
  Clérigo: {
    nome: 'Clérigo',
    atributo_chave: 'CAR',
    pv: 8,
    descricao: 'Servos devotos de forças divinas, canalizando poder sagrado.',
    pericias: ['Religião', '+ 2 relacionadas ao Domínio', '+ 1 à escolha'],
    escolas: [
      { id: 'vida', nome: 'Domínio da Vida', desc: '+1 a todas as curas. Alvo curado ganha +2 CA até fim do turno.' },
      { id: 'chama', nome: 'Domínio da Chama', desc: '+2 dano canalizado vs inimigos. Arma da Fé: +1d4 ígneo.' },
      { id: 'ordem', nome: 'Domínio da Ordem', desc: '+2 Intimidação e Diplomacia. 1x/encontro: força inimigo a refazer ataque com –2.' },
    ],
    talentos: [
      { id: 'bencao', nome: 'Bênção Protetora', desc: 'Ao curar aliado: +1 CA por 1 rodada.' },
      { id: 'palavra', nome: 'Palavra Sagrada', desc: 'Religião vs Vontade: Amedrontado 1 (ou 2 em crítico).' },
      { id: 'castigo', nome: 'Castigo Divino', desc: 'Após sofrer dano adjacente: próximo ataque +1d6 Radiante.' },
    ],
    habilidade: 'Aura da Fé',
    habilidade_desc: 'Aliados em 10 pés: +1 vs morte, veneno e medo.',
    salvamentos: { fortitude: 'T', reflexos: 'T', vontade: 'E' },
  },
  Druida: {
    nome: 'Druida',
    atributo_chave: 'CON',
    pv: 8,
    descricao: 'Guardião dos ciclos naturais, canalizando a força bruta da natureza.',
    pericias: ['Natureza', 'Sobrevivência', '+ 1 à escolha'],
    escolas: [
      { id: 'tempestade', nome: 'Círculo da Tempestade', desc: '+1 Intimidação. Ataques desarmados +1 elétrico (3x/dia).' },
      { id: 'raizes', nome: 'Círculo das Raízes', desc: '+1 vs empurrão/imob. 1x/descanso: raízes dão +2 CA por 1 rodada.' },
      { id: 'chama-ancestral', nome: 'Círculo da Chama Ancestral', desc: 'Forma Selvagem: +1 ígneo desarmado. +2 rastrear queimados.' },
    ],
    talentos: [
      { id: 'espinhoso', nome: 'Crescimento Espinhoso', desc: 'Espinhos nos braços: ataques desarmados +1 perfurante por 1 min.' },
      { id: 'protetor', nome: 'Protetor da Floresta', desc: '1x/encontro: aliado a 10 pés que cair a 0 PV recebe 1 PV.' },
      { id: 'olhos-fera', nome: 'Olhos de Fera', desc: '+2 Percepção para farejar, ouvir e rastrear.' },
    ],
    habilidade: 'Sangue da Mata',
    habilidade_desc: 'Resistência 1 contra dano ambiental (calor, frio, tempestade, queda leve).',
    salvamentos: { fortitude: 'T', reflexos: 'T', vontade: 'E' },
  },
  Guerreiro: {
    nome: 'Guerreiro',
    atributo_chave: 'FOR',
    pv: 10,
    descricao: 'Mestre absoluto das armas, tático nato e combatente versátil.',
    pericias: ['Atletismo', '+ 1 à escolha'],
    escolas: [
      { id: 'agressiva', nome: 'Postura Agressiva', desc: '+2 em ataques corpo a corpo na primeira rodada do combate.' },
      { id: 'defensiva', nome: 'Postura Defensiva', desc: '+1 CA com escudo levantado.' },
      { id: 'arqueiro', nome: 'Postura do Arqueiro', desc: '+5 pés de alcance à distância. +1 ataque vs não engajados.' },
    ],
    talentos: [
      { id: 'ataque-duplo', nome: 'Ataque Duplo', desc: '2 ações: dois ataques consecutivos com –2 cada.' },
      { id: 'bloqueio', nome: 'Bloqueio Instintivo', desc: 'Inimigo erra vs você: +1 CA contra próximo ataque dele.' },
      { id: 'arremesso', nome: 'Arremesso Calculado', desc: 'Armas arremessáveis: FOR ao dano x2.' },
    ],
    habilidade: 'Especialização Marcial',
    habilidade_desc: 'Ignora –1 de cobertura leve. +1 em manobras com arma dominada.',
    salvamentos: { fortitude: 'T', reflexos: 'T', vontade: 'T' },
  },
  Ladino: {
    nome: 'Ladino',
    atributo_chave: 'DES',
    pv: 8,
    descricao: 'Mestres da sutileza, especialistas em precisão mortal e furtividade.',
    pericias: ['Furtividade', 'Ladroagem', '+ 2 à escolha'],
    escolas: [
      { id: 'trapaceiro', nome: 'Trapaceiro', desc: '+2 Enganação e testes para esconder objetos.' },
      { id: 'acrobata', nome: 'Acrobata', desc: '+10 pés deslocamento. +2 para escapar, rolar, pular.' },
      { id: 'sombra', nome: 'Sombra', desc: '+2 Furtividade. Esconder com cobertura mínima.' },
    ],
    talentos: [
      { id: 'passo-sombrio', nome: 'Passo Sombrio', desc: 'Move até metade do deslocamento sem ataques de oportunidade.' },
      { id: 'maos-leves', nome: 'Mãos Leves', desc: '+2 Ladroagem. Armadilhas simples: Ação Única.' },
      { id: 'golpe-preciso', nome: 'Golpe Preciso', desc: '+2 dano, ou +4 se Ataque Furtivo.' },
    ],
    habilidade: 'Evasão',
    habilidade_desc: 'Passa em Reflexos vs área: nenhum dano. Falha: metade do dano.',
    salvamentos: { fortitude: 'T', reflexos: 'E', vontade: 'T' },
  },
  Monge: {
    nome: 'Monge',
    atributo_chave: 'DES',
    pv: 10,
    descricao: 'Lutadores disciplinados treinando corpo, mente e espírito.',
    pericias: ['Acrobacia', '+ 1 à escolha'],
    escolas: [
      { id: 'forca-interior', nome: 'Caminho da Força Interior', desc: '+2 PV/nível. +1 Fortitude. Flurry: Resistência 1 até próx. turno.' },
      { id: 'serpente', nome: 'Caminho da Serpente Ágil', desc: '+10 pés. +2 Acrobacia. DES para escapar de agarrões.' },
      { id: 'espirito', nome: 'Caminho do Espírito Silencioso', desc: '+2 Furtividade. Esconder observado com ruído/sombra.' },
    ],
    talentos: [
      { id: 'palma', nome: 'Palma Atordoante', desc: 'Ataque + Fortitude: Atordoado 1 (crítico) ou Desnorteado 1.' },
      { id: 'chute-giro', nome: 'Chute Giratório', desc: 'Área 5 pés: todos adjacentes sofrem 1d6 Contusão.' },
      { id: 'passo-folhas', nome: 'Passo das Folhas', desc: 'Ignora terreno de vegetação. +2 Percepção vs emboscadas.' },
    ],
    habilidade: 'Corpo de Aço, Mente de Seda',
    habilidade_desc: '+1 CA sem armadura. Mãos livres e desarmado: +2 CA.',
    salvamentos: { fortitude: 'T', reflexos: 'E', vontade: 'E' },
  },
  Patrulheiro: {
    nome: 'Patrulheiro',
    atributo_chave: 'DES',
    pv: 10,
    descricao: 'Exploradores versáteis que dominam os ermos e rastreiam inimigos.',
    pericias: ['Natureza', 'Sobrevivência', '+ 2 à escolha'],
    escolas: [
      { id: 'arqueiro-preciso', nome: 'Arqueiro Preciso', desc: '+1 ataques com arcos/bestas. Ignora –2 por cobertura leve.' },
      { id: 'duelista', nome: 'Duelista Ágil', desc: '+1 armas leves/finesse. 1 arma: +1 CA.' },
      { id: 'cacador-selvagem', nome: 'Caçador Selvagem', desc: '+2 Atletismo agarrar/imobilizar. Resistência 1 vs Alvo Caçado adj.' },
    ],
    talentos: [
      { id: 'tiro-rapido', nome: 'Tiro Rápido', desc: '2 ações: dois ataques com arco/besta (–2 cada).' },
      { id: 'emboscada', nome: 'Emboscada Silenciosa', desc: 'Furtividade vs Percepção: +2 e Ataque Furtivo no próx. ataque.' },
      { id: 'implacavel', nome: 'Caçador Implacável', desc: 'Alvo foge: siga até metade do deslocamento como Reação.' },
    ],
    habilidade: 'Instinto de Sobrevivência',
    habilidade_desc: 'Reduz dano de área em 2 (ou 4 se passar em Reflexos).',
    salvamentos: { fortitude: 'T', reflexos: 'E', vontade: 'T' },
  },
};

export const PERICIAS_PRINCIPAIS = [
  { nome: 'Acrobacia', atributo: 'DES' },
  { nome: 'Arcanismo', atributo: 'INT' },
  { nome: 'Atletismo', atributo: 'FOR' },
  { nome: 'Diplomacia', atributo: 'CAR' },
  { nome: 'Dissimulação', atributo: 'CAR' },
  { nome: 'Furtividade', atributo: 'DES' },
  { nome: 'Intimidação', atributo: 'CAR' },
  { nome: 'Ladroagem', atributo: 'DES' },
  { nome: 'Manufatura', atributo: 'INT' },
  { nome: 'Medicina', atributo: 'INT' },
  { nome: 'Natureza', atributo: 'INT' },
  { nome: 'Ocultismo', atributo: 'INT' },
  { nome: 'Performance', atributo: 'CAR' },
  { nome: 'Religião', atributo: 'CAR' },
  { nome: 'Sobrevivência', atributo: 'INT' },
  { nome: 'Sociedade', atributo: 'INT' },
];

export const IDIOMAS_DISPONIVEIS = [
  'Comum', 'Faricc', 'Selleto', 'Froppy', 'Demi-Humano', 'Élfico',
  'Humano', 'Anânico', 'Alto Goblin', 'Abissal', 'Silvestre', 'Dracônico',
  'Celestial', 'Gigante', 'Goblin', 'Orc', 'Terrano', 'Aquan', 'Auran', 'Ignan',
];

export const REGIOES = [
  'Vingard', 'Cólera', 'Cifra', 'Mahumoth', 'Nova Akanee', 'Magfyer', 'Itelea',
];

export const FAIXAS_SANIDADE = [
  { valor: 5, label: 'Saudável', color: 'text-emerald-400' },
  { valor: 4, label: 'Abalado', color: 'text-green-400' },
  { valor: 3, label: 'Instável', color: 'text-yellow-400' },
  { valor: 2, label: 'À Beira do Colapso', color: 'text-orange-400' },
  { valor: 1, label: 'Quebrado', color: 'text-red-400' },
  { valor: 0, label: 'Loucura Total', color: 'text-red-600' },
];

export const FAIXAS_CORRUPCAO = [
  { valor: 0, label: 'Puro', color: 'text-sky-300' },
  { valor: 1, label: 'Marcado', color: 'text-violet-400' },
  { valor: 2, label: 'Infectado', color: 'text-purple-400' },
  { valor: 3, label: 'Corrompido', color: 'text-purple-600' },
  { valor: 4, label: 'Deformado', color: 'text-red-500' },
  { valor: 5, label: 'Servidão Abissal', color: 'text-red-700' },
];

export const FAIXAS_REPUTACAO = [
  { valor: -5, label: 'Inimigo Mortal', mod: -6 },
  { valor: -4, label: 'Odiado', mod: -4 },
  { valor: -3, label: 'Desprezado', mod: -2 },
  { valor: -2, label: 'Desconfiado', mod: -1 },
  { valor: -1, label: 'Mal Visto', mod: 0 },
  { valor: 0, label: 'Neutro', mod: 0 },
  { valor: 1, label: 'Bem-Vindo', mod: 1 },
  { valor: 2, label: 'Conhecido', mod: 2 },
  { valor: 3, label: 'Respeitado', mod: 3 },
  { valor: 4, label: 'Honrado', mod: 4 },
  { valor: 5, label: 'Herói Local', mod: 5 },
];

export const MODULOS_BASE = [
  { id: 'quarto', nome: 'Quarto Melhorado', custo: 3, desc: '+1 dado bônus de recuperação em descansos.' },
  { id: 'cozinha', nome: 'Cozinha', custo: 5, desc: 'Refeições especiais com pequenos bônus por 24h.' },
  { id: 'arsenal', nome: 'Arsenal', custo: 8, desc: '+1 perícia física por 24h (1x/dia).' },
  { id: 'oficina', nome: 'Oficina', custo: 10, desc: 'Reduz custos de criação em 20%.' },
  { id: 'biblioteca', nome: 'Biblioteca', custo: 10, desc: '+1 INT ao pesquisar. Arcanos +1 runa/dia.' },
  { id: 'estabulo', nome: 'Estábulo', custo: 6, desc: 'Guarda 3 montarias. +1 Cavalgar com elas.' },
  { id: 'sala-treino', nome: 'Sala de Treinamento', custo: 12, desc: '1x/dia: role 2 ataques, escolha o melhor.' },
  { id: 'trancas', nome: 'Trancas Reforçadas', custo: 4, desc: 'Ladrões –2 para arrombar.' },
  { id: 'armadilha', nome: 'Armadilha Simples', custo: 6, desc: 'Armadilha nível 1 (definida pelo Mestre).' },
  { id: 'guarda', nome: 'Guarda Contratado', custo: 1, desc: '1 PO/dia. Previne invasões.' },
  { id: 'sala-secreta', nome: 'Sala Secreta', custo: 15, desc: '+2 para ocultar itens.' },
  { id: 'santuario', nome: 'Santuário Anão', custo: 15, desc: '+2 Vontade. +2 PV extra em descansos.' },
  { id: 'estufa', nome: 'Estufa Froppy', custo: 6, desc: 'Poções/venenos –10% custo de produção.' },
  { id: 'sombras', nome: 'Sala de Sombras Selletto', custo: 12, desc: '+2 Furtividade dentro da base.' },
  { id: 'torre-runa', nome: 'Torre de Runa Arcana', custo: 20, desc: 'Arcanos +1 magia/dia. Pergaminhos –25% custo.' },
];

// Helper functions
export function getModificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

export function getModStr(valor: number): string {
  const mod = getModificador(valor);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calcularPVBase(
  classePV: number,
  ancestralidadePV: number,
  conMod: number
): number {
  return classePV + ancestralidadePV + conMod;
}

export function getReputacaoLabel(valor: number): string {
  const faixa = FAIXAS_REPUTACAO.find(f => f.valor === valor);
  return faixa ? faixa.label : 'Neutro';
}
