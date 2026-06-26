# Painel de Projetos — Case Técnico PVT

> **Desenvolvedor:** Pedro Henrique Souza
> **Vaga:** Desenvolvedor Web e Infraestrutura JR
> **Stack:** React + TypeScript (front) · Node.js + Express (API) · PostgreSQL (banco)

---

## Como rodar

### Pré-requisitos
- Node.js v18+ instalado

### Backend

```bash
cd backend
npm install
node src/index.js
```

API disponível em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Painel disponível em `http://localhost:5173`

> Os dados são mockados — não é necessário banco de dados ou conexão com o ERP para rodar localmente.

---

## Sumário

1. [Modelagem do Domínio](#1-modelagem-do-domínio)
2. [Arquitetura da Solução](#2-arquitetura-da-solução)
3. [Design da API](#3-design-da-api)
4. [Regras de Negócio](#4-regras-de-negócio)
5. [Decisões e Trade-offs](#5-decisões-e-trade-offs)
6. [Como eu evoluiria isso](#6-como-eu-evoluiria-isso)

---

## 1. Modelagem do Domínio

O módulo Painel de Projetos gira em torno de cinco entidades principais.

### Entidades

#### Cliente
Representa a empresa que contratou a PVT.

| Campo | Tipo | Descrição |
|---|---|---|
| id | INT | Chave primária |
| nome | STRING | Nome da empresa |
| email | STRING | E-mail de contato |

#### Projeto
O trabalho contratado pelo cliente. Guarda as horas vendidas (contratuais) e planejadas (estimativa interna).

| Campo | Tipo | Descrição |
|---|---|---|
| id | INT | Chave primária |
| nome | STRING | Nome do projeto |
| dataInicio | DATE | Data de início |
| dataFim | DATE | Prazo de entrega |
| horasVendidas | DECIMAL | Total de horas contratadas |
| horasPlanejadas | DECIMAL | Estimativa interna de horas |
| id_cliente (FK) | INT | Referência ao Cliente |

#### Analista
Profissional alocado nos projetos.

| Campo | Tipo | Descrição |
|---|---|---|
| id | INT | Chave primária |
| nome | STRING | Nome completo |
| email | STRING | E-mail único |

#### Alocação
Registra qual analista está em qual projeto. É uma entidade associativa que conecta Projeto e Analista, permitindo que um analista esteja em múltiplos projetos e um projeto tenha múltiplos analistas.

| Campo | Tipo | Descrição |
|---|---|---|
| id | INT | Chave primária |
| id_projeto (FK) | INT | Referência ao Projeto |
| id_analista (FK) | INT | Referência ao Analista |

#### Apontamento
Registro de horas trabalhadas por um analista dentro de uma alocação.

| Campo | Tipo | Descrição |
|---|---|---|
| id | INT | Chave primária |
| id_alocacao (FK) | INT | Referência à Alocação |
| data | DATE | Data do trabalho realizado |
| horas | DECIMAL | Quantidade de horas apontadas |

### Diagrama de Relacionamentos

```
Cliente (1) ──────────────────── (N) Projeto
                                        │
                                       (1)
                                        │
                                    Alocação (N) ──── (1) Analista
                                        │
                                       (1)
                                        │
                                   Apontamento (N)
```

**Leitura:**
- Um **Cliente** possui vários **Projetos**
- Um **Projeto** tem várias **Alocações**
- Um **Analista** pode ter várias **Alocações** (em projetos diferentes)
- Cada **Alocação** gera vários **Apontamentos** de horas

---

## 2. Arquitetura da Solução

A solução é organizada em quatro camadas com responsabilidades distintas.

```
┌──────────────────────────────────────┐
│             USUÁRIO                  │
│       (coordenador / gestor)         │
└───────────────┬──────────────────────┘
                │ acessa o painel
                ▼
┌──────────────────────────────────────┐
│            FRONTEND                  │
│       React + TypeScript             │
└───────────────┬──────────────────────┘
                │ GET /api/projetos (HTTP/REST)
                ▼
┌──────────────────────────────────────┐   ┌─────────────────┐
│          API / BACKEND               │◄──►   ERP TOTVS RM  │
│    Node.js — regras de negócio       │   │  (sincronização) │
│    cálculos · autenticação           │   └─────────────────┘
└───────────────┬──────────────────────┘
                │ SQL
                ▼
┌──────────────────────────────────────┐
│          BANCO DE DADOS              │
│            PostgreSQL                │
└──────────────────────────────────────┘
```

### Decisão central: sincronização assíncrona com o ERP

A API **nunca consulta o ERP diretamente** em tempo de requisição. Um serviço separado (job agendado) busca os dados do TOTVS RM periodicamente e atualiza o banco local.

**Benefícios:**
- O painel continua funcionando mesmo quando o ERP está fora do ar
- Tempo de resposta da API não depende da disponibilidade do ERP
- Dado com no máximo 1h de defasagem — aceitável para gestão de projetos

---

## 3. Design da API

Todos os endpoints seguem o padrão REST. Base da URL: `/api`.

### Resumo dos Endpoints

| Verbo | Endpoint | Descrição |
|---|---|---|
| GET | `/api/projetos` | Lista todos os projetos com horas vendidas, realizadas, saldo e status |
| GET | `/api/projetos/{id}` | Retorna detalhes de um projeto específico |
| POST | `/api/projetos` | Cria um novo projeto |
| GET | `/api/analistas` | Lista todos os analistas cadastrados |
| POST | `/api/alocacoes` | Aloca um analista em um projeto |
| POST | `/api/apontamentos` | Registra horas trabalhadas por um analista |
| GET | `/api/projetos/{id}/apontamentos` | Lista apontamentos de um projeto |
| GET | `/api/projetos/{id}/dashboard` | Retorna indicadores gerenciais do projeto |
| POST | `/api/integracao/rm/sincronizar` | Dispara sincronização com o ERP TOTVS RM |

### Exemplos de Requisição e Resposta

#### GET /api/projetos
```json
[
  {
    "id": 1,
    "nome": "Implantação ERP",
    "horasVendidas": 200,
    "horasRealizadas": 150,
    "saldoHoras": 50,
    "status": "SAUDAVEL"
  }
]
```

#### GET /api/projetos/{id}/dashboard
```json
{
  "horasVendidas": 200,
  "horasPlanejadas": 180,
  "horasRealizadas": 150,
  "saldoHoras": 50,
  "percentualAvanco": 75,
  "status": "SAUDAVEL"
}
```

#### POST /api/apontamentos
```json
// Requisição
{
  "idAlocacao": 1,
  "data": "2026-06-25",
  "horas": 8
}

// Resposta
{
  "mensagem": "Apontamento registrado com sucesso"
}
```

#### POST /api/integracao/rm/sincronizar
```json
// Resposta
{
  "mensagem": "Sincronização concluída com sucesso",
  "projetosSincronizados": 12,
  "ultimaSync": "2026-06-26T10:00:00Z"
}
```

---

## 4. Regras de Negócio

### 4.1 Saldo de Horas

O saldo representa quantas horas ainda restam no contrato.

```
saldoHoras = horasVendidas − horasRealizadas

horasRealizadas = SUM(apontamentos.horas)
                  WHERE apontamento pertence a uma alocação do projeto
```

| Resultado | Interpretação |
|---|---|
| Positivo | Horas disponíveis no contrato |
| Zero | Horas esgotadas, mas não estouradas |
| Negativo | Projeto estourou as horas contratadas |

### 4.2 Percentual de Avanço

Indica quanto do orçamento de horas já foi consumido.

```
percentualAvanco = (horasRealizadas / horasVendidas) × 100
```

Esse percentual deve ser comparado com o avanço físico das entregas. Se o projeto está em 80% das horas mas apenas 50% das entregas estão concluídas, há um problema de ritmo que precisa de atenção da coordenação.

### 4.3 Classificação de Status

O status combina duas dimensões: consumo de horas e prazo de entrega.

| Status | Condição |
|---|---|
| ✅ **SAUDAVEL** | `saldo > 10% das horasVendidas` E prazo não vencido |
| ⚠️ **ATENCAO** | `0 < saldo ≤ 10% das horasVendidas` OU prazo em até 7 dias |
| 🔴 **CRITICO** | `saldo < 0` (horas estouradas) OU prazo vencido |

**Implementação:**

```javascript
function calcularStatus(horasVendidas, horasRealizadas, dataFimPrevista) {
  const saldo = horasVendidas - horasRealizadas;
  const hoje = new Date();
  const dataFim = new Date(dataFimPrevista);
  const diasRestantes = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
  const limiteAtencao = horasVendidas * 0.10;

  if (saldo < 0 || diasRestantes < 0) return "CRITICO";
  if (saldo <= limiteAtencao || diasRestantes <= 7) return "ATENCAO";
  return "SAUDAVEL";
}
```

> O threshold de 10% é configurável via parâmetro no banco, permitindo ajuste sem necessidade de novo deploy.

---

## 5. Decisões e Trade-offs

### PostgreSQL em vez de MongoDB
Os dados do domínio são fortemente relacionais — projetos têm clientes, alocações conectam analistas a projetos, apontamentos pertencem a alocações. Um banco relacional garante integridade referencial via foreign keys e facilita as queries de agregação (SUM de horas por projeto). MongoDB não teria justificativa técnica nesse contexto.

### Sincronização assíncrona em vez de consulta direta ao ERP
Consultar o ERP diretamente a cada requisição criaria dois problemas: dependência de disponibilidade (se o ERP cair, o painel para) e latência (cada clique dependeria do tempo de resposta do TOTVS RM). A sincronização periódica desacopla os dois sistemas, com custo de até 1h de defasagem nos dados — aceitável para o contexto de gestão de projetos.

### Cálculos na API, não no frontend
Centralizar saldo, percentual e status na API garante que qualquer cliente (web, mobile, relatórios) receba o mesmo resultado sem reimplementar lógica. Se a regra de "CRITICO" mudar, a alteração acontece em um único lugar.

### Arquitetura em camadas em vez de monólito simples
A separação em camadas (front / API / banco / sync) segue o princípio de responsabilidade única. Cada camada pode evoluir, ser testada e escalada de forma independente.

### Threshold de status configurável em vez de hardcoded
O limite de 10% para o status "ATENCAO" é uma decisão de negócio, não técnica. Torná-lo configurável permite que a coordenação ajuste sem envolver desenvolvimento.

### Endpoint de dashboard separado (`/projetos/{id}/dashboard`)
Criado como endpoint dedicado para indicadores gerenciais, separando a responsabilidade de "listar projetos" de "exibir métricas detalhadas de um projeto". Isso permite que o frontend carregue a listagem rapidamente e só busque o dashboard quando o usuário selecionar um projeto específico.

---

## 6. Como eu evoluiria isso

### Performance e Escala

**Cache nos endpoints mais acessados**
O `GET /api/projetos` será chamado toda vez que alguém abrir o painel. Com muitos projetos e acessos simultâneos, cada requisição executa agregações no banco. Adicionar cache (ex: Redis) com TTL de 5 minutos faz a API responder sem bater no banco a cada requisição. O cache é invalidado quando um novo apontamento é registrado.

**Índices no banco de dados**
Criar índices em `apontamentos.id_alocacao` e `alocacoes.id_projeto` acelera as queries de agregação de horas. Sem índices, o banco percorre a tabela inteira a cada soma.

**Paginação nos endpoints de listagem**
Em vez de retornar todos os projetos de uma vez, adotar `GET /api/projetos?page=1&limit=20`. O frontend carrega sob demanda, reduzindo o volume de dados trafegados.

### Resiliência a Falhas

**ERP fora do ar**
Como a API nunca consulta o ERP em tempo real, uma queda do TOTVS RM não afeta o painel. O serviço de sync registra a falha em log e tenta novamente na próxima janela. A interface exibe o timestamp da última sincronização bem-sucedida para transparência.

**Circuit Breaker no serviço de sync**
Se o ERP estiver lento, o serviço de sync pode ficar travado aguardando resposta. Um circuit breaker detecta N tentativas sem sucesso e interrompe as tentativas por um período, evitando consumo desnecessário de recursos.

**Logs, monitoramento e alertas**
Em produção, registrar logs de cada execução do job de sync (sucesso, falha, tempo de resposta, registros atualizados) e monitorar o tempo de resposta da API. Alertas automáticos devem ser disparados se a sync falhar consecutivamente ou se a API apresentar degradação de performance.

---

*Case técnico desenvolvido para o processo seletivo PVT Software & Serviços — Vaga Dev Web e Infraestrutura JR.*
