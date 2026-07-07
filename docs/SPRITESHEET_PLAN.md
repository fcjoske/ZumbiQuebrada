# Plano de spritesheets e animações

## Regra geral
Todos os sprites principais são PNG com fundo transparente. Não há SVG.

## Personagens, inimigos e NPCs

### Tamanho de frame
- Personagens/NPCs/inimigos comuns: `48x48 px`
- Chefes: `96x96 px`

### Layout
Cada spritesheet usa:
- 6 colunas de frames
- 40 linhas
- 5 grupos de animação
- 8 direções por animação

Ordem das animações:
1. idle
2. walk
3. attack
4. hit
5. death

Ordem das direções dentro de cada animação:
1. S
2. SE
3. E
4. NE
5. N
6. NW
7. W
8. SW

Exemplo de cálculo de linha:

```js
row = animationIndex * 8 + directionIndex
```

Exemplo de cálculo de coluna:

```js
col = Math.floor(time * fps) % frameCount
```

## Frames por animação
- idle: 4 frames
- walk: 6 frames
- attack: 4 frames
- hit: 3 frames
- death: 6 frames

As colunas extras repetem frames quando a animação tem menos de 6 frames.

## Efeitos visuais
`effects_brasil.png` usa:
- frame `48x48 px`
- 8 colunas
- 7 linhas

Linhas:
1. explosão
2. fumaça
3. fogo
4. água
5. veneno
6. brilho/faísca
7. resgate

## Itens
`items_brasil.png` usa:
- frame `32x32 px`
- 8 colunas
- 2 linhas

## Props
`props_brasil.png` usa:
- frame `48x48 px`
- 8 colunas
- múltiplas linhas

## Tiles
`tiles_brasil.png` usa:
- tile `32x32 px`
- 8 colunas
- múltiplas linhas

## Consistência visual
A consistência foi mantida por:
- paleta central com outline escuro;
- proporção fixa de cabeça/corpo;
- mesma câmera top-down;
- mesma escala de sprite;
- animação por template procedural;
- ausência de fundo embutido nos sprites.
