# QuizCaju — Tasks Semana 2
### Do hardcoded para a internet: questions.js + integração

> O app.js já está funcionando com perguntas hardcoded.
> Agora vamos buscar perguntas reais da internet.
> O `questions.js` será reescrito do zero.
> O `app.js` receberá apenas 3 mudanças.

---

## Estrutura do projeto

```
quizcaju/
├── index.html       ← adicione o elemento #loading-msg
├── style.css        ← sem mudanças
├── questions.js     ← VOCÊ reescreve este arquivo
└── app.js           ← 3 mudanças pontuais
```

---

## Parte 1 — questions.js

---

### Task Q01 — Configurar as fontes

#### 📖 Conceito

O `questions.js` da semana 1 tinha as perguntas escritas à mão dentro do arquivo.
Isso tem dois problemas: qualquer um abre o arquivo e vê as respostas, e para ter mais perguntas alguém precisa digitar tudo na mão.

A solução são APIs públicas — endereços na internet que entregam dados quando você pede, sem cadastro e sem chave.

Cole essa URL no navegador agora e observe o que chega:
```
https://opentdb.com/api.php?amount=5&category=9&type=multiple
```

Identifique: onde está a pergunta? Onde estão as erradas? O que é `response_code: 0`?

Vamos buscar de 3 categorias diferentes. Cada fonte é um objeto com a URL e o nome da categoria que vamos usar no jogo.

#### ✏️ Escreva

No topo do `questions.js`, crie o array `FONTES`:

```js
const FONTES = [
  {
    url: "https://opentdb.com/api.php?amount=5&category=18&type=multiple&encode=base64",
    categoria: "Tecnologia"
  },
  {
    url: "https://opentdb.com/api.php?amount=5&category=31&type=multiple&encode=base64",
    categoria: "Anime"
  },
  {
    url: "https://opentdb.com/api.php?amount=5&category=9&type=multiple&encode=base64",
    categoria: "Conhecimentos Gerais"
  }
]
```

---

### Task Q02 — Utilitários

#### 📖 Conceito

**Base64**

As URLs acima têm `encode=base64`. Isso faz a API enviar todos os textos codificados, para evitar problemas com acentos e caracteres especiais. `atob()` é a função nativa do navegador que desfaz essa codificação.

Exemplo:
```
atob("V2ViIERldg==")  →  "Web Dev"
atob("SmF2YVNjcmlwdA==")  →  ???
```

Teste no console antes de continuar para ver como funciona.

**Embaralhar**

Essa função já existe no `app.js`. Vamos usá-la aqui também pelo mesmo motivo: queremos que as opções de resposta apareçam em ordem diferente a cada vez.

#### ✏️ Escreva

```js
function decodificarBase64(str) {
  return atob(str)
}

function embaralhar(array) {
  var copia = array.slice()
  for (var i = copia.length - 1; i > 0; i--) {
    var j    = Math.floor(Math.random() * (i + 1))
    var temp = copia[i]
    copia[i] = copia[j]
    copia[j] = temp
  }
  return copia
}
```

---

### Task Q03 — Normalização

#### 📖 Conceito

A API fala uma língua. O `app.js` fala outra. Normalização é a tradução entre os dois formatos.

O que a API entrega versus o que o `app.js` espera:

```
API entrega                      app.js espera
───────────────────────────────────────────────
question           →             pergunta
correct_answer     →             entra em opcoes embaralhado
incorrect_answers  →             entra em opcoes embaralhado
(não existe)       →             correta  (índice numérico)
(não existe)       →             explicacao
```

**Sobre o `.map`**

`item.incorrect_answers` é um array com 3 strings em Base64. Precisamos decodificar cada uma.

Sem `.map`, faríamos assim:
```js
var erradas = []
erradas.push(decodificarBase64(item.incorrect_answers[0]))
erradas.push(decodificarBase64(item.incorrect_answers[1]))
erradas.push(decodificarBase64(item.incorrect_answers[2]))
```

O `.map` percorre o array e aplica uma função em cada item, devolvendo um array novo com os resultados. É exatamente o mesmo resultado, em menos linhas:
```js
var erradas = item.incorrect_answers.map(function(r) {
  return decodificarBase64(r)
})
```

**Sobre o `.indexOf`**

Após embaralhar as 4 opções, a resposta correta pode estar em qualquer posição.
`.indexOf()` percorre o array e retorna o índice de onde o item está.

```js
var opcoes = ["errada1", "correta", "errada2", "errada3"]
opcoes.indexOf("correta")  // → 1
```

#### ✏️ Escreva

