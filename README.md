# Guia Passo a Passo

## 1. Criar Contas Necessárias

### Criar Conta no Supabase

1. Aceda ao site **[supabase.com](https://supabase.com)**.
2. Clique no botão **Sign Up** no canto superior direito.
3. Registe-se utilizando a sua conta do GitHub ou o seu endereço de email.
4. Após entrar, clique em **New Project** (Novo Projeto).
5. Escolha um nome para o projeto (exemplo: `Rifa-Online`), defina uma palavra-passe forte para a base de dados e selecione a região **Central Europe (Frankfurt)**.
6. Clique em **Create new project** e aguarde 1 a 2 minutos até que o projeto seja configurado.

### Criar Conta na Vercel

1. Aceda ao site **[vercel.com](https://vercel.com)**.
2. Clique no botão **Sign Up**.
3. Escolha a opção de registo com a sua conta do GitHub ou com o seu Email.
4. Siga as instruções no ecrã para concluir a verificação da conta.

---

## 2. Configurar a Base de Dados (Supabase)

1. No painel do seu projeto no Supabase, clique no menu lateral esquerdo em **SQL Editor**.
2. Clique no botão **New Query** (Nova Consulta).
3. Copie todo o código contido no ficheiro `schema.sql` (disponibilizado na Parte 1 deste documento) e cole-o na caixa de texto do editor.
4. Clique no botão **Run** (ou pressione `Ctrl + Enter`). Verifique se surge a mensagem de sucesso no fundo do ecrã.

### Guardar as Chaves de Acesso do Supabase

1. No menu lateral do Supabase, vá a **Project Settings** (ícone de engrenagem) e clique em **API**.
2. Guarde numa nota de texto dois valores que irá precisar mais à frente:

- **Project URL**
- **anon / public key** (Chave pública)

---

## 3. Criar o Utilizador Administrador

Para conseguir entrar no painel de gestão secreto, precisa de criar a sua conta de administrador:

1. No menu lateral do Supabase, clique em **Authentication** (Autenticação).
2. Clique na pestana **Users** e depois no botão **Add User** -> **Create User**.
3. Introduza o seu **Email** e crie uma **Palavra-passe**.
4. Certifique-se de que a opção "Auto Confirm User" está marcada e clique em **Create User**.

---

## 4. Publicar o Site na Vercel (Deploy)

1. Guarde todos os ficheiros do projeto numa pasta no seu computador ou no seu repositório do GitHub.
2. Aceda ao painel da **Vercel** e clique no botão **Add New...** -> **Project**.
3. Importe o repositório do seu projeto.
4. Antes de clicar em Deploy, expanda a secção **Environment Variables** (Variáveis de Ambiente) e adicione as seguintes duas variáveis com os dados guardados do Supabase:

- **Nome:** `NEXT_PUBLIC_SUPABASE_URL` | **Valor:** _(Cole a sua Project URL do Supabase)_
- **Nome:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Valor:** _(Cole a sua anon/public key do Supabase)_

5. Clique em **Deploy**. Aguarde cerca de 1 minuto enquanto a Vercel constrói e publica o site.
6. Assim que terminar, receberá o link público do seu site (exemplo: `[https://o-seu-nome-da-rifa.vercel.app](https://o-seu-nome-da-rifa.vercel.app)`).

---

## 5. Personalizar as Informações do Site

Todas as alterações simples (número MB Way, imagem, título, preço) são feitas editando os ficheiros na pasta do projeto e guardando as alterações.

### Alterar o Número MB Way

Abra o ficheiro `config/rifaConfig.js` e altere o valor do campo `mbwayNumero`:

```javascript
mbwayNumero: "987 654 321", // Coloque o seu novo número aqui

```

### Alterar o QR Code do MB Way

1. Gere a imagem do seu QR Code do MB Way na aplicação do seu banco.
2. Renomeie esse ficheiro de imagem para `qr-mbway.png`.
3. Coloque essa imagem dentro da pasta `public` do seu projeto (substituindo a existente).

### Trocar a Imagem Principal (Banner)

1. Escolha a fotografia ou cartaz do prémio da sua rifa.
2. Renomeie o ficheiro para `banner-rifa.jpg`.
3. Coloque a imagem dentro da pasta `public` do seu projeto.

### Alterar o Valor da Rifa, Título e Descrição

No ficheiro `config/rifaConfig.js`, altere os respetivos campos:

```javascript
export const rifaConfig = {
  titulo: 'Rifa de Natal do Clube',
  descricao: 'Participe e habilite-se a ganhar um imóvel de férias!',
  preco: 10, // Altere o valor em Euros aqui
  // ...
};
```

---

## 6. Como Utilizar o Painel Administrativo

### Aceder ao Painel Secreto

1. Abra o seu navegador e escreva o endereço do seu site seguido da URL secreta:
   `[https://o-seu-site.vercel.app/painel-rifa-x9k27m](https://o-seu-site.vercel.app/painel-rifa-x9k27m)`
2. Escreva o **Email** e a **Palavra-passe** que criou no passo de configuração da autenticação do Supabase.

### Como Confirmar Pagamentos

1. Na grelha de 100 números, os números **Vermelhos** representam reservas efetuadas pelos utilizadores.
2. Clique no número vermelho pretendido.
3. Na janela que se abre, verifique o nome, telemóvel, grupo e clique no link **Ver Comprovativo Enviado** para conferir o recibo.
4. Se o valor correto estiver na sua conta MB Way, clique no botão **Confirmar Pagamento**.
5. O número mudará imediatamente para **Preto (Pago)** na grelha e ficará indisponível no site de forma definitiva.

### Como Cancelar Reservas

1. Clique no número reservado (vermelho).
2. Clique no botão **Cancelar Reserva**.
3. O número volta imediatamente a **Branco (Disponível)**, permitindo que outros participantes o voltem a escolher.

---

Como estruturou este projeto para a sua rifa? Se precisar de ajuda a adicionar campos adicionais ao formulário ou ajustar o tempo do temporizador, basta indicar.
