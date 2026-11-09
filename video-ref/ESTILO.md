# Tipografia Gritada Vermelha

id: tipografia-gritada-vermelha (referência própria: instagram.com/reel/Deo9DKTxmbV)
Bom para: Reels de venda, anúncio de curso/produto, abertura com narração, chamada para link
Clima: narração falada vira texto que soca na tela, palavra por palavra, em vermelho, preto e creme.
Peça de partida: nenhuma, só a ficha (base de motor: estilos/cartaz-gritado)
Referência: ref.mp4 (74,6 s, 9:16 filmado de um monitor 16:9; a peça na tela é 16:9; tem áudio: narração)

## Mecanismo (uma frase)
Cada palavra falada aparece na tela no instante em que é dita, e o fundo troca de cor no soco.

## Paleta (hex)
- fundo escuro: #080303 (com vinheta vermelha bem fraca #160E0B nos cantos)
- fundo claro: #F1EDE0 (creme, alterna com o escuro)
- fundo soco: #DF1904 (vermelho chapado, só nos socos, 1 a cada ~6 s)
- tinta no escuro: #F1EDE0 (creme)  · tinta no claro: #0B0A0A
- DESTAQUE ÚNICO: #DF1904 (vermelho). Uma palavra por frase, a palavra-chave.

## Tipografia
- Display condensado: Anton 400 (caixa alta), tracking -0,01em, entrelinha 0,9
- Display largo (palavra de impacto/marca): Archivo Black 400, tracking -0,02em
- Contorno: Anton com só traço (2 px), para palavras de apoio ("o que tu")
- Links:
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&display=swap">

## Easing (números)
- pousar: expo.out, 0,18 s (entra com blur horizontal 24px→0 e deslocamento 8% da largura)
- sair: power3.in, 0,12 s (blur + some), ou corte seco
- mover (câmera): power2.inOut, 0,4 s, push-in leve 1,00→1,06 durante a frase
- escalonamento: palavra a palavra, no tempo da fala (≈ 0,25–0,45 s por palavra)

## Regras de movimento
- Texto acompanha a narração: uma a três palavras por vez, nunca a frase inteira de uma vez.
- Frase se empilha: palavra nova entra abaixo/ao lado; a anterior fica, menor ou diminuída.
- Troca de fundo (escuro↔creme↔vermelho) é corte seco no soco, sem crossfade.
- Motion blur horizontal em toda entrada rápida; pouso nítido.
- Depois do pouso, 0,3–0,8 s parado (as paradas fazem o soco aparecer).

## Movimentos de assinatura
- Palavra-soco gigante em Archivo Black creme com brilho vermelho e um risco de luz horizontal vermelho cortando a tela.
- Palavra em vermelho que entra "rasgando" com blur e pousa trêmula 2 quadros.
- Objeto vermelho simples (quadrado → cubo 3D) que ilustra a fala.
- Fecho: marca + preço + "CLICA NO LINK" com a última palavra em vermelho.

## Composição
- 16:9 (a peça); texto descentralizado: âncora em terço esquerdo ou base, nunca tudo no meio.
- Palavra-soco ocupa 60–90% da largura.

## Com mídia
- Prints de tela/app entram como card escuro arredondado à esquerda, texto à direita.

## Lista de proibições
- Nada de gradiente mudando de cor, nada de partícula contínua, nada de texto parado sem fala.
- Nada de crossfade longo (>0,15 s). Nada de duas cores de destaque. Nada de itálico.
- Exceção do estilo: brilho vermelho atrás da palavra-soco e risco de luz são permitidos (assinatura).

## Metas de movimento (medidas na referência)
- amplitude ≥ 3,5x · quase-parada ≥ 25% · ≥ 6 picos · tem cortes duros (15 na ref.)
