// =============================================
//  QuizCaju — app.js
//  Construído ao vivo / tasks semana 1.
//  Siga os comentários + TASKS_SEMANA1.md
// =============================================


// ------------------------------------------------------------
// 1. ESTADO
// Crie aqui o objeto "estado" com todas as propriedades
// que representam a memória do jogo.
// Deve ficar no escopo global — fora de qualquer função.
// ------------------------------------------------------------

const estado = {
    //nome do jogador
    nickName: "",

    //pontuação inicial e acumulada
    pontos: 0,

    //pergunta atual do jogo
    indiceAtual: 0,

    //quantos acertos o jogador tem
    acertos: 0,

    //quantos erros o jogador tem
    erros: 0,

    //tempo máximo do timer, ou seja tempo limite para reponder
    timerSegundos: 20,

    //intervalo do timer/tempo
    timerIntervalo: null,

    //total de perguntas do JOGO
    perguntasJogo: [],

    //se o jogador respondeu ou não
    respondeu: false,

}

// ------------------------------------------------------------
// 2. REFERÊNCIAS AO DOM
// Crie o objeto "telas" com as 4 seções do jogo.
// Crie o objeto "els" com todos os elementos HTML.
// Use document.getElementById() para cada um.
// Atenção: alguns ids no HTML podem estar errados.
// ------------------------------------------------------------

const telas = {
    home: document.getElementById("tela-home"),
    questao: document.getElementById("tela-questao"),
    feedback: document.getElementById("tela-feedback"),
    resultado: document.getElementById("tela-resultado")

}

const els = {
    // home
    inputNickname: document.getElementById("input-nickname"),
    erroNickname: document.getElementById("erro-nickname"),
    btnIniciar: document.getElementById("btn-iniciar"),
    totalPerguntas: document.getElementById("total-perguntas"),
    totalCategorias: document.getElementById("total-categorias"),

    // questão
    questaoAtual: document.getElementById("questao-atual"),
    questaoTotal: document.getElementById("questao-total"),
    barraFill: document.getElementById("barra-fill"),
    timerArco: document.getElementById("timer-arco"),
    timerNum: document.getElementById("timer-num"),
    categoriaTag: document.getElementById("categoria-tag"),
    questaoTexto: document.getElementById("questao-texto"),
    opcoesGrid: document.getElementById("opcoes-grid"),

    // feedback
    feedbackIcone: document.getElementById("feedback-icone"),
    feedbackTitulo: document.getElementById("feedback-titulo"),
    feedbackExplic: document.getElementById("feedback-explicacao"),
    feedbackPontos: document.getElementById("feedback-pontos"),
    placarParcial: document.getElementById("placar-parcial"),
    btnProxima: document.getElementById("btn-proxima"),

    // resultado
    resultadoMedalha: document.getElementById("resultado-medalha"),
    resultadoNome: document.getElementById("resultado-nome"),
    scoreFinal: document.getElementById("score-final"),
    statAcertos: document.getElementById("stat-acertos"),
    statErros: document.getElementById("stat-erros"),
    statPorcento: document.getElementById("stat-porcento"),
    resultadoMsg: document.getElementById("resultado-mensagem"),
    btnJogarNovamente: document.getElementById("btn-jogar-novamente"),
}


// ------------------------------------------------------------
// 3. FUNÇÕES UTILITÁRIAS
// ------------------------------------------------------------

// mostrarTela(nomeTela)
// Remove "ativa" de todas as telas e adiciona só na escolhida.
// Use Object.values(telas).forEach(...) para percorrer.
function mostrarTela(nomeTela) {
    Object.values(telas).forEach(function(tela) {
        tela.classList.remove("ativa")
    })
    telas[nomeTela].classList.add("ativa")
}



// embaralhar(array)
// Retorna uma cópia embaralhada do array recebido.
// Algoritmo Fisher-Yates:
//   copia = array.slice()
//   para i do último até 1:
//     j = Math.floor(Math.random() * (i + 1))
//     troca copia[i] com copia[j]
//   retorna copia
function embaralhar(array) {
    let copia = array.slice()
    for (let i = copia.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)) // 3
        let temp = copia[i] // i = 5 e ele é igual a "joao"
        copia[i] = copia[j] // lucas
        copia[j] = temp
    }
    return copia
}
let resultado = embaralhar([1,2,3,4,5,6])
let resultado1 = embaralhar([1,2,3,4,5,6])
let resultado2 = embaralhar([1,2,3,4,5,6])
console.log(resultado)
console.log(resultado1)
console.log(resultado2)


// calcularPontos(segundosRestantes)
// Retorna: 500 + (segundosRestantes * 25)
function calcularPontos(segundosRestantes) {
    return 500 + (segundosRestantes * 25)
}

console.log(calcularPontos(5))

// ------------------------------------------------------------
// 4. LÓGICA DO JOGO
// ------------------------------------------------------------

