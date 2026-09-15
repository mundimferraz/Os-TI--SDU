# Sistema de Ordens de Serviço de TI — SDU Leste
### Setor de TI / Centro de Processamento de Dados (CPD) — Prefeitura Municipal de Teresina

Sistema web moderno, completo e responsivo para digitalização, acompanhamento, atendimento e controle de Ordens de Serviço (OS), inventário de equipamentos do parque tecnológico, controle de gerências e gestão da equipe técnica da **SDU Leste (Superintendência de Ações Administrativas Descentralizadas Leste)**.

---

## 📋 Sumário
- [Recursos e Módulos](#-recursos-e-módulos)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução Passo a Passo](#-instalação-e-execução-passo-a-passo)
- [Como Utilizar o Sistema](#-como-utilizar-o-sistema)
- [Backup e Exportação de Dados](#-backup-e-exportação-de-dados)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Resolução de Dúvidas Frequentes (FAQ)](#-resolução-de-dúvidas-frequentes-faq)

---

## 🚀 Recursos e Módulos

- **Painel Geral (Dashboard)**: Indicadores de chamados abertos, em andamento, concluídos, índice de cumprimento de SLA, criticidade e gráficos estatísticos.
- **Ciclo Completo de OS**: Abertura → Triagem → Atribuição a Técnico → Atendimento em Bancada → Solução Técnica → Entrega com Termo de Recebimento.
- **Gestão de Gerências (CRUD Completo)**: Cadastro de gerências e setores da SDU Leste (ex: GOSP, GFC, GMA, GAP), gerentes responsáveis, ramais telefônicos, e-mails e histórico de equipamentos vinculados.
- **Gestão de Equipe Técnica (CRUD Completo)**: Cadastro e edição de técnicos e gestores do CPD, matrícula funcional da PMT, especialidades (Hardware, Redes, Impressoras), escalas de plantão e notas de avaliação.
- **Parque Tecnológico / Inventário**: Controle de patrimônio/tombamento PMT, tipo de equipamento (desktop, notebook, impressora, nobreak, switch), marca, modelo, número de série e histórico de manutenções.
- **Impressão Oficial & Etiquetas**: Emissão em 1 clique da Ficha de Ordem de Serviço com termo de responsabilidade e etiqueta de bancada com QR Code para identificação física de equipamentos.
- **Consulta Pública**: Permite a qualquer servidor da prefeitura acompanhar o andamento do seu chamado digitando apenas o número da OS ou o tombamento.
- **Relatórios & SLA**: Métricas por gerência demandante, tempo médio de atendimento (TMA) e taxa de resolução no prazo acordado.
- **Busca Global Instantânea**: Pressione `Ctrl + K` (ou `Cmd + K` no Mac) para pesquisar qualquer chamado, equipamento, técnico ou setor.
- **Tema Claro e Escuro**: Alternância visual instantânea adaptada a qualquer ambiente de trabalho.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript
- **Bundler & Dev Server**: Vite
- **Estilização**: Tailwind CSS v4
- **Ícones**: Lucide Icons
- **Animações**: Motion
- **Persistência**: Banco de dados reativo local (`localStorage`) com rotinas completas de exportação e importação de backups em formato JSON padrão.

---

## 💻 Pré-requisitos

Antes de começar, certifique-se de ter instalado em seu computador:

1. **Node.js** (versão 18.x ou superior — recomendada versão LTS 20 ou 22):
   - Baixe gratuitamente em: [https://nodejs.org](https://nodejs.org/)
   - Para verificar se já possui instalado, abra seu terminal/Prompt de Comando e execute:
     ```bash
     node -v
     npm -v
     ```
2. **Navegador de Internet**: Google Chrome, Mozilla Firefox, Microsoft Edge, Brave ou Safari.
3. *(Opcional)* **Git** para clonar o repositório ou você pode simplesmente baixar a pasta do projeto descompactada (ZIP).

---

## 📦 Instalação e Execução Passo a Passo

Siga os passos abaixo no terminal do seu sistema operacional (Prompt de Comando, PowerShell no Windows, Terminal no macOS ou Linux):

### Passo 1: Acessar a pasta do projeto
Navegue até a pasta onde os arquivos do sistema estão salvos:

```bash
cd caminho/para/a/pasta/do/projeto
```
*(Exemplo no Windows: `cd C:\Users\SeuUsuario\Downloads\os-sdu-leste`)*

---

### Passo 2: Instalar as dependências do projeto
Execute o comando abaixo para baixar e instalar automaticamente todas as bibliotecas necessárias:

```bash
npm install
```
> ⏱️ *Esse processo dura geralmente de 30 a 60 segundos na primeira execução.*

---

### Passo 3: Iniciar o sistema
Após a conclusão da instalação, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Você verá uma mensagem semelhante a:
```text
  VITE v6.2.3  ready in 280 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

---

### Passo 4: Acessar no seu navegador
Abra o navegador de sua preferência e digite o endereço:

👉 **[http://localhost:3000](http://localhost:3000)**

O sistema carregará imediatamente com dados de exemplo prontos para uso e teste!

---

## 💡 Como Utilizar o Sistema

### 1. Perfis de Usuário Pré-Cadastrados
O sistema possui usuários de demonstração para você testar todas as permissões:
- **Carlos Eduardo Santos (Gestor do CPD)**: Acesso completo administrativo, abertura de chamados, relatórios e gestão de equipe.
- **Marcelo Henrique Lima (Técnico de Suporte)**: Atendimento de bancada, laudos técnicos e triagem.
- **Beatriz Nogueira (Solicitante / GOSP)**: Servidora solicitante que abre chamados e consulta status.

*(Você pode alternar de usuário a qualquer momento clicando no avatar do usuário no canto superior direito do cabeçalho).*

### 2. Abertura de uma Nova Ordem de Serviço
1. Clique no botão azul **"Abrir Nova OS"** no menu lateral ou no topo.
2. Selecione a gerência solicitante (ex: GOSP, GFC, GAP).
3. Preencha os dados do solicitante, ramal e o equipamento com número de tombamento patrimonial.
4. Descreva o defeito apresentado e selecione a prioridade (Baixa, Média, Alta ou Urgente).
5. Clique em **"Cadastrar e Emitir OS"**.
6. A tela oferecerá opção imediata para imprimir a ficha oficial ou a etiqueta de identificação física do equipamento com QR Code.

### 3. Gestão de Gerências
1. No menu lateral, clique em **"Gestão de Gerências"**.
2. Visualize todas as gerências da SDU Leste, gerentes responsáveis e telefones de contato.
3. Use o botão **"+ Cadastrar Nova Gerência"** para adicionar novos setores.
4. Clique em **"Ver Detalhes"** em qualquer cartão para ver todos os computadores e chamados vinculados àquela gerência.

### 4. Gestão da Equipe Técnica
1. No menu lateral, clique em **"Equipe Técnica"**.
2. Visualize os técnicos habilitados, especialidades (Hardware, Redes, Impressoras), quantidade de OS ativas e notas médias.
3. Adicione novos técnicos ou edite escalas de trabalho e status (*Ativo*, *Afastado/Férias*, *Inativo*).

---

## 💾 Backup e Exportação de Dados

Todos os dados cadastrados (chamados, técnicos, gerências e equipamentos) são salvos de forma segura no navegador.

Para transferir dados para outro computador ou salvar cópias de segurança:
1. No menu lateral, acesse **"Configurações CPD"**.
2. Na aba **"Backup & Restauração"**:
   - Clique em **"Exportar Cópia de Segurança (JSON)"** para baixar um arquivo completo com todos os dados.
   - Para restaurar em outro computador, basta clicar em **"Selecionar Arquivo JSON"** e carregar o arquivo exportado.

---

## ⚙️ Scripts Disponíveis

No arquivo `package.json`, os seguintes comandos estão configurados:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta `3000` |
| `npm run build` | Compila e otimiza o código para produção na pasta `dist/` |
| `npm run preview` | Executa localmente o build otimizado de produção para testes |
| `npm run lint` | Executa a verificação estática de tipos TypeScript |

---

## ❓ Resolução de Dúvidas Frequentes (FAQ)

### 1. O comando `npm run dev` informa que a porta 3000 já está em uso
Isso acontece quando outro programa já está utilizando a porta 3000. Você pode iniciar em outra porta adicionando o parâmetro `--port`:
```bash
npx vite --port 3001
```
Em seguida, acerte o endereço no navegador para `http://localhost:3001`.

### 2. Ao digitar `node -v` ou `npm -v` aparece comando não encontrado
Isso significa que o Node.js não está instalado no seu computador ou não foi adicionado às variáveis de ambiente do sistema. Reinicie o computador após instalar o Node.js pelo instalador oficial do site [nodejs.org](https://nodejs.org).

### 3. Como reiniciar os dados para o estado inicial de fábrica?
No menu lateral, vá em **Configurações CPD** → aba **Backup & Restauração** → clique no botão vermelho **"Restaurar Dados de Fábrica"**.

---

**Prefeitura Municipal de Teresina**  
Superintendência de Ações Administrativas Descentralizadas Leste — SDU Leste  
Centro de Processamento de Dados (CPD) / Setor de Tecnologia da Informação
