# Zumbis na Quebrada

Jogo HTML5 top-down arcade com resgate de NPCs, terror cômico brasileiro, campanha por fases, sprites raster PNG e áudio WAV procedural.

## Como rodar

### Opção rápida
Abra `index.html` em um navegador moderno.

### Opção recomendada
Alguns navegadores bloqueiam áudio local até haver interação do usuário. Para testar de forma mais estável:

```bash
cd zumbis_na_quebrada
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Controles

### Jogador 1
- Mover: `WASD` ou setas
- Mirar: mouse
- Atirar: clique esquerdo ou `Espaço`
- Trocar arma: `Q` ou `Tab`
- Interagir/resgatar/abrir porta: `E`
- Pausar/voltar: `Esc`

### Jogador 2 / Coop local
- Entrar no jogo: `C`
- Mover: `IJKL`
- Atirar: `U`
- Trocar arma: `O`
- Interagir: `P`

### Gamepad
- Analógico esquerdo: mover
- `A` ou gatilho direito: atirar
- `RB`: trocar arma
- `B`: interagir

### Touchscreen
- Analógico virtual à esquerda
- Botões à direita: atirar, trocar arma, ação/interagir e pause

## Conteúdo incluído

- Código-fonte completo em HTML5/JavaScript.
- Assets visuais rasterizados em PNG: protagonistas, inimigos, NPCs, chefes, tilesets, props, itens, efeitos, HUD e telas.
- Áudio procedural em WAV: músicas de menu/fases/chefes/vitória/game over e efeitos sonoros.
- 12 fases jogáveis com progressão, resgate de NPCs, pickups, hazards e chefes.
- Cutscenes e diálogos com suporte a português, inglês e russo.
- HUD, menu, opções, controles, créditos, tela de fase concluída, conquistas, game over e vitória.
- Sistema de achievements com salvamento em localStorage e popup de desbloqueio.

## Estrutura

```text
zumbis_na_quebrada/
├─ index.html
├─ src/
│  ├─ data.js
│  └─ main.js
├─ assets/
│  ├─ images/
│  │  ├─ sprites/
│  │  ├─ tilesets/
│  │  ├─ props/
│  │  ├─ items/
│  │  ├─ effects/
│  │  ├─ portraits/
│  │  └─ ui/
│  └─ audio/
│     ├─ music/
│     └─ sfx/
└─ docs/
   ├─ MINI_GDD.md
   ├─ ASSET_LIST.md
   ├─ SPRITESHEET_PLAN.md
   └─ ARCHITECTURE.md
```

## Observações de produção

- O projeto não usa SVG nos personagens, cenários, itens, efeitos ou UI principal.
- Os assets foram gerados proceduralmente em raster, com fundo transparente nos sprites.
- O visual foi mantido consistente por paletas e templates de animação compartilhados.
- Não há uso de personagens, nomes, fases, mapas, músicas ou diálogos de obras existentes.
- O código foi feito sem engine externa para facilitar abrir e testar localmente.


## Atualização V12

- Pause corrigido com opções de continuar e voltar à tela de título.
- Intro mais cinematográfica com splash da desenvolvedora e cartões narrativos.
- Textos revisados e localizados em PT/EN/RU.
- Conquistas adicionadas à tela de título com notificação de desbloqueio.
- Protagonistas atualizados visualmente para refletir Felipe e Nika.
- Música procedural retrabalhada para um timbre mais suave em estilo chiptune/16-bit.


## V14 — Full Art Swap

- Substituição completa da direção visual com base no pacote `assets(2).zip`.
- Novos protagonistas Felipe e Nika em estilo 16-bit mais coeso.
- Novos portraits, NPCs, inimigos e chefes.
- Props, tilesets, itens, efeitos e UI renovados.
- Fonte do projeto atualizada para `ZnqArcade`.
- Splash da desenvolvedora e cards de intro integrados às telas de abertura.


## V15 — Polimento visual

- Menu/título refeitos para não parecer uma folha de assets.
- Novo background 16-bit limpo usando os cenários de referência.
- Fonte arcade integrada no projeto.
- Spritesheets passam por limpeza de bordas e sobras de grid.
- UI de abertura, loading e painéis finais mais coesos com o pacote novo.


## V16 — Integração dos novos assets de referência
- Integração de novos cenários de referência em `assets/images/reference_v16/`.
- `menu_bg.png` atualizado com o cenário noturno em pixel art.
- `intro1-3.png` atualizados com cenas do novo mockup de gameplay.
- `tiles_brasil.png` recriado a partir do atlas visual gerado, preservando compatibilidade com o código do jogo.
- `props_brasil.png` recriado a partir do atlas de objetos gerado, preservando compatibilidade com o código do jogo.

Observação: os arquivos de referência grandes foram mantidos no projeto para futuras revisões artísticas fase por fase.


## V17 Hotfix
- Correção da versão anterior que apresentou erro ao abrir.
- Retorno para a base estável da V16.
- Atualização segura de menu, intro e splash usando as novas referências 16-bit.


## V20 — Full Graphic Rebuild
- Rebuild visual completo a partir do zero, preservando apenas a lógica/base estável do jogo.
- Substituição total dos gráficos antigos: protagonistas, portraits, NPCs, inimigos, chefes, tiles, props, itens, VFX e UI.
- Direção visual refeita com base nas referências 16-bit fornecidas.