```js
function normalizarPergunta(item, fonte, indice) {
  var pergunta        = decodificarBase64(item.question)
  var respostaCorreta = decodificarBase64(item.correct_answer)
  var erradas         = item.incorrect_answers.map(function(r) {
    return decodificarBase64(r)
  })

  var opcoes        = embaralhar([respostaCorreta].concat(erradas))
  var opcoes        = embaralhar([respostaCorreta, erradas[0], erradas[1], erradas[2]])
  var indiceCorreta = opcoes.indexOf(respostaCorreta)

  return {
    id:         indice + 1,
    categoria:  fonte.categoria,
    pergunta:   pergunta,
    opcoes:     opcoes,
    correta:    indiceCorreta,
    explicacao: "Fonte: Open Trivia DB · " + decodificarBase64(item.category)
  }
}
```

---

### Task Q04 — buscarDeFonte

#### 📖 Conceito

**async/await**

`async` declara que a função vai trabalhar com operações que levam tempo.
`await` pausa a execução daquela função até a resposta chegar — sem travar o navegador.

Sem `async/await`, a função terminaria antes da API responder e `dados` estaria vazio.

**Sobre o `.map` em `dados.results`**

`dados.results` é um array com 5 perguntas no formato da API. Precisamos normalizar cada uma.

Sem `.map`, faríamos assim:
```js
var perguntas = []
perguntas.push(normalizarPergunta(dados.results[0], fonte, offsetId + 0))
perguntas.push(normalizarPergunta(dados.results[1], fonte, offsetId + 1))
perguntas.push(normalizarPergunta(dados.results[2], fonte, offsetId + 2))
perguntas.push(normalizarPergunta(dados.results[3], fonte, offsetId + 3))
perguntas.push(normalizarPergunta(dados.results[4], fonte, offsetId + 4))
return perguntas
```

O `.map` faz o mesmo:
```js
return dados.results.map(function(item, i) {
  return normalizarPergunta(item, fonte, offsetId + i)
})
```

#### ✏️ Escreva

```js
async function buscarDeFonte(fonte, offsetId) {
  var resposta = await fetch(fonte.url)
  var dados    = await resposta.json()

  return dados.results.map(function(item, i) {
    return normalizarPergunta(item, fonte, offsetId + i)
  })
}
```

> Teste no console com o projeto aberto antes de continuar:
> ```js
> buscarDeFonte(FONTES[0], 0).then(function(perguntas) {
>   console.log(perguntas)
> })
> ```
> Deve aparecer um array com 5 perguntas no formato do QuizCaju.

---

### Task Q05 — carregarPerguntas

#### 📖 Conceito

**Promise.all — por que não buscar uma por vez?**

Sem `Promise.all`, buscaríamos uma fonte por vez:
```js
var fonte0 = await buscarDeFonte(FONTES[0], 0)   // espera ~400ms
var fonte1 = await buscarDeFonte(FONTES[1], 5)   // espera mais ~400ms
var fonte2 = await buscarDeFonte(FONTES[2], 10)  // espera mais ~400ms
// total: ~1200ms
```

Com `Promise.all`, os 3 fetches disparam ao mesmo tempo:
```
FONTES[0] ──────── responde em ~400ms ┐
FONTES[1] ──────── responde em ~400ms ┤ Promise.all espera todos
FONTES[2] ──────── responde em ~400ms ┘
// total: ~400ms (tempo do mais lento, não a soma)
```

Para ver isso acontecendo:
- Abra o DevTools → aba **Network**
- Recarregue a página
- Filtre por `opentdb` na caixa de busca
- As 3 requisições aparecem ao mesmo tempo na linha do tempo
- A coluna **Time** mostra o tempo individual de cada uma

**Por que try/catch?**

O jogo depende da internet. Se a API falhar, o `catch` devolve um array vazio e o jogo continua sem travar.

**O que é `[].concat.apply([], resultados)`?**

O `Promise.all` devolve um array de arrays — um grupo por fonte:
```js
// resultados =
[
  [p1, p2, p3, p4, p5],    // FONTES[0]
  [p6, p7, p8, p9, p10],   // FONTES[1]
  [p11, p12, p13, p14, p15] // FONTES[2]
]
```

Precisamos de um array único com as 15 perguntas.
`[].concat.apply([], resultados)` achata o array de arrays em um só:
```js
// antes:  [[p1,p2,p3], [p4,p5,p6], [p7,p8,p9]]
// depois: [p1, p2, p3, p4, p5, p6, p7, p8, p9]
```

#### ✏️ Escreva

```js
async function carregarPerguntas() {
  try {
    var promessas = FONTES.map(function(fonte, i) {
      return buscarDeFonte(fonte, i * 5)
    })

    var resultados     = await Promise.all(promessas)
    var todasPerguntas = [].concat.apply([], resultados)

    return embaralhar(todasPerguntas)

  } catch (erro) {
    console.error("[QuizCaju] Falha ao carregar perguntas:", erro)
    return []
  }
}
```

---

### Task Q06 — Expor para o app.js

#### 📖 Conceito

**Por que `window`?**

`questions.js` e `app.js` são arquivos separados. O `window` é o espaço global do navegador — o único canal entre eles quando os arquivos são carregados via `<script>` no HTML.

**Por que uma Promise e não o array direto?**

