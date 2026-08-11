/* Conteúdo em português simples — mitos, quiz e glossário. */

export const MITOS = [
  {
    q: 'Só dá pra investir com muito dinheiro.',
    verdict: 'Mito',
    a: 'No Tesouro Direto dá pra começar com uns R$ 30. Vários bancos aceitam R$ 1. O que trava não é o valor, é não começar.'
  },
  {
    q: 'A poupança é o melhor lugar pra guardar.',
    verdict: 'Mito',
    a: 'Ela é segura, mas o Tesouro Selic é igualmente seguro e costuma render mais. Mesma proteção, resultado melhor.'
  },
  {
    q: 'Investir é a mesma coisa que apostar.',
    verdict: 'Mito',
    a: 'Na aposta alguém ganha o que o outro perde. Investindo, você empresta dinheiro ou vira sócio de empresas — e o retorno vem de juros e lucro de verdade.'
  },
  {
    q: 'Preciso quitar dívida antes de investir.',
    verdict: 'Verdade',
    a: 'Se a dívida cobra mais do que o investimento rende, você perde dinheiro. Pagar dívida cara vem sempre primeiro.'
  },
  {
    q: 'Dinheiro parado não perde nada.',
    verdict: 'Mito',
    a: 'Tudo vai ficando mais caro com o tempo. R$ 100 hoje compram menos que R$ 100 do ano passado. Parado, ele encolhe.'
  },
  {
    q: 'Menor de 18 anos não pode investir.',
    verdict: 'Mito',
    a: 'Pode, com CPF e uma conta aberta junto do responsável. Vários bancos já têm conta pra adolescente.'
  }
];

export const QUIZ = [
  {
    q: 'Você recebeu R$ 500 e não tem nada guardado. Primeiro passo?',
    opts: [
      'Comprar ação da empresa que tá bombando',
      'Começar um dinheiro de emergência',
      'Comprar dólar em espécie',
      'Deixar na conta pra usar quando der'
    ],
    right: 1,
    fb: 'O dinheiro de emergência vem primeiro. Sem ele, qualquer imprevisto vira dívida no cartão.'
  },
  {
    q: 'Você vai usar esse dinheiro daqui a 3 meses. Onde deixa?',
    opts: [
      'Em ações',
      'No Tesouro Selic',
      'Num investimento que só vence em 2045',
      'Num fundo de ações de fora'
    ],
    right: 1,
    fb: 'Prazo curto pede segurança. Ação pode estar em queda justo no dia que você precisa sacar.'
  },
  {
    q: 'Você tem dívida no cartão e R$ 1.000 sobrando. O certo é:',
    opts: [
      'Investir e ir pagando o mínimo da fatura',
      'Pagar a dívida',
      'Dividir metade em cada',
      'Comprar um celular novo'
    ],
    right: 1,
    fb: 'O juro do cartão é maior que qualquer rendimento. Pagar a dívida é o melhor "investimento" possível.'
  },
  {
    q: 'Alguém oferece "10% de lucro garantido por mês". Você:',
    opts: [
      'Investe pouco pra testar',
      'Recusa — alto e garantido ao mesmo tempo é golpe',
      'Chama os amigos pra entrar junto',
      'Investe tudo, porque é garantido'
    ],
    right: 1,
    fb: 'Não existe rendimento alto e garantido. E se te apressarem pra decidir, é mais um sinal.'
  },
  {
    q: 'Por que ter uma parte do dinheiro em dólar?',
    opts: [
      'Porque o dólar sempre sobe',
      'Pra se proteger se o real perder valor',
      'Porque rende mais que tudo',
      'Porque não paga imposto'
    ],
    right: 1,
    fb: 'É proteção, não aposta. E como o dólar sobe e desce muito, ele não serve como dinheiro de emergência.'
  },
  {
    q: 'Na conta 50·30·20, os 20% são pra quê?',
    opts: ['Lazer e rolê', 'Contas do mês', 'Guardar e investir', 'Imprevistos'],
    right: 2,
    fb: '50% do que você precisa, 30% do que você quer, 20% pro futuro. E separe assim que o dinheiro entra.'
  }
];

export const GLOSSARIO = [
  { t: 'Selic', d: 'A taxa básica de juros do Brasil, definida pelo Banco Central. Quando ela sobe, empréstimo fica mais caro e investimento seguro rende mais.' },
  { t: 'Inflação', d: 'A alta geral dos preços. É o motivo do mesmo dinheiro comprar menos com o tempo.' },
  { t: 'Renda fixa', d: 'Você empresta dinheiro pro governo ou pro banco e já sabe a regra do rendimento desde o início. Mais previsível.' },
  { t: 'Renda variável', d: 'Você vira dono de um pedaço de alguma coisa e o valor sobe e desce todo dia. Mais risco agora, mais chance lá na frente.' },
  { t: 'Tesouro Direto', d: 'Site do governo onde você compra títulos a partir de uns R$ 30. É o investimento mais seguro do país.' },
  { t: 'CDB', d: 'Você empresta pro banco e ele devolve com juros. Protegido pelo FGC até R$ 250 mil.' },
  { t: 'FGC', d: 'Um fundo que devolve seu dinheiro (até R$ 250 mil por banco) se a instituição quebrar. Cobre poupança, CDB, LCI e LCA.' },
  { t: 'ETF', d: 'Uma cesta de várias empresas que você compra de uma vez só, como se fosse uma ação. Jeito simples de não apostar tudo num lugar só.' },
  { t: 'Corretora', d: 'O aplicativo por onde você compra investimentos. Abrir conta é de graça e leva alguns minutos.' },
  { t: 'Dinheiro de emergência', d: 'Uns 3 a 6 meses dos seus gastos, guardados em algo seguro e fácil de sacar. Serve pra imprevisto não virar dívida.' }
];
