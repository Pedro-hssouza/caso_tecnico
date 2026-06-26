const THRESHOLD_ATENCAO = 0.10; // 10% das horas vendidas
const DIAS_ALERTA_PRAZO = 7;    // dias antes do vencimento para alertar

function calcularSaldo(horasVendidas, horasRealizadas) {
  return horasVendidas - horasRealizadas;
}

function calcularPercentualAvanco(horasVendidas, horasRealizadas) {
  if (horasVendidas === 0) return 0;
  return Math.round((horasRealizadas / horasVendidas) * 100);
}

function calcularStatus(horasVendidas, horasRealizadas, dataFimPrevista) {
  const saldo = calcularSaldo(horasVendidas, horasRealizadas);
  const hoje = new Date();
  const dataFim = new Date(dataFimPrevista);
  const diasRestantes = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
  const limiteAtencao = horasVendidas * THRESHOLD_ATENCAO;

  if (saldo < 0 || diasRestantes < 0) {
    return "critico";
  }
  if (saldo <= limiteAtencao || diasRestantes <= DIAS_ALERTA_PRAZO) {
    return "atencao";
  }
  return "saudavel";
}

function enriquecerProjeto(projeto) {
  const saldo = calcularSaldo(projeto.horas_vendidas, projeto.horas_realizadas);
  const percentual_avanco = calcularPercentualAvanco(projeto.horas_vendidas, projeto.horas_realizadas);
  const status = calcularStatus(projeto.horas_vendidas, projeto.horas_realizadas, projeto.data_fim_prevista);

  return {
    ...projeto,
    saldo,
    percentual_avanco,
    status,
  };
}

module.exports = { enriquecerProjeto };
