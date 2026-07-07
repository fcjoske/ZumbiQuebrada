// Dados gerados para Zumbis na Quebrada. Sem SVG; assets raster PNG/WAV.
window.ZNQ_DATA = {
  "manifest": {
    "animations": {
      "idle": 4,
      "walk": 6,
      "attack": 4,
      "hit": 3,
      "death": 6
    },
    "directions": [
      "S",
      "SE",
      "E",
      "NE",
      "N",
      "NW",
      "W",
      "SW"
    ],
    "tiles": [
      "urbano_floor",
      "urbano_wall",
      "urbano_decor",
      "feira_floor",
      "feira_wall",
      "feira_decor",
      "escola_floor",
      "escola_wall",
      "escola_decor",
      "cemiterio_floor",
      "cemiterio_wall",
      "cemiterio_decor",
      "favela_floor",
      "favela_wall",
      "favela_decor",
      "praia_floor",
      "praia_wall",
      "praia_decor",
      "metro_floor",
      "metro_wall",
      "metro_decor",
      "lab_floor",
      "lab_wall",
      "lab_decor",
      "junina_floor",
      "junina_wall",
      "junina_decor",
      "shopping_floor",
      "shopping_wall",
      "shopping_decor",
      "slime",
      "fire_floor",
      "dark_void"
    ],
    "props": [
      "carro_popular",
      "arvore_mangueira",
      "barraca_feira",
      "tumulo",
      "carteira_escola",
      "banco_praca",
      "poste_luz",
      "lixeira",
      "porta_madeira",
      "barricada",
      "guarda_sol",
      "maquina_lab",
      "caixa_madeira",
      "hidrante",
      "escada_rolante",
      "bandeirinhas",
      "muro_grafite"
    ],
    "items": [
      "agua_turbinada",
      "chinelo_explosivo",
      "rojao_junino",
      "spray_fogo",
      "guarana_explosivo",
      "estilingue",
      "panela_bomba",
      "aspirador_paranormal",
      "coxinha",
      "caldo_cana",
      "kit_cura",
      "amuleto"
    ],
    "effects": [
      "explosion",
      "smoke",
      "fire",
      "water",
      "poison",
      "spark",
      "rescue"
    ],
    "sprites": {
      "protagonists": [
        "leo_mandacaru",
        "bia_faisca"
      ],
      "enemies": [
        "zumbi_bairro",
        "noiva_fantasma",
        "cachorro_zumbi",
        "rato_mutante",
        "mosquito_mutante",
        "palhaco_demonico",
        "boneco_posto",
        "slime_toxico",
        "seguranca_possuido",
        "motoqueiro_fantasma",
        "planta_quintal",
        "fantasma_carnaval"
      ],
      "npcs": [
        "dona_neusa",
        "ze_motoboy",
        "gari_joel",
        "prof_marta",
        "skatista_lu",
        "policial_ana",
        "pastel_ivan",
        "crianca_beto",
        "vo_cida",
        "enfermeira_rosa",
        "porteiro_naldo",
        "musico_tito"
      ],
      "bosses": [
        "caminhao_lixo_possuido",
        "jacare_esgoto_mutante",
        "rainha_mosquito",
        "dj_necromante",
        "barao_entulho"
      ]
    }
  },
  "levels": [
    {
      "name": "Rua do Bairro",
      "theme": "urbano",
      "music": "fase_rua_treta",
      "enemies": [
        "zumbi_bairro",
        "cachorro_zumbi",
        "rato_mutante"
      ],
      "npcs": [
        "dona_neusa",
        "ze_motoboy",
        "gari_joel"
      ],
      "props": [
        "carro_popular",
        "arvore_mangueira",
        "poste_luz",
        "lixeira",
        "hidrante",
        "caixa_madeira"
      ],
      "boss": null,
      "objective": "Resgate 5 moradores e encontre o portão da viela."
    },
    {
      "name": "Feira Maldita",
      "theme": "feira",
      "music": "feira_maldita",
      "enemies": [
        "zumbi_bairro",
        "rato_mutante",
        "boneco_posto",
        "slime_toxico"
      ],
      "npcs": [
        "pastel_ivan",
        "dona_neusa",
        "crianca_beto"
      ],
      "props": [
        "barraca_feira",
        "caixa_madeira",
        "lixeira",
        "barricada",
        "poste_luz"
      ],
      "boss": null,
      "objective": "Salve os feirantes antes que os pastéis mordam de volta."
    },
    {
      "name": "Escola em Pânico",
      "theme": "escola",
      "music": "escola_pancada",
      "enemies": [
        "noiva_fantasma",
        "zumbi_bairro",
        "planta_quintal",
        "mosquito_mutante"
      ],
      "npcs": [
        "prof_marta",
        "crianca_beto",
        "enfermeira_rosa"
      ],
      "props": [
        "carteira_escola",
        "porta_madeira",
        "lixeira",
        "barricada",
        "maquina_lab"
      ],
      "boss": null,
      "objective": "Pegue a chave da diretoria e resgate a turma."
    },
    {
      "name": "Cemitério da Vila",
      "theme": "cemiterio",
      "music": "cemiterio_samba_sombrio",
      "enemies": [
        "noiva_fantasma",
        "zumbi_bairro",
        "fantasma_carnaval",
        "slime_toxico"
      ],
      "npcs": [
        "vo_cida",
        "porteiro_naldo",
        "policial_ana"
      ],
      "props": [
        "tumulo",
        "arvore_mangueira",
        "poste_luz",
        "barricada"
      ],
      "boss": "caminhao_lixo_possuido",
      "objective": "Derrote o caminhão do lixo possuído."
    },
    {
      "name": "Praça dos Pombos Possuídos",
      "theme": "urbano",
      "music": "fase_rua_treta",
      "enemies": [
        "mosquito_mutante",
        "rato_mutante",
        "zumbi_bairro",
        "planta_quintal"
      ],
      "npcs": [
        "skatista_lu",
        "vo_cida",
        "musico_tito"
      ],
      "props": [
        "banco_praca",
        "arvore_mangueira",
        "poste_luz",
        "hidrante",
        "lixeira"
      ],
      "boss": null,
      "objective": "Limpe a praça e salve os rolês de domingo."
    },
    {
      "name": "Condomínio Fechado do Inferno",
      "theme": "shopping",
      "music": "escola_pancada",
      "enemies": [
        "seguranca_possuido",
        "boneco_posto",
        "zumbi_bairro",
        "cachorro_zumbi"
      ],
      "npcs": [
        "porteiro_naldo",
        "policial_ana",
        "dona_neusa"
      ],
      "props": [
        "porta_madeira",
        "carro_popular",
        "banco_praca",
        "barricada",
        "lixeira"
      ],
      "boss": "jacare_esgoto_mutante",
      "objective": "Ache a saída da garagem e enfrente o jacaré do encanamento."
    },
    {
      "name": "Shopping Fantasma",
      "theme": "shopping",
      "music": "cemiterio_samba_sombrio",
      "enemies": [
        "seguranca_possuido",
        "palhaco_demonico",
        "fantasma_carnaval",
        "boneco_posto"
      ],
      "npcs": [
        "musico_tito",
        "enfermeira_rosa",
        "ze_motoboy"
      ],
      "props": [
        "escada_rolante",
        "lixeira",
        "banco_praca",
        "caixa_madeira",
        "porta_madeira"
      ],
      "boss": null,
      "objective": "Resgate quem ficou preso na liquidação eterna."
    },
    {
      "name": "Favela em Chamas Sobrenaturais",
      "theme": "favela",
      "music": "feira_maldita",
      "enemies": [
        "motoqueiro_fantasma",
        "zumbi_bairro",
        "slime_toxico",
        "cachorro_zumbi"
      ],
      "npcs": [
        "gari_joel",
        "musico_tito",
        "skatista_lu"
      ],
      "props": [
        "muro_grafite",
        "carro_popular",
        "barricada",
        "arvore_mangueira",
        "hidrante"
      ],
      "boss": "rainha_mosquito",
      "objective": "Apague o caos e derrube a rainha do pernilongo."
    },
    {
      "name": "Metrô Interrompido",
      "theme": "metro",
      "music": "laboratorio_final",
      "enemies": [
        "seguranca_possuido",
        "rato_mutante",
        "motoqueiro_fantasma",
        "slime_toxico"
      ],
      "npcs": [
        "policial_ana",
        "prof_marta",
        "ze_motoboy"
      ],
      "props": [
        "escada_rolante",
        "maquina_lab",
        "lixeira",
        "barricada",
        "porta_madeira"
      ],
      "boss": null,
      "objective": "Atravesse os trilhos sem virar atraso eterno."
    },
    {
      "name": "Praia Assombrada",
      "theme": "praia",
      "music": "praia_assombrada",
      "enemies": [
        "fantasma_carnaval",
        "mosquito_mutante",
        "zumbi_bairro",
        "planta_quintal"
      ],
      "npcs": [
        "musico_tito",
        "crianca_beto",
        "dona_neusa"
      ],
      "props": [
        "guarda_sol",
        "arvore_mangueira",
        "banco_praca",
        "lixeira",
        "caixa_madeira"
      ],
      "boss": null,
      "objective": "Salve a galera antes da maré fantasma subir."
    },
    {
      "name": "Festa Junina dos Mortos",
      "theme": "junina",
      "music": "feira_maldita",
      "enemies": [
        "palhaco_demonico",
        "boneco_posto",
        "fantasma_carnaval",
        "zumbi_bairro"
      ],
      "npcs": [
        "pastel_ivan",
        "musico_tito",
        "vo_cida"
      ],
      "props": [
        "bandeirinhas",
        "barraca_feira",
        "caixa_madeira",
        "barricada",
        "poste_luz"
      ],
      "boss": "dj_necromante",
      "objective": "Pare o arraial necromante."
    },
    {
      "name": "Laboratório do Barão do Entulho",
      "theme": "lab",
      "music": "laboratorio_final",
      "enemies": [
        "slime_toxico",
        "mosquito_mutante",
        "seguranca_possuido",
        "planta_quintal"
      ],
      "npcs": [
        "enfermeira_rosa",
        "prof_marta",
        "porteiro_naldo"
      ],
      "props": [
        "maquina_lab",
        "porta_madeira",
        "caixa_madeira",
        "barricada",
        "lixeira"
      ],
      "boss": "barao_entulho",
      "objective": "Derrube o Barão do Entulho e feche a rachadura sobrenatural."
    }
  ]
};