Quando o HTML carrega o `questions.js`, o fetch ainda não terminou.
A Promise "guarda o lugar" — o `app.js` awaita e só recebe o array quando ele estiver pronto.

#### ✏️ Escreva

No final do arquivo:

```js
window.bancoDePerguntasAsync = carregarPerguntas()
```

> Teste no console com o projeto aberto:
> ```js
> // Deve aparecer: Promise {<pending>} ou Promise {<fulfilled>}
> console.log(window.bancoDePerguntasAsync)
>
> // Após resolver:
> window.bancoDePerguntasAsync.then(function(perguntas) {
>   console.log("total:", perguntas.length)
>   console.log("primeira:", perguntas[0])
> })
> ```

---

## Parte 2 — app.js (3 mudanças)

Não reescreva o app.js inteiro. Apenas estas alterações.

---

### Task A01 — Loading state no HTML

#### 📖 Conceito

Enquanto o `app.js` awaita as perguntas, o usuário vê a tela parada sem feedback.
Vamos mostrar uma mensagem de carregamento e desabilitar o botão até as perguntas chegarem.

#### ✏️ Escreva

No `index.html`, dentro da tela home, adicione após o campo de nickname:

```html
<p id="loading-msg" class="loading-msg"></p>
```

No bloco `els` do `app.js`, adicione:

```js
loadingMsg: document.getElementById("loading-msg"),
```

---

### Task A02 — iniciarJogo vira async

#### 📖 Conceito

A função `iniciarJogo` usava o array `perguntas` que estava no próprio arquivo.
Agora as perguntas vêm de uma Promise — precisamos awaitar antes de usar.
Para usar `await` dentro de uma função, ela precisa ser declarada como `async`.

#### ✏️ Escreva

**Localize** a função `iniciarJogo()` e adicione `async` na declaração.
**Substitua** a linha que define as perguntas do jogo:

```js
// ANTES
estado.perguntasJogo = embaralhar(perguntas)

// DEPOIS
var todasPerguntas   = await window.bancoDePerguntasAsync
estado.perguntasJogo = embaralhar(todasPerguntas)
```

---

### Task A03 — responder usa o índice direto

#### 📖 Conceito

No `questions.js` v1, `correta` era um número direto.
Na v2, continua sendo um número — mas agora precisamos guardar em uma variável própria porque usamos o valor em dois lugares: na comparação de acerto e na marcação visual dos botões.

#### ✏️ Escreva

**Localize** dentro de `responder()` a linha que verifica o acerto e substitua:

```js
// ANTES
var acertou = (indiceEscolhido === pergunta.correta)

// DEPOIS
var indiceCorreto = pergunta.correta
var acertou       = (indiceEscolhido === indiceCorreto)
```

**Localize** o loop que marca os botões e substitua:

```js
// ANTES
if (idx === pergunta.correta) { btn.classList.add("correta") }

// DEPOIS
if (idx === indiceCorreto) { btn.classList.add("correta") }
```

---

### Task A04 — init() vira async com loading

#### 📖 Conceito

A função `init()` roda quando a página abre. É o momento certo para:
- Desabilitar o botão enquanto as perguntas não chegaram
- Mostrar a mensagem "carregando..."
- Atualizar os contadores quando o array estiver pronto
- Mostrar erro se a API falhar

#### ✏️ Escreva

**Substitua** a função `init()` atual por:

```js
async function init() {
  els.btnIniciar.disabled    = true
  els.loadingMsg.textContent = "carregando perguntas..."

  try {
    var perguntas = await window.bancoDePerguntasAsync

    var categorias = []
    for (var i = 0; i < perguntas.length; i++) {
      if (categorias.indexOf(perguntas[i].categoria) === -1) {
        categorias.push(perguntas[i].categoria)
      }
    }

    els.totalPerguntas.textContent  = perguntas.length
    els.totalCategorias.textContent = categorias.length
    els.loadingMsg.textContent      = ""
    els.btnIniciar.disabled         = false

  } catch (erro) {
    els.loadingMsg.textContent = "erro ao carregar. recarregue a página."
    console.error("[QuizCaju] Falha na inicialização:", erro)
  }
}
```

---

## Checklist final

**questions.js:**
- [ ] Console não mostra erros ao abrir o projeto
- [ ] `window.bancoDePerguntasAsync` existe e é uma Promise
- [ ] As perguntas chegam das 3 categorias
- [ ] O campo `correta` de cada pergunta é um número (0, 1, 2 ou 3)
- [ ] Na aba Network do DevTools, as 3 requisições para a OpenTDB aparecem ao mesmo tempo

**app.js:**
- [ ] "carregando perguntas..." aparece na home ao abrir
- [ ] O botão fica desabilitado durante o carregamento
- [ ] Quando as perguntas chegam, o contador atualiza e o botão habilita
- [ ] Acertar e errar funcionam normalmente
- [ ] Se a API falhar, aparece mensagem de erro e o jogo não quebra

---

*CajuHub · Jovem Tech · Aracaju, SE*
