# Arquitetura técnica

## Engine
O jogo usa HTML5 Canvas puro, sem Phaser, Pixi ou CDN. Isso reduz dependências e facilita abrir localmente.

## Arquivos principais

### `index.html`
Cria o canvas, aplica CSS responsivo 16:9 e carrega os scripts.

### `src/data.js`
Contém:
- manifesto de assets;
- lista de fases;
- temas;
- inimigos por fase;
- NPCs por fase;
- props por fase;
- chefes e objetivos.

### `src/main.js`
Contém:
- loader de imagens/áudio;
- estados do jogo;
- menu/opções/controles/créditos;
- cutscenes;
- input de teclado, mouse, gamepad e touch;
- geração procedural de mapas;
- colisão;
- jogadores;
- inimigos;
- chefes;
- NPCs resgatáveis;
- projéteis;
- pickups;
- hazards;
- HUD;
- câmera;
- renderização de spritesheets.

## Estados
- `boot`
- `menu`
- `options`
- `controls`
- `credits`
- `cutscene`
- `playing`
- `clear`
- `gameover`
- `victory`

## Colisão
A colisão usa:
- limites do mapa;
- matriz de tiles sólidos;
- props sólidos com colisão círculo-retângulo;
- colisão circular entre jogadores, inimigos, projéteis e bosses.

## Mapas
As fases são geradas proceduralmente com seed fixa por fase. Isso mantém o layout estável entre execuções, mas evita depender de arquivos externos de mapa.

## Performance
- Canvas único.
- Spritesheets PNG compactados.
- Renderização apenas da área visível do tilemap.
- Sprites ordenados por coordenada Y para dar profundidade top-down.
- Áudio WAV curto/loopável.
- Sem bibliotecas externas.

## Pontos fáceis de expandir
- Adicionar fases em `LEVELS`.
- Adicionar inimigos em `ENEMY_STATS`.
- Adicionar armas em `WEAPONS`.
- Trocar sprites mantendo o layout do plano de spritesheets.
- Criar mapas manuais substituindo `generateLevel`.
