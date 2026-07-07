from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import shutil, re

BASE = Path('/mnt/data/work/project/zumbis_na_quebrada')
ASSET_DIR = Path('/mnt/data/work/assets2/Nova pasta')
IMG = BASE/'assets/images'
FONTDIR = BASE/'assets/fonts'
FONTDIR.mkdir(parents=True, exist_ok=True)

# Boards
hero_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_28 (1).png').convert('RGBA')
npc_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (2).png').convert('RGBA')
enemy_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (3).png').convert('RGBA')
boss_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (4).png').convert('RGBA')
tiles_a = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (5).png').convert('RGBA')
tiles_b = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (6).png').convert('RGBA')
tiles_c = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (7).png').convert('RGBA')
props_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (8).png').convert('RGBA')
ui_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (9).png').convert('RGBA')

font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
font_big = ImageFont.truetype(font_path, 18)
font_small = ImageFont.truetype(font_path, 13)

# --- helpers ---
def remove_checker(im):
    im = im.convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a = px[x,y]
            if not a:
                continue
            mx=max(r,g,b); mn=min(r,g,b)
            sat = mx-mn
            mean=(r+g+b)//3
            # remove light/neutral checker and pale sheet background
            if (sat < 24 and mean > 150) or (sat < 16 and mean > 110 and mx > 140):
                px[x,y]=(r,g,b,0)
    return im

def trim(im, pad=2):
    bbox = im.getbbox()
    if not bbox:
        return Image.new('RGBA', (8,8), (0,0,0,0))
    x0,y0,x1,y1 = bbox
    x0=max(0,x0-pad); y0=max(0,y0-pad); x1=min(im.width,x1+pad); y1=min(im.height,y1+pad)
    return im.crop((x0,y0,x1,y1))

def crop(board, box, transparent=True, pad=2):
    im = board.crop(tuple(map(int, box)))
    if transparent:
        im = remove_checker(im)
    return trim(im, pad)

