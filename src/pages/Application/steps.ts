export type StepType = 'text' | 'options';

export interface Step {
  key: string;
  label: string;
  type: StepType;
  ph?: string;
  opts?: string[];
}

export const steps: Step[] = [
  { key: 'name', label: 'Qual é o seu nome completo?', type: 'text', ph: 'Dr(a). João da Silva' },
  {
    key: 'area', label: 'Qual sua principal área de atuação?', type: 'options',
    opts: ['Previdenciário', 'Trabalhista', 'Família e sucessões', 'Cível', 'Criminal', 'Tributário/Empresarial', 'Outra'],
  },
  { key: 'cidade', label: 'Em qual cidade fica o escritório?', type: 'text', ph: 'Ex: Campinas, SP' },
  {
    key: 'tempo', label: 'Há quanto tempo o escritório existe?', type: 'options',
    opts: ['Menos de 2 anos', '2 a 5 anos', '5 a 10 anos', 'Mais de 10 anos'],
  },
  {
    key: 'faturamento', label: 'Qual o faturamento mensal médio do escritório?', type: 'options',
    opts: ['Até R$ 20 mil', 'R$ 20 a 50 mil', 'R$ 50 a 100 mil', 'Acima de R$ 100 mil'],
  },
  {
    key: 'investimento', label: 'Quanto você investe em marketing por mês hoje?', type: 'options',
    opts: ['Nada ainda', 'Até R$ 1 mil', 'R$ 1 a 3 mil', 'Acima de R$ 3 mil'],
  },
  { key: 'dificuldade', label: 'Qual sua maior dificuldade para atrair novos clientes hoje?', type: 'text', ph: 'Escreva com suas palavras' },
  {
    key: 'pronto', label: 'Se o sistema fizer sentido para o seu escritório, você tem condições de investir na implantação nos próximos 30 dias?', type: 'options',
    opts: ['Sim', 'Preciso entender os valores', 'Ainda não'],
  },
  { key: 'whatsapp', label: 'Qual seu WhatsApp para contato?', type: 'text', ph: '(11) 99999-9999' },
];
