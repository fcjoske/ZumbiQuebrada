# Mini GDD — Zumbis na Quebrada

## Nome
**Zumbis na Quebrada**

Alternativas de nome pensadas:
- **Mutirão dos Mortos**
- **Assombração no Rolê**
- **Apocalipse de Chinelo**
- **Pânico no Bairro 13**

O nome escolhido mantém humor, brasilidade e leitura imediata do gênero.

## Pitch
Um arcade top-down cooperativo em que dois jovens brasileiros salvam moradores de bairros, feiras, escolas, cemitérios, praias, metrôs e festas assombradas enquanto enfrentam monstros urbanos, experimentos tóxicos e chefes gigantes.

## História
O excêntrico empresário ocultista **Barão do Entulho** tenta transformar lixo tóxico, tecnologia clandestina e folclore urbano em uma nova fonte de energia chamada **Muvuca Ectoplásmica**. O experimento abre rachaduras sobrenaturais pelo Brasil e espalha zumbis, fantasmas e criaturas mutantes.

**Felipe** e **Nika** percebem que a infestação começou no bairro deles e saem para resgatar moradores, fechar portais e impedir que o Barão transforme o país em um condomínio fantasma premium.

## Personagens principais

### Felipe
- Jovem improvisador, piadista e corajoso.
- Visual: boné verde, camisa vermelha, bermuda azul, postura direta.
- Estilo: resistente e fácil de controlar.
- Fala típica: “Se correr o bicho pega, se ficar eu taco chinelo.”

### Nika
- Inventora de gambiarra, rápida, sarcástica e confiante.
- Visual: cabelo roxo, jaqueta azul, detalhes rosa/amarelos.
- Estilo: ágil e boa para coop.
- Fala típica: “Isso aqui não é bug, é sobrenatural mal configurado.”

## Vilão

### Barão do Entulho
Empresário picareta, guru de tecnologia duvidosa e ocultista de fundo de galpão. Ele vende a “Muvuca Ectoplásmica” como solução urbana, mas usa moradores como isca para estabilizar portais.

## Loop principal
1. Entrar em uma fase curta.
2. Explorar o mapa top-down.
3. Resgatar NPCs.
4. Coletar armas, munição e cura.
5. Sobreviver a inimigos e hazards.
6. Cumprir objetivo.
7. Ir até a saída brilhante.
8. Receber pontuação e avançar.

## Armas e itens
- Pistola d’água turbinada
- Chinelo explosivo
- Rojão junino
- Spray com fogo
- Guaraná explosivo
- Estilingue
- Kit de cura
- Coxinha energética
- Caldo de cana turbo
- Amuleto/efeitos visuais de resgate

## Inimigos
- Zumbi de bairro
- Noiva fantasma
- Cachorro zumbi
- Rato mutante
- Mosquito mutante
- Palhaço demoníaco
- Boneco de posto vivo
- Slime tóxico
- Segurança possuído
- Motoqueiro fantasma
- Planta carnívora de quintal
- Fantasma de carnaval

## Chefes
- Caminhão do lixo possuído
- Jacaré mutante do esgoto
- Rainha dos mosquitos
- DJ necromante
- Barão do Entulho

## Fases
1. Rua do Bairro
2. Feira Maldita
3. Escola em Pânico
4. Cemitério da Vila
5. Praça dos Pombos Possuídos
6. Condomínio Fechado do Inferno
7. Shopping Fantasma
8. Favela em Chamas Sobrenaturais
9. Metrô Interrompido
10. Praia Assombrada
11. Festa Junina dos Mortos
12. Laboratório do Barão do Entulho

## Direção visual
- Pixel art rasterizada, 16/32-bit, top-down.
- Paleta viva, com contraste alto para leitura dos personagens.
- Cores de terror cômico: roxos, verdes tóxicos, amarelos de lâmpada, vermelhos de alerta.
- Cenários com props brasileiros: feira, postes, barracas, hidrantes, carros, túmulos, carteiras escolares, bandeirinhas, muros grafitados, guarda-sol e máquinas clandestinas.

## Arquitetura técnica
- HTML5 Canvas puro.
- Sem dependências externas.
- PNG para sprites, tiles, props, itens, efeitos e UI.
- WAV procedural para música e efeitos.
- `src/data.js` guarda manifesto e fases.
- `src/main.js` implementa engine, input, colisão, IA, HUD, cutscenes e estados de jogo.