// iniciarJogo()
// Valida nickname (mínimo 2 chars).
// Reseta o estado. Embaralha as perguntas.
// Chama mostrarTela("questao") e mostrarPergunta().
function iniciarJogo() {
    let nome = els.inputNickname.value.trim()

    if(nome.length < 3) {
        els.erroNickname.textContent = "Digite pelo menos 3 caracteres."
        return
    }

    els.erroNickname.textContent = "";
    estado.nickName = nome;
    estado.pontos = 0;
    estado.indiceAtual = 0;
    estado.acertos = 0;
    estado.erros = 0;

 estado.perguntasJogo = embaralhar(perguntas)
    mostrarTela("questao")
    mostrarPergunta()
}

els.inputNickname.addEventListener("keydown", function(e) {
    if(e.key === "Enter") {
        iniciarJogo()
    }
})

els.btnIniciar.addEventListener("click", iniciarJogo)


// mostrarPergunta()
// Pega estado.perguntasJogo[estado.indiceAtual].
// Atualiza progresso, categoria e texto no DOM.
// Limpa opcoes-grid e cria os botões com createElement.
// Conecta addEventListener em cada botão → responder(i).
// Atenção: use "let i" no for, não "var i".
// Chama iniciarTimer().
function mostrarPergunta() {
    let pergunta = estado.perguntasJogo[estado.indiceAtual]
    estado.respondeu = false;

// progresso do jogo
    let num = estado.indiceAtual + 1;
    let total = estado.perguntasJogo.length

    els.questaoAtual.textContent = num
    els.questaoTotal.textContent = total
    els.barraFill.style.width = ((num / total) * 100) + "%"

// textos das perguntas

    els.categoriaTag.textContent = pergunta.categoria
    els.questaoTexto.textContent = pergunta.pergunta

// limpa as opções anteriores e reconstroe
    els.opcoesGrid.innerHTML = ""
    
    let letras = ["A", "B", "C", "D"]
    let classes = ["letra-a", "letra-b", "letra-c", "letra-d" ]

    for (let i = 0; i < pergunta.opcoes.length; i++) {
        let btn = document.createElement("button")
        btn.className = "opcao-btn"
        btn.type = "button"

        let spanLetra = document.createElement("span")
        spanLetra.className = "opcao-letra" + classes[i]
        spanLetra.textContent = letras[i]

        let spanTexto = document.createElement("span")
        spanTexto.className = "opcao-texto"
        spanTexto.textContent = pergunta.opcoes[i]

        btn.appendChild(spanLetra)
        btn.appendChild(spanTexto)

        //let i garante q cada botão capture seu próprio índice
        btn.addEventListener("click", function(){
            responder(i)
        })

        els.opcoesGrid.appendChild(btn)
    }

} 


// iniciarTimer()
// Reseta timerSegundos para 20.
// clearInterval antes de criar um novo setInterval.
// A cada 1000ms: decrementa, atualiza DOM, move arco SVG.
// Se timerSegundos <= 0: clearInterval e responder(-1).
function iniciarTimer() {

}


// responder(indiceEscolhido)
// Guarda de segurança: if (estado.respondeu) return.
// clearInterval do timer.
// Compara indiceEscolhido com pergunta.correta.
// Marca botões com classList: "correta" e "errada".
// setTimeout de 1s → mostrarFeedback().
function responder(indiceEscolhido) {

    if (estado.respondeu) return
    estado.respondeu = true

    var pergunta = estado.perguntasJogo[estado.indiceAtual]
    var acertou = (indiceEscolhido === pergunta.correta)
    
    //Marca os botões visualmente
    var botoes = els.opcoesGrid.querySelectorAll(".opcao-btn")

    botoes.forEach(function(btn, idx) {
        btn.disabled = true
        if (idx === pergunta.correta) {
            btn.classList.add("correta")
        } else if (idx === indiceEscolhido) {
            btn.classList.add("errada")
        }
    })
    // Aguarda 1s para o jogador ver o resultado visual antes de mudar de tela
    setTimeout(function() {
        if (acertou) {
            var pts = calcularPontos (estado.timerSegundos)
            estado.pontos += pts
            estado.acertos++
            mostrarFeedback (true, pts, pergunta.explicacao)

        } else {
          estado.erros++
          mostrarFeedback(false, 0, pergunta.explicacao)
        }}, 1000)
}


// mostrarFeedback(acertou, pontosGanhos, explicacao)
// Atualiza ícone, título, pontos e explicação.
// Chama mostrarTela("feedback").
function mostrarFeedback(acertou, pontosGanhos, explicacao) 


// proximaPergunta()
// indiceAtual++
// Se ainda há perguntas → mostrarPergunta().
// Senão → mostrarResultado().
function proximaPergunta() {}



// mostrarResultado()
// Calcula aproveitamento. Define medalha e mensagem.
// Atualiza DOM da tela de resultado.
// Chama mostrarTela("resultado").
function mostrarResultado() {}
   


// ------------------------------------------------------------
// 5. EVENTOS
// Conecte os botões às funções com addEventListener.
//
//   btnIniciar       → iniciarJogo
//   inputNickname    → iniciarJogo quando Enter pressionado
//   btnProxima       → proximaPergunta
//   btnJogarNovamente → reiniciarJogo
// ------------------------------------------------------------




// ------------------------------------------------------------
// 6. INICIALIZAÇÃO
// Crie a função init() e chame ela aqui.
// Ela deve preencher totalPerguntas e totalCategorias na home.
// ------------------------------------------------------------
