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

