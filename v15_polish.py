from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
from pathlib import Path
import re, zipfile, os

BASE = Path('/mnt/data/work/project/zumbis_na_quebrada')
ASSET_DIR = Path('/mnt/data/work/assets2/Nova pasta')
IMG = BASE/'assets/images'
UI = IMG/'ui'

# Boards from asset pack
hero_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_28 (1).png').convert('RGBA')
tiles_a = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (5).png').convert('RGBA')
ui_board = Image.open(ASSET_DIR/'ChatGPT Image 11 de jun. de 2026, 16_52_57 (9).png').convert('RGBA')

font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
font_big = ImageFont.truetype(font_path, 58)
font_med = ImageFont.truetype(font_path, 26)
font_small = ImageFont.truetype(font_path, 16)

# ---- Better clean title/menu background, not sheet-like ----
# Use urban preview from the tiles reference as a scenic 16-bit background.
scene = tiles_a.crop((407, 100, 704, 490)).resize((960, 540), Image.Resampling.LANCZOS)
scene = ImageEnhance.Contrast(scene).enhance(1.08)
scene = ImageEnhance.Color(scene).enhance(0.95)
# dark overlay + vignette for readability
bg = scene.convert('RGBA')
shade = Image.new('RGBA', bg.size, (7, 9, 16, 92))
bg = Image.alpha_composite(bg, shade)
# top/bottom gradients
v = Image.new('RGBA', bg.size, (0,0,0,0))
vd = ImageDraw.Draw(v)
for y in range(540):
    edge = max(0, int(130 * (abs(y-270)/270)**1.8))
    vd.line([(0,y),(960,y)], fill=(0,0,0,edge))