def fit(im, size, pad=2):
    cw,ch = size
    out = Image.new('RGBA', size, (0,0,0,0))
    if im.width == 0 or im.height == 0:
        return out
    scale = min((cw-pad*2)/im.width, (ch-pad*2)/im.height)
    nw = max(1, int(round(im.width*scale)))
    nh = max(1, int(round(im.height*scale)))
    rs = im.resize((nw,nh), Image.Resampling.LANCZOS)
    out.alpha_composite(rs, ((cw-nw)//2, (ch-nh)//2))
    return out

def make_sprite_sheet(frame_size, anims):
    # anims: dict name -> list[8 dirs], each a list frames
    order = ['idle','walk','attack','hit','death']
    out = Image.new('RGBA', (frame_size*6, frame_size*40), (0,0,0,0))
    for ai, name in enumerate(order):
        dirs = anims[name]
        for di in range(8):
            frames = dirs[di]
            for fi in range(6):
                fr = frames[min(fi, len(frames)-1)]
                if fr.size != (frame_size, frame_size):
                    fr = fit(fr, (frame_size, frame_size), 1)
                out.alpha_composite(fr, (fi*frame_size, (ai*8+di)*frame_size))
    return out

def portrait_card(img, label):
    out = Image.new('RGBA', (128,128), (14,18,30,255))
    d = ImageDraw.Draw(out)
    for y in range(0,128,8):
        for x in range(0,128,8):
            if ((x+y)//8)%2 == 0:
                d.rectangle([x,y,x+7,y+7], fill=(24,31,48,255))
    d.rounded_rectangle([3,3,124,124], radius=8, outline=(240,197,78,255), width=3, fill=(18,22,36,220))
    art = fit(img, (110,92), 1)
    out.alpha_composite(art, (9,8))
    d.rounded_rectangle([8,101,119,120], radius=5, fill=(54,32,70,220), outline=(146,104,194,255), width=2)
    tw = d.textlength(label, font=font_small)
    d.text(((128-tw)//2,105), label, font=font_small, fill=(245,244,255,255))
    return out

# --- protagonists ---
# visual rows and columns on board
left_x = [139, 210, 281, 352, 423, 494, 565, 636]
right_x = [808, 879, 950, 1021, 1092, 1163, 1234, 1305]
hero_rows = {
    'idle': 350, 'walk': 419, 'run': 489, 'attack': 561, 'hit': 633, 'interact': 707, 'rescue': 781, 'death': 853
}
# portraits and mini portraits
hero_meta = {
    'leo_mandacaru': {
        'cols': left_x,
        'portrait': (236, 178, 411, 303),
        'name': 'FELIPE',
        'walkRow':'walk', 'idleRow':'idle', 'attackRow':'attack', 'hitRow':'hit', 'deathRow':'death'
    },
    'bia_faisca': {
        'cols': right_x,
        'portrait': (874, 177, 1048, 303),
        'name': 'NIKA',
        'walkRow':'walk', 'idleRow':'idle', 'attackRow':'attack', 'hitRow':'hit', 'deathRow':'death'
    }
}
for file_name,meta in hero_meta.items():
    cols = meta['cols']
    def cell(xc,yc,w=64,h=64):
        return crop(hero_board, (xc-w//2, yc-h//2, xc+w//2, yc+h//2), True, 1)
    idle = [cell(x, hero_rows[meta['idleRow']], 62, 62) for x in cols]
    walk = [cell(x, hero_rows[meta['walkRow']], 64, 64) for x in cols]
    attack = [cell(x, hero_rows[meta['attackRow']], 72, 72) for x in cols]
    hit = [cell(x, hero_rows[meta['hitRow']], 68, 68) for x in cols]
    # death row is 5 poses, no 8 directions; repeat by dir
    death_poses=[]
    dcenters = cols[:5] if file_name=='leo_mandacaru' else cols[:5]
    for x in dcenters:
        death_poses.append(cell(x, hero_rows[meta['deathRow']], 80, 56))
    anims = {
        'idle': [[fit(idle[i], (56,56), 1)]*4 for i in range(8)],
        'walk': [[fit(walk[i], (56,56), 1)]*6 for i in range(8)],
        'attack': [[fit(attack[i], (56,56), 1)]*4 for i in range(8)],
        'hit': [[fit(hit[i], (56,56), 1)]*3 for i in range(8)],
        'death': [[fit(death_poses[min(i, len(death_poses)-1)], (56,56), 1)]*6 for i in range(8)],
    }
    sheet = make_sprite_sheet(56, anims)
    (IMG/'sprites/protagonists').mkdir(parents=True, exist_ok=True)
    sheet.save(IMG/'sprites/protagonists'/f'{file_name}.png')
    por = crop(hero_board, meta['portrait'], True, 1)
    portrait_card(por, meta['name']).save(IMG/'portraits'/f'{file_name}.png')

# --- NPCs ---
npc_names = ['dona_neusa','ze_motoboy','gari_joel','prof_marta','skatista_lu','policial_ana','pastel_ivan','crianca_beto','vo_cida','enfermeira_rosa','musico_tito','porteiro_naldo']
# board blocks 4x4 columns across 4 rows
npc_blocks = {
    'dona_neusa': (46, 86),
    'ze_motoboy': (407, 87),
    'gari_joel': (770, 88),
    'prof_marta': (1128, 89),
    'skatista_lu': (49, 357),
    'policial_ana': (409, 359),
    'pastel_ivan': (770, 360),
    'crianca_beto': (48, 628),
    'vo_cida': (409, 628),
    'enfermeira_rosa': (1129, 629),
    'musico_tito': (771, 901),
    'porteiro_naldo': (1130, 900),
}
# mascot/turista/churras not used. block has 4 columns x 3 rows + portrait at right. Each cell ~64x64, portrait in block right top.
for name,(x0,y0) in npc_blocks.items():
    cols = [x0+73, x0+140, x0+207, x0+274]
    idle_y, walk_y, react_y = y0+38, y0+112, y0+185
    portrait = crop(npc_board, (x0+250, y0+10, x0+338, y0+98), True, 1)
    idle = [crop(npc_board, (c-30, idle_y-30, c+30, idle_y+30), True, 1) for c in cols[:3]]
    walk = [crop(npc_board, (c-32, walk_y-32, c+32, walk_y+32), True, 1) for c in cols]
    react = [crop(npc_board, (c-32, react_y-32, c+32, react_y+32), True, 1) for c in cols]
    anims = {
        'idle': [[fit(idle[i%len(idle)], (48,48),1)]*4 for i in range(8)],
        'walk': [[fit(walk[i%len(walk)], (48,48),1)]*6 for i in range(8)],
        'attack': [[fit(react[i%len(react)], (48,48),1)]*4 for i in range(8)],
        'hit': [[fit(react[i%len(react)], (48,48),1)]*3 for i in range(8)],
        'death': [[fit(idle[i%len(idle)], (48,48),1)]*6 for i in range(8)],
    }
    make_sprite_sheet(48, anims).save(IMG/'sprites/npcs'/f'{name}.png')
    label = {'dona_neusa':'DONA','ze_motoboy':'MOTO','gari_joel':'GARI','prof_marta':'PROF','skatista_lu':'SKATE','policial_ana':'POLI','pastel_ivan':'PASTEL','crianca_beto':'CRIANÇA','vo_cida':'VÓ','enfermeira_rosa':'ENFER','musico_tito':'MÚSICO','porteiro_naldo':'PORT'}[name]
    portrait_card(portrait, label).save(IMG/'portraits'/f'{name}.png')

# --- Enemies ---
enemy_names = [
    ('zumbi_bairro', 44, 122), ('cachorro_zumbi', 733, 122), ('rato_mutante', 44, 286), ('mosquito_mutante', 733, 286),
    ('noiva_fantasma', 44, 450), ('palhaco_demonico', 733, 450), ('boneco_posto', 44, 612), ('seguranca_possuido', 44, 776),
    ('slime_toxico', 44, 943), ('planta_quintal', 394, 943), ('motoqueiro_fantasma', 733, 776), ('fantasma_carnaval', 733, 943)
]
for name, x0, y0 in enemy_names:
    # 5 frames across row; approximate centers
    xs = [x0+55, x0+177, x0+299, x0+421, x0+543]
    is_flying = name in ('mosquito_mutante','motoqueiro_fantasma','fantasma_carnaval')
    h = 78 if is_flying else 66
    w = 96 if name in ('motoqueiro_fantasma','fantasma_carnaval') else 84 if name in ('mosquito_mutante','palhaco_demonico') else 72
    frames = [crop(enemy_board, (xc-w//2, y0-h//2, xc+w//2, y0+h//2), True, 1) for xc in xs]
    idle, walkf, attack, hit, death = frames
    anims = {
        'idle': [[fit(idle,(48,48),1)]*4 for _ in range(8)],
        'walk': [[fit(walkf,(48,48),1)]*6 for _ in range(8)],
        'attack': [[fit(attack,(48,48),1)]*4 for _ in range(8)],
        'hit': [[fit(hit,(48,48),1)]*3 for _ in range(8)],
        'death': [[fit(death,(48,48),1)]*6 for _ in range(8)],
    }
    make_sprite_sheet(48, anims).save(IMG/'sprites/enemies'/f'{name}.png')
    portrait_card(attack, name.split('_')[0].upper()[:10]).save(IMG/'portraits'/f'{name}.png')

# --- Bosses ---
boss_rows = {
    'caminhao_lixo_possuido': (176, 'CAMINHÃO'),
    'jacare_esgoto_mutante': (342, 'JACARÉ'),
    'rainha_mosquito': (509, 'RAINHA'),
    'dj_necromante': (676, 'DJ'),
    'barao_entulho': (1009, 'BARÃO'),
}
for name,(yc,label) in boss_rows.items():
    xs = [286, 549, 812, 1076, 1337]
    size = [(210,120),(230,130),(230,130),(250,140),(260,145)]
    frames=[]
    for xc,(w,h) in zip(xs,size):
        frames.append(crop(boss_board, (xc-w//2, yc-h//2, xc+w//2, yc+h//2), False, 1))
    idle, attack, hit, phase, death = frames
    anims = {
        'idle': [[fit(idle,(96,96),2)]*4 for _ in range(8)],
        'walk': [[fit(idle,(96,96),2), fit(attack,(96,96),2), fit(idle,(96,96),2), fit(hit,(96,96),2), fit(idle,(96,96),2), fit(attack,(96,96),2)] for _ in range(8)],
        'attack': [[fit(attack,(96,96),2)]*4 for _ in range(8)],
        'hit': [[fit(hit,(96,96),2)]*3 for _ in range(8)],
        'death': [[fit(death,(96,96),2)]*6 for _ in range(8)],
    }
    make_sprite_sheet(96, anims).save(IMG/'sprites/bosses'/f'{name}.png')
    portrait_card(idle, label).save(IMG/'portraits'/f'{name}.png')

# --- Props atlas (48x48) ---
# pick representative sprites. some from props_board, some from tile boards.
props_map = {
    'carro_popular': crop(props_board,(33,151,122,265),True,1),
    'arvore_mangueira': crop(props_board,(34,656,136,758),True,1),
    'barraca_feira': crop(props_board,(30,388,140,496),True,1),
    'tumulo': crop(props_board,(350,389,439,496),True,1),
    'carteira_escola': crop(tiles_b,(213,305,314,409),False,1),
    'banco_praca': crop(props_board,(1119,148,1270,248),True,1),
    'poste_luz': crop(props_board,(378,149,485,265),True,1),
    'lixeira': crop(props_board,(734,152,826,248),True,1),
    'porta_madeira': crop(props_board,(724,389,807,497),True,1),
    'barricada': crop(props_board,(1050,390,1158,498),True,1),
    'guarda_sol': crop(props_board,(757,916,860,1020),True,1),
    'maquina_lab': crop(props_board,(746,651,833,757),True,1),
    'caixa_madeira': crop(props_board,(877,390,967,497),True,1),
    'hidrante': crop(props_board,(888,152,971,249),True,1),
    'escada_rolante': crop(tiles_b,(200,694,336,900),False,1),
    'bandeirinhas': crop(tiles_c,(59,520,360,610),False,1),
    'muro_grafite': crop(tiles_a,(155,158,388,258),False,1),
}
prop_order = list(props_map.keys())
prop_atlas = Image.new('RGBA',(8*48,3*48),(0,0,0,0))
for idx,key in enumerate(prop_order):
    cell = fit(props_map[key], (48,48), 1)
    prop_atlas.alpha_composite(cell, ((idx%8)*48, (idx//8)*48))
prop_atlas.save(IMG/'props'/'props_brasil.png')

# --- Tiles atlas (32x32) ---
# 33 tiles in order from data.js
# sample crops from tiles boards, approximate. Use previews with consistent theme.
tiles_order = [
 'urbano_floor','urbano_wall','urbano_decor','feira_floor','feira_wall','feira_decor','escola_floor','escola_wall','escola_decor',
 'cemiterio_floor','cemiterio_wall','cemiterio_decor','favela_floor','favela_wall','favela_decor','praia_floor','praia_wall','praia_decor',
 'metro_floor','metro_wall','metro_decor','lab_floor','lab_wall','lab_decor','junina_floor','junina_wall','junina_decor','shopping_floor','shopping_wall','shopping_decor','slime','fire_floor','dark_void'
]
# helper to crop exact tile cells from sheets
T = {}
# Rua do bairro
T['urbano_floor'] = tiles_a.crop((37,108,77,148))
T['urbano_wall'] = tiles_a.crop((177,108,285,149))
T['urbano_decor'] = tiles_a.crop((220,366,255,401))
# feira
T['feira_floor'] = tiles_a.crop((764,109,804,149))
T['feira_wall'] = tiles_a.crop((850,108,993,151))
T['feira_decor'] = tiles_a.crop((794,369,847,408))
# escola
T['escola_floor'] = tiles_b.crop((46,111,86,151))
T['escola_wall'] = tiles_b.crop((171,107,319,153))
T['escola_decor'] = tiles_b.crop((192,365,224,399))
# cemitério
T['cemiterio_floor'] = tiles_b.crop((776,110,816,150))
T['cemiterio_wall'] = tiles_b.crop((892,109,1027,154))
T['cemiterio_decor'] = tiles_b.crop((855,366,908,417))
# favela/comunidade
T['favela_floor'] = tiles_b.crop((779,651,819,691))
T['favela_wall'] = tiles_b.crop((891,650,1030,698))
T['favela_decor'] = tiles_b.crop((834,907,880,952))
# praia
T['praia_floor'] = tiles_c.crop((764,109,804,149))
T['praia_wall'] = tiles_c.crop((852,108,994,153))
T['praia_decor'] = tiles_c.crop((783,364,846,408))
# metro
T['metro_floor'] = tiles_c.crop((43,109,83,149))
T['metro_wall'] = tiles_c.crop((45,154,179,198))
T['metro_decor'] = tiles_c.crop((46,367,78,404))
# lab
T['lab_floor'] = tiles_c.crop((779,608,819,648))
T['lab_wall'] = tiles_c.crop((850,608,999,653))
T['lab_decor'] = tiles_c.crop((806,865,846,906))
# junina
T['junina_floor'] = tiles_c.crop((47,609,87,649))
T['junina_wall'] = tiles_c.crop((165,608,314,652))
T['junina_decor'] = tiles_c.crop((42,867,81,909))
# shopping
T['shopping_floor'] = tiles_b.crop((42,651,82,691))
T['shopping_wall'] = tiles_b.crop((170,649,317,696))
T['shopping_decor'] = tiles_b.crop((184,907,224,946))
# special
T['slime'] = enemy_board.crop((52,933,117,999))
T['fire_floor'] = ui_board.crop((263,907,325,980))
# dark void hand-made
void_tile = Image.new('RGBA',(32,32),(10,12,20,255))
d = ImageDraw.Draw(void_tile)
for i in range(0,32,4):
    d.line((i,0,31,i), fill=(16,18,28,255), width=1)
T['dark_void'] = void_tile

tile_atlas = Image.new('RGBA',(8*32,5*32),(0,0,0,0))
for idx,name in enumerate(tiles_order):
    tile = T[name] if name in T else Image.new('RGBA',(32,32),(255,0,255,255))
    if tile.size != (32,32):
        tile = fit(tile, (32,32), 0)
    tile_atlas.alpha_composite(tile, ((idx%8)*32, (idx//8)*32))
tile_atlas.save(IMG/'tilesets'/'tiles_brasil.png')

# --- Items atlas ---
items = ['agua_turbinada','chinelo_explosivo','rojao_junino','spray_fogo','guarana_explosivo','estilingue','panela_bomba','aspirador_paranormal','coxinha','caldo_cana','kit_cura','amuleto']
icon_colors = {'agua_turbinada':(70,180,255),'chinelo_explosivo':(255,120,70),'rojao_junino':(255,185,60),'spray_fogo':(255,90,60),'guarana_explosivo':(190,70,70),'estilingue':(115,85,50),'panela_bomba':(120,120,135),'aspirador_paranormal':(90,130,215),'coxinha':(230,170,80),'caldo_cana':(180,240,150),'kit_cura':(220,65,85),'amuleto':(170,120,230)}
item_atlas = Image.new('RGBA',(8*32,2*32),(0,0,0,0))
for idx,name in enumerate(items):
    icon = Image.new('RGBA',(32,32),(0,0,0,0))
    d = ImageDraw.Draw(icon)
    d.rounded_rectangle([2,2,29,29], radius=5, fill=(18,22,36,255), outline=(240,197,78,255), width=2)
    c = icon_colors[name]
    if name=='agua_turbinada':
        d.rectangle([13,6,19,22], fill=c, outline='black'); d.polygon([(16,4),(19,10),(13,10)], fill=(230,240,255))
    elif name=='chinelo_explosivo':
        d.ellipse([7,12,24,23], fill=c, outline='black'); d.line((12,12,16,7,20,12), fill=(255,250,200), width=2)
    elif name=='rojao_junino':
        d.rectangle([12,8,19,23], fill=c, outline='black'); d.line((18,7,25,3), fill=(255,250,200), width=2)
    elif name=='spray_fogo':
        d.rectangle([11,8,21,23], fill=c, outline='black'); d.polygon([(21,13),(27,10),(27,16)], fill=(255,210,80))
    elif name=='guarana_explosivo':
        d.ellipse([9,7,22,24], fill=c, outline='black'); d.rectangle([13,4,18,8], fill=(200,220,225))
    elif name=='estilingue':
        d.arc([8,9,23,24], start=200, end=340, fill=c, width=3); d.line((16,14,16,24), fill=(245,240,230), width=2)
    elif name=='panela_bomba':
        d.ellipse([7,10,24,23], fill=c, outline='black'); d.rectangle([12,6,19,11], fill=(80,80,90)); d.line((19,6,25,2), fill=(255,220,180), width=2)
    elif name=='aspirador_paranormal':
        d.rectangle([8,10,22,20], fill=c, outline='black'); d.line((22,13,27,8), fill=(190,220,255), width=2); d.arc([6,18,14,27], 0, 180, fill=c, width=2)
    elif name=='coxinha':
        d.polygon([(16,6),(25,22),(16,27),(7,22)], fill=c, outline='black')
    elif name=='caldo_cana':
        d.rectangle([11,7,21,24], fill=c, outline='black'); d.line((18,6,24,2), fill=(245,245,255), width=2)
    elif name=='kit_cura':
        d.rounded_rectangle([7,7,24,24], radius=3, fill=(240,240,245), outline='black'); d.rectangle([14,9,17,22], fill=c); d.rectangle([9,14,22,17], fill=c)
    elif name=='amuleto':
        d.ellipse([9,7,23,21], fill=c, outline='black'); d.polygon([(16,20),(20,27),(12,27)], fill=(255,230,150), outline='black')
    item_atlas.alpha_composite(icon, ((idx%8)*32, (idx//8)*32))
item_atlas.save(IMG/'items'/'items_brasil.png')

# --- Effects atlas from UI board ---
# Create 7 rows, 8 cols, 48x48 cells
# Source groups in lower VFX section: projectiles, explosion, fire, smoke, brilho, veneno, impacto, rescue/achievement
fx_atlas = Image.new('RGBA',(8*48,7*48),(0,0,0,0))
# boxes for groups
# Approximate group x ranges on ui_board bottom section
boxes = {
    'projectiles': (22, 826, 171, 1070),
    'explosion': (176, 826, 333, 1070),
    'fire': (336, 826, 492, 1070),
    'smoke': (499, 826, 645, 1070),
    'spark': (655, 826, 804, 1070),
    'poison': (811, 826, 962, 1070),
    'impact': (970, 826, 1117, 1070),
    'rescue': (1125, 826, 1269, 1070),
    'achievement': (1278, 826, 1431, 1070),
}
# split groups into a 2x4 grid or 4x2 depending. We'll sample by grid.
def group_frames(box):
    x0,y0,x1,y1=box
    w=(x1-x0)//2; h=(y1-y0)//4
    frames=[]
    for r in range(4):
        for c in range(2):
            frames.append(crop(ui_board,(x0+c*w,y0+r*h,x0+(c+1)*w,y0+(r+1)*h),False,1))
    return frames[:8]
rows = {
    0: group_frames(boxes['explosion']),
    1: group_frames(boxes['smoke']),
    2: group_frames(boxes['fire']),
    3: group_frames(boxes['projectiles']),
    4: group_frames(boxes['poison']),
    5: group_frames(boxes['spark']),
    6: group_frames(boxes['rescue']),
}
for row,frames in rows.items():
    for i,fr in enumerate(frames):
        fx_atlas.alpha_composite(fit(fr,(48,48),0), (i*48,row*48))
fx_atlas.save(IMG/'effects'/'effects_brasil.png')

# --- UI screens ---
uidir = IMG/'ui'
uidir.mkdir(parents=True, exist_ok=True)
# logo
crop(ui_board,(19,74,323,212),False,1).resize((620,205), Image.Resampling.LANCZOS).save(uidir/'logo.png')
# backdrop from title panel + city skyline full board composite
menu_bg = ui_board.resize((960,720), Image.Resampling.LANCZOS).crop((0,60,960,600))
# overlay to darken
ov = Image.new('RGBA', menu_bg.size, (8,10,16,95))
menu_bg = Image.alpha_composite(menu_bg.convert('RGBA'), ov)
menu_bg.save(uidir/'menu_bg.png')
# direct crops for loading/victory/gameover/studio and intro cards
# loading will use composite based on logo over dark background
loading = Image.new('RGBA',(960,540),(8,10,16,255))
loading.alpha_composite(menu_bg.resize((960,540)), (0,0))
ld = ImageDraw.Draw(loading)
ld.rounded_rectangle([150,120,810,400], radius=18, fill=(10,12,20,220), outline=(240,197,78,255), width=4)
loading.alpha_composite(crop(ui_board,(19,74,323,212),False,1).resize((420,140), Image.Resampling.LANCZOS), (270,145))
ld.text((390,315), 'CARREGANDO', font=font_big, fill=(245,244,255,255))
loading.save(uidir/'loading.png')
# game over/victory from ui board cards
crop(ui_board,(18,545,352,781),False,1).resize((960,540), Image.Resampling.LANCZOS).save(uidir/'gameover.png')
crop(ui_board,(361,544,698,781),False,1).resize((960,540), Image.Resampling.LANCZOS).save(uidir/'victory.png')
# extra assets for intro/studio
crop(ui_board,(705,546,1035,782),False,1).resize((960,540), Image.Resampling.LANCZOS).save(uidir/'studio.png')
crop(ui_board,(1041,546,1155,782),False,1).resize((300,540), Image.Resampling.LANCZOS).save(uidir/'intro1.png')
crop(ui_board,(1160,546,1280,782),False,1).resize((300,540), Image.Resampling.LANCZOS).save(uidir/'intro2.png')
crop(ui_board,(1286,546,1427,782),False,1).resize((300,540), Image.Resampling.LANCZOS).save(uidir/'intro3.png')

# --- font installation into project ---
shutil.copy(font_path, FONTDIR/'ZnqArcade.ttf')
# patch index.html with @font-face and font family
idx = BASE/'index.html'
html = idx.read_text(encoding='utf-8')
if "ZnqArcade" not in html:
    html = html.replace('<style>', "<style>\n    @font-face { font-family: 'ZnqArcade'; src: url('assets/fonts/ZnqArcade.ttf') format('truetype'); font-display: swap; }")
html = html.replace('font-family: monospace;', "font-family: 'ZnqArcade', monospace;")
html = html.replace("font:12px monospace;", "font:12px 'ZnqArcade', monospace;")
idx.write_text(html, encoding='utf-8')
# patch main.js font family and loader for new ui assets
main = BASE/'src/main.js'
text = main.read_text(encoding='utf-8')
text = text.replace("monospace", "'ZnqArcade', monospace")
if "ui/studio" not in text:
    text = text.replace("L.addImage('ui/gameover','assets/images/ui/gameover.png');", "L.addImage('ui/gameover','assets/images/ui/gameover.png'); L.addImage('ui/studio','assets/images/ui/studio.png'); L.addImage('ui/intro1','assets/images/ui/intro1.png'); L.addImage('ui/intro2','assets/images/ui/intro2.png'); L.addImage('ui/intro3','assets/images/ui/intro3.png');")
# replace drawStudio and drawOpeningIntro bodies conservatively with regex
text = re.sub(r"drawStudio\(\)\{[^\}]*?\}\n", "drawStudio(){ const c=this.ctx; c.fillStyle='#05060b'; c.fillRect(0,0,GAME_W,GAME_H); const img=this.loader.images['ui/studio']; if(img){ c.drawImage(img,0,0,GAME_W,GAME_H); } else { c.fillStyle='#05060b'; c.fillRect(0,0,GAME_W,GAME_H); } const fadeOut=Math.max(0,1-Math.max(0,this.brandTimer-2.3)/0.6); c.fillStyle=`rgba(0,0,0,${1-fadeOut})`; c.fillRect(0,0,GAME_W,GAME_H); }\n", text)
text = re.sub(r"drawOpeningIntro\(\)\{[^\}]*?\}\n", "drawOpeningIntro(){ const c=this.ctx; c.fillStyle='#05060b'; c.fillRect(0,0,GAME_W,GAME_H); const imgs=[this.loader.images['ui/intro1'],this.loader.images['ui/intro2'],this.loader.images['ui/intro3']]; const img=imgs[this.introStep]; if(img){ c.drawImage(img,0,0,GAME_W,GAME_H); } else { this.drawTitleSky(); } c.fillStyle='rgba(5,6,11,.45)'; c.fillRect(0,0,GAME_W,GAME_H); const cards=this.trList('introCards'); const msg=cards[this.introStep]||''; const fade=Math.min(1,this.introTimer/0.55)*Math.min(1,Math.max(0,3.2-this.introTimer)/0.55); c.save(); c.globalAlpha=fade; c.fillStyle='rgba(10,10,18,.76)'; c.fillRect(60,340,840,140); c.strokeStyle='#f5d85a'; c.lineWidth=4; c.strokeRect(60,340,840,140); c.textAlign='center'; c.font='18px ZnqArcade, monospace'; c.fillStyle='#f8f3e8'; const lines=getWrappedLines(c,msg,760); let y=386-(lines.length-1)*10; for(const line of lines){ c.fillText(line,480,y); y+=24; } c.font='13px ZnqArcade, monospace'; c.fillStyle='#a8ffc4'; if(Math.floor(this.time*2)%2===0) c.fillText(this.tr('splashPress'),480,454); c.restore(); }\n", text)
main.write_text(text, encoding='utf-8')

# Update README and add notes
readme = BASE/'README.md'
r = readme.read_text(encoding='utf-8')
if 'V14' not in r:
    r += "\n\n## V14 — Full Art Swap\n\n- Substituição completa da direção visual com base no pacote `assets(2).zip`.\n- Novos protagonistas Felipe e Nika em estilo 16-bit mais coeso.\n- Novos portraits, NPCs, inimigos e chefes.\n- Props, tilesets, itens, efeitos e UI renovados.\n- Fonte do projeto atualizada para `ZnqArcade`.\n- Splash da desenvolvedora e cards de intro integrados às telas de abertura.\n"
readme.write_text(r, encoding='utf-8')
(BASE/'VERSAO_V14_FULL_ART_SWAP.txt').write_text('V14 - Full Art Swap aplicado com base em assets(2).zip\n', encoding='utf-8')

print('Full art swap applied')