bg = Image.alpha_composite(bg, v)
# subtle city silhouette based on asset palette
bd = ImageDraw.Draw(bg)
for i,(x,w,h) in enumerate([(0,70,120),(65,85,150),(145,58,112),(210,110,170),(330,90,140),(430,108,185),(535,75,125),(620,120,165),(730,95,155),(825,120,180),(920,70,135)]):
    y = 540-h
    bd.rectangle([x,y,x+w,540], fill=(11,15,26,210))
    for wy in range(y+14, 520, 18):
        for wx in range(x+10, x+w-8, 18):
            on = ((wx+wy+i*7)//13) % 3 != 0
            bd.rectangle([wx, wy, wx+5, wy+7], fill=(240,191,82,120 if on else 25))
bg.save(UI/'menu_bg.png')

# ---- Clean logo/title pieces ----
# Logo from source pack, sharpened and transparent-ish as provided.
def crop_raw(im, box):
    return im.crop(box).convert('RGBA')
logo = crop_raw(ui_board, (18, 72, 326, 214))
logo = logo.resize((650, 220), Image.Resampling.LANCZOS)
logo.save(UI/'logo.png')

# New loading/victory/gameover panels in same art direction, less busy than full sheet crops.
def make_panel(filename, title, subtitle, accent=(245,197,78)):
    im = bg.copy().filter(ImageFilter.GaussianBlur(0.5))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([100,120,860,415], radius=18, fill=(10,13,22,230), outline=accent+(255,), width=4)
    d.rounded_rectangle([135,150,825,385], radius=12, fill=(18,21,34,210), outline=(63,68,88,255), width=2)
    # small logo
    lg = Image.open(UI/'logo.png').convert('RGBA')
    lg.thumbnail((390,135), Image.Resampling.LANCZOS)
    im.alpha_composite(lg, ((960-lg.width)//2, 155))
    tw = d.textlength(title, font=font_med)
    d.text(((960-tw)//2, 296), title, font=font_med, fill=accent+(255,))
    tw2 = d.textlength(subtitle, font=font_small)
    d.text(((960-tw2)//2, 335), subtitle, font=font_small, fill=(232,246,255,255))
    im.save(UI/filename)

make_panel('loading.png', 'CARREGANDO', 'preparando a quebrada...', (245,197,78))
make_panel('victory.png', 'QUEBRADA SALVA!', 'os verdadeiros heróis mandaram bem', (144,225,88))
make_panel('gameover.png', 'FIM DE JOGO', 'a quebrada ainda precisa de você', (235,75,64))

# Studio and intro cards: crop from UI pack but format as clean full-screen cards.
studio_crop = ui_board.crop((705, 546, 1035, 782)).resize((760, 430), Image.Resampling.LANCZOS)
studio = Image.new('RGBA', (960,540), (6,8,15,255))
studio.alpha_composite(bg.filter(ImageFilter.GaussianBlur(1)), (0,0))
studio.alpha_composite(Image.new('RGBA',(960,540),(0,0,0,150)), (0,0))
studio.alpha_composite(studio_crop, (100,55))
studio.save(UI/'studio.png')
for i,box in enumerate([(1041,546,1155,782),(1160,546,1280,782),(1286,546,1427,782)], start=1):
    card = ui_board.crop(box).resize((360,540), Image.Resampling.LANCZOS)
    out = bg.copy()
    out.alpha_composite(Image.new('RGBA',(960,540),(0,0,0,125)), (0,0))
    out.alpha_composite(card, (300,0))
    out.save(UI/f'intro{i}.png')

# ---- Sprite sheet border cleanup ----
def cleanup_sheet(path, frame):
    im = Image.open(path).convert('RGBA')
    px = im.load()
    w,h = im.size
    # cell-edge cleanup removes source grid lines that were part of reference sheets.
    for cy in range(0,h,frame):
        for cx in range(0,w,frame):
            for yy in range(cy, min(cy+frame,h)):
                for xx in range(cx, min(cx+frame,w)):
                    r,g,b,a = px[xx,yy]
                    if a == 0:
                        continue
                    lx,ly = xx-cx, yy-cy
                    mx,mn = max(r,g,b), min(r,g,b)
                    sat = mx-mn
                    mean=(r+g+b)//3
                    # Remove frame borders, light checker leftovers, blue grid remains and neutral guide lines.
                    if lx<2 or ly<2 or lx>=frame-2 or ly>=frame-2:
                        px[xx,yy]=(r,g,b,0); continue
                    if (sat < 24 and mean > 145) or (b > r+25 and b > g+10 and 50 < b < 180 and g > 30):
                        px[xx,yy]=(r,g,b,0); continue
    im.save(path)

for p in (IMG/'sprites/protagonists').glob('*.png'):
    cleanup_sheet(p,56)
for p in (IMG/'sprites/npcs').glob('*.png'):
    cleanup_sheet(p,48)
for p in (IMG/'sprites/enemies').glob('*.png'):
    cleanup_sheet(p,48)
for p in (IMG/'sprites/bosses').glob('*.png'):
    cleanup_sheet(p,96)

# ---- Main.js visual polishing ----
main = BASE/'src/main.js'
text = main.read_text(encoding='utf-8')
# Ensure font loading/UI assets still there.
text = text.replace("['menu_bg','logo','loading','victory','gameover'].forEach", "['menu_bg','logo','loading','victory','gameover','studio','intro1','intro2','intro3'].forEach")
# Clean malformed leftover duplicates if any.
text = re.sub(r"font='([^']*?) 'ZnqArcade', 'ZnqArcade', monospace'", r"font='\1 ZnqArcade, monospace'", text)
# Remove extra skyline overlay on title/splash; the new bg is already scenic.
text = text.replace("c.drawImage(this.loader.images['ui/menu_bg'],0,0); this.drawTitleSky(); c.fillStyle='rgba(10,8,18,.34)'", "c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(10,8,18,.20)'")
text = text.replace("c.drawImage(this.loader.images['ui/menu_bg'],0,0); this.drawTitleSky(); c.fillStyle='rgba(10,8,18,.30)'", "c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(10,8,18,.18)'")
# Better title layout: larger logo, cleaner menu panel.
old_menu = r"drawMenu\(\)\{ const c=this.ctx; c.drawImage\(this.loader.images\['ui/menu_bg'\],0,0\); c.fillStyle='rgba\(10,8,18,.18\)'; c.fillRect\(0,0,GAME_W,GAME_H\); c.drawImage\(this.loader.images\['ui/logo'\],180,28,600,170\); const items=this.menuItems\(\); c.textAlign='center'; c.font='25px ZnqArcade, monospace'; for\(let i=0;i<items.length;i\+\+\)\{ const y=235\+i\*44; c.fillStyle=i===this.menuIndex\?'#fff08a':'#e8f6ff'; c.strokeStyle='#241a26'; c.lineWidth=6; c.strokeText\(items\[i\],480,y\); c.fillText\(items\[i\],480,y\); \} c.font='16px ZnqArcade, monospace'; c.fillStyle='#d4ffe2'; c.fillText\('2026 Felipe',480,510\); \}"
new_menu = "drawMenu(){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(5,7,12,.28)'; c.fillRect(0,0,GAME_W,GAME_H); const logo=this.loader.images['ui/logo']; c.drawImage(logo,155,24,650,220); const items=this.menuItems(); c.fillStyle='rgba(10,13,22,.82)'; c.fillRect(300,218,360,245); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(300,218,360,245); c.textAlign='center'; c.font='24px ZnqArcade, monospace'; for(let i=0;i<items.length;i++){ const y=258+i*34; c.fillStyle=i===this.menuIndex?'rgba(245,216,90,.24)':'rgba(0,0,0,0)'; if(i===this.menuIndex)c.fillRect(322,y-24,316,30); c.fillStyle=i===this.menuIndex?'#fff08a':'#e8f6ff'; c.fillText(items[i],480,y); } c.font='15px ZnqArcade, monospace'; c.fillStyle='#d4ffe2'; c.fillText('2026 Felipe',480,506); }"
text = re.sub(old_menu, new_menu, text)
# Improve menu hit areas for new layout.
text = re.sub(r"menuHit\(items\)\{[^\}]*return -1; \}", "menuHit(items){ const mx=this.input.mouse.x, my=this.input.mouse.y; for(let i=0;i<items.length;i++){ const y=258+i*34; if(mx>320&&mx<640&&my>y-25&&my<y+10) return i; } return -1; }", text)
# Cleaner splash layout.
old_splash = r"drawSplash\(\)\{ const c=this.ctx; c.drawImage\(this.loader.images\['ui/menu_bg'\],0,0\); c.fillStyle='rgba\(10,8,18,.20\)'; c.fillRect\(0,0,GAME_W,GAME_H\); const logo=this.loader.images\['ui/logo'\]; const pulse=1\+Math.sin\(this.time\*2\)\*0.03; const lw=640\*pulse, lh=180\*pulse; c.drawImage\(logo,480-lw/2,44\+Math.sin\(this.time\*2.5\)\*5,lw,lh\); const p1=this.loader.images\['portrait/leo_mandacaru'\]; const p2=this.loader.images\['portrait/bia_faisca'\]; const bob=Math.sin\(this.time\*3\)\*5; c.drawImage\(p1,116,224\+bob,176,176\); c.drawImage\(p2,668,224-bob,176,176\); c.fillStyle='rgba\(20,15,30,.86\)'; c.fillRect\(120,388,720,104\); c.strokeStyle='#f5d85a'; c.lineWidth=4; c.strokeRect\(120,388,720,104\); c.textAlign='center'; c.font='22px ZnqArcade, monospace'; c.fillStyle='#fff08a'; c.fillText\(this.tr\('splashHeadline'\),480,420\); c.font='16px ZnqArcade, monospace'; c.fillStyle='#e8f6ff'; const introLines=getWrappedLines\(c,this.tr\('splashSubline'\),600\); let iy=446; for\(const line of introLines.slice\(0,3\)\)\{ c.fillText\(line,480,iy\); iy\+=18; \} if\(Math.floor\(this.time\*2\)%2===0\)\{ c.fillStyle='#a8ffc4'; c.font='17px ZnqArcade, monospace'; c.fillText\(this.tr\('splashPress'\),480,486\); \} \}"
new_splash = "drawSplash(){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(5,7,12,.24)'; c.fillRect(0,0,GAME_W,GAME_H); const logo=this.loader.images['ui/logo']; const pulse=1+Math.sin(this.time*2)*0.02; const lw=660*pulse, lh=224*pulse; c.drawImage(logo,480-lw/2,32+Math.sin(this.time*2.5)*4,lw,lh); const p1=this.loader.images['portrait/leo_mandacaru']; const p2=this.loader.images['portrait/bia_faisca']; const bob=Math.sin(this.time*3)*4; c.drawImage(p1,92,238+bob,154,154); c.drawImage(p2,714,238-bob,154,154); c.fillStyle='rgba(10,13,22,.86)'; c.fillRect(135,385,690,104); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(135,385,690,104); c.textAlign='center'; c.font='21px ZnqArcade, monospace'; c.fillStyle='#fff08a'; c.fillText(this.tr('splashHeadline'),480,418); c.font='15px ZnqArcade, monospace'; c.fillStyle='#e8f6ff'; const introLines=getWrappedLines(c,this.tr('splashSubline'),610); let iy=444; for(const line of introLines.slice(0,2)){ c.fillText(line,480,iy); iy+=18; } if(Math.floor(this.time*2)%2===0){ c.fillStyle='#a8ffc4'; c.font='16px ZnqArcade, monospace'; c.fillText(this.tr('splashPress'),480,482); } }"
text = re.sub(old_splash, new_splash, text)
# Better generic backdrops with darker panel.
text = re.sub(r"drawMenuBackdrop\(title\)\{[^\n]*?\}\n", "drawMenuBackdrop(title){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(8,10,18,.84)'; c.fillRect(72,60,816,420); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(72,60,816,420); c.textAlign='center'; c.font='32px ZnqArcade, monospace'; c.fillStyle='#fff08a'; const lines=getWrappedLines(c,title,700); let y=116; for(const line of lines.slice(0,2)){ c.fillText(line,480,y); y+=34; } }\n", text)
# Fix pause labels to use v9 options not stale resume/titleScreen.
text = text.replace("const items=[this.tr('resume'), this.tr('titleScreen')];", "const items=[this.tr('continue'), this.tr('returnTitle')];")
main = BASE/'src/main.js'
main.write_text(text, encoding='utf-8')

# Notes
(BASE/'VERSAO_V15_POLISH.txt').write_text('V15 - UI limpa, menu menos carregado, background novo, spritesheets com limpeza de bordas e fonte arcade integrada.\n', encoding='utf-8')
readme = BASE/'README.md'
r = readme.read_text(encoding='utf-8')
if 'V15 — Polimento visual' not in r:
    r += '\n\n## V15 — Polimento visual\n\n- Menu/título refeitos para não parecer uma folha de assets.\n- Novo background 16-bit limpo usando os cenários de referência.\n- Fonte arcade integrada no projeto.\n- Spritesheets passam por limpeza de bordas e sobras de grid.\n- UI de abertura, loading e painéis finais mais coesos com o pacote novo.\n'
readme.write_text(r, encoding='utf-8')
print('V15 polish applied')
