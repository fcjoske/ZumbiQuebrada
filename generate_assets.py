from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, random, wave, struct
import numpy as np

ROOT = Path(__file__).parent
IMG = ROOT / 'assets' / 'images'
AUD = ROOT / 'assets' / 'audio'
for p in [IMG/'sprites/protagonists', IMG/'sprites/enemies', IMG/'sprites/npcs', IMG/'sprites/bosses', IMG/'tilesets', IMG/'props', IMG/'items', IMG/'effects', IMG/'portraits', IMG/'ui', AUD/'music', AUD/'sfx']:
    p.mkdir(parents=True, exist_ok=True)

random.seed(133187)
ANIMS = [('idle',4), ('walk',6), ('attack',4), ('hit',3), ('death',6)]
DIRS = ['S','SE','E','NE','N','NW','W','SW']
DV = {'S':(0,1),'SE':(1,1),'E':(1,0),'NE':(1,-1),'N':(0,-1),'NW':(-1,-1),'W':(-1,0),'SW':(-1,1)}

def darken(rgb, f=.55):
    return tuple(max(0,min(255,int(c*f))) for c in rgb)

def lighten(rgb, f=1.25):
    return tuple(max(0,min(255,int(c*f))) for c in rgb)

def transparent(size):
    return Image.new('RGBA', size, (0,0,0,0))

def scale2(img, size):
    return img.resize(size, Image.Resampling.NEAREST)

def px(draw, x,y,w,h, fill):
    draw.rectangle([int(x),int(y),int(x+w-1),int(y+h-1)], fill=fill)

def ellipse(draw, box, fill, outline=None):
    draw.ellipse([int(v) for v in box], fill=fill, outline=outline)

def poly(draw, pts, fill, outline=None):
    draw.polygon([(int(x),int(y)) for x,y in pts], fill=fill, outline=outline)

def draw_humanoid_low(pal, anim, f, direction, kind='hero', accessory=None, variant=0, frame=24):
    im = transparent((frame,frame)); d = ImageDraw.Draw(im)
    cx, cy = frame//2, int(frame*0.56)
    dx, dy = DV[direction]
    hero = kind == 'hero'
    # death: lying body but keep transparent background
    if anim=='death':
        t = min(1, f/5)
        y = int(frame*0.62 + t*2)
        d.ellipse([frame*0.20, frame*0.72, frame*0.80, frame*0.9], fill=(0,0,0,80))
        d.rectangle([frame*0.24, y-4, frame*0.72, y+4], fill=darken(pal['clothes'],.45), outline=pal['outline'])
        d.ellipse([frame*0.60, y-6, frame*0.86, y+5], fill=pal['skin'], outline=pal['outline'])
        d.rectangle([frame*0.30, y+3, frame*0.62, y+6], fill=pal['pants'], outline=pal['outline'])
        return im
    bob = 0
    step = 0
    arm_swing = 0
    torso_tilt = 0
    if anim=='idle':
        bob = [-1,0,0,0][f%4] if hero else 0
        arm_swing = [0,1,0,-1][f%4] if hero else 0
    if anim=='walk':
        bob = [-2,0,-3,0,-2,0][f%6] if hero else (-1 if f%3==1 else 0)
        step = [-4,-2,2,4,2,-2][f%6] if hero else [-2,0,2,0,-2,0][f%6]
        arm_swing = [4,2,-2,-4,-2,2][f%6] if hero else step
        torso_tilt = [-1,0,1,2,1,0][f%6] if hero else 0
    if anim=='hit':
        cx += 1 if f%2 else -1
        bob = -1
    if anim=='attack':
        bob = -2 if hero else 0
        arm_swing = 3
        torso_tilt = 1 if dx>=0 else -1
    # shadow
    d.ellipse([cx-7, cy+5, cx+7, cy+9], fill=(0,0,0,75))
    # legs
    pant = pal['pants']; outline = pal['outline']
    leg_y = cy+2+bob
    if abs(dx)>0:
        px(d, cx-4, leg_y-step//3, 4, 6, outline); px(d, cx+1, leg_y+1+step//4, 4, 5, outline)
        px(d, cx-3, leg_y-step//3, 2, 5, pant); px(d, cx+2, leg_y+1+step//4, 2, 4, pant)
    else:
        px(d, cx-5, leg_y+step//2, 4, 6, outline); px(d, cx+1, leg_y-step//2, 4, 6, outline)
        px(d, cx-4, leg_y+step//2, 2, 5, pant); px(d, cx+2, leg_y-step//2, 2, 5, pant)
    # body torso
    torso = [(cx-6,cy-7+bob),(cx+6,cy-7+bob),(cx+5,cy+4+bob),(cx-5,cy+4+bob)]
    poly(d, [(x+torso_tilt if i<2 else x,y) for i,(x,y) in enumerate(torso)], pal['clothes'], outline)
    d.line([cx-4,cy-5+bob,cx+4,cy-5+bob], fill=lighten(pal['clothes'],1.35))
    if hero:
        d.line([cx-3,cy-1+bob,cx+3,cy-1+bob], fill=lighten(pal['clothes'],1.18))
        d.rectangle([cx-2,cy+2+bob,cx+2,cy+3+bob], fill=lighten(pal.get('sleeve', pal['clothes']),1.12))
        d.point((cx-2,cy-4+bob), fill=lighten(pal['clothes'],1.3))
        d.point((cx+2,cy-4+bob), fill=lighten(pal['clothes'],1.3))
    # arms
    arm = pal.get('sleeve', pal['clothes'])
    if anim=='attack':
        ex = cx + dx*10; ey = cy-3 + dy*9
        off = -3 if hero else 0
        d.line([cx+dx*3, cy-3+bob, ex, ey], fill=outline, width=4)
        d.line([cx+dx*3, cy-3+bob, ex, ey], fill=arm, width=2)
        d.line([cx-dx*2, cy-3+bob, cx-dx*7, cy+1+bob+off], fill=outline, width=3)
        d.line([cx-dx*2, cy-3+bob, cx-dx*7, cy+1+bob+off], fill=arm, width=1)
        ellipse(d, [ex-2,ey-2,ex+2,ey+2], pal['skin'], outline)
        if hero:
            d.line([ex,ey,ex+dx*4,ey+dy*4], fill=lighten(pal.get('hat', pal['clothes']),1.45), width=2)
            d.point((ex+dx*4,ey+dy*4), fill=(255,240,180))
    else:
        d.line([cx-6,cy-5+bob,cx-8+arm_swing//2,cy+1+bob], fill=outline, width=3)
        d.line([cx+6,cy-5+bob,cx+8-arm_swing//2,cy+1+bob], fill=outline, width=3)
        d.line([cx-6,cy-5+bob,cx-8+arm_swing//2,cy+1+bob], fill=arm, width=1)
        d.line([cx+6,cy-5+bob,cx+8-arm_swing//2,cy+1+bob], fill=arm, width=1)
    # head position based on direction
    hx = cx + int(dx*1.4); hy = cy-12 + bob + int(dy*0.8)
    ellipse(d, [hx-5,hy-5,hx+5,hy+5], pal['skin'], outline)
    # hair/hat
    hair = pal.get('hair', (40,28,22))
    if accessory=='cap':
        d.pieslice([hx-5,hy-7,hx+5,hy+3], 180,360, fill=pal.get('hat',(220,50,40)), outline=outline)
        d.rectangle([hx+dx*2-4,hy-6,hx+dx*2+4,hy-4], fill=pal.get('hat',(220,50,40)))
    elif accessory=='helmet':
        d.pieslice([hx-5,hy-6,hx+5,hy+2], 180,360, fill=pal.get('hat',(80,80,80)), outline=outline)
    elif accessory=='hairbig':
        ellipse(d,[hx-6,hy-7,hx+6,hy+1], hair, outline)
        d.rectangle([hx-6,hy-3,hx+6,hy+0], fill=hair)
        if hero and anim in ('walk','idle'):
            d.point((hx-6,hy+1+f%2), fill=hair)
            d.point((hx+6,hy+1+(f+1)%2), fill=hair)
    else:
        d.pieslice([hx-5,hy-6,hx+5,hy+2], 180,360, fill=hair, outline=outline)
    # face, only not for back dir
    if dy >= 0:
        d.point((hx-2,hy), fill=(10,10,10)); d.point((hx+2,hy), fill=(10,10,10))
        if anim=='hit': d.line([hx-2,hy+3,hx+2,hy+2], fill=(70,25,25))
        elif hero and anim=='attack': d.line([hx-2,hy+3,hx+3,hy+2], fill=(90,45,35))
        else: d.point((hx,hy+3), fill=(90,45,35))
    # accessory/item hints
    if accessory=='bag':
        d.rectangle([cx+4,cy-5+bob,cx+8,cy+2+bob], fill=pal.get('bag',(140,70,35)), outline=outline)
    if accessory=='apron':
        d.rectangle([cx-4,cy-3+bob,cx+4,cy+4+bob], fill=pal.get('apron',(245,245,220)), outline=outline)
    if hero:
        d.point((cx-5,cy+1+bob), fill=lighten(pal['clothes'],1.22))
        d.point((cx+5,cy+1+bob), fill=lighten(pal['clothes'],1.22))
    return im

def make_sheet(name, folder, pal, kind='hero', accessory=None, frame=48):
    low = frame//2
    cols = 6; rows = len(ANIMS)*len(DIRS)
    sheet = transparent((cols*frame, rows*frame))
    for ai,(anim,nf) in enumerate(ANIMS):
        for di,dr in enumerate(DIRS):
            for c in range(cols):
                ff = c % nf
                lim = draw_humanoid_low(pal, anim, ff, dr, kind, accessory, frame=low)
                if kind in ('zombie','enemy'):
                    # undead tint/noise details
                    dd = ImageDraw.Draw(lim)
                    if name.startswith('slime'):
                        lim = draw_slime_low(pal, anim, ff, dr, frame=low)
                    elif name.startswith('cachorro'):
                        lim = draw_dog_low(pal, anim, ff, dr, frame=low)
                    elif name.startswith('rato'):
                        lim = draw_rat_low(pal, anim, ff, dr, frame=low)
                    elif name.startswith('mosquito'):
                        lim = draw_mosquito_low(pal, anim, ff, dr, frame=low)
                    elif name.startswith('planta'):
                        lim = draw_plant_low(pal, anim, ff, dr, frame=low)
                sheet.paste(scale2(lim,(frame,frame)), (c*frame,(ai*len(DIRS)+di)*frame), scale2(lim,(frame,frame)))
    path = folder / f'{name}.png'
    sheet.save(path, optimize=True)
    return path

def draw_slime_low(pal, anim, f, direction, frame=24):
    im=transparent((frame,frame)); d=ImageDraw.Draw(im); cx=frame//2; cy=15
    pulse=[0,1,0,-1,0,1][f%6]
    if anim=='death': pulse=3
    d.ellipse([cx-8-pulse,cy-5,cx+8+pulse,cy+6], fill=darken(pal['clothes'],.55), outline=pal['outline'])
    d.ellipse([cx-7-pulse,cy-7,cx+7+pulse,cy+5], fill=pal['clothes'], outline=pal['outline'])
    d.rectangle([cx-4,cy-2,cx-2,cy], fill=(0,0,0)); d.rectangle([cx+2,cy-2,cx+4,cy], fill=(0,0,0))
    d.arc([cx-3,cy,cx+4,cy+4], 0,180, fill=darken(pal['clothes'],.3))
    d.point((cx-5,cy-5), fill=lighten(pal['clothes'],1.5)); d.point((cx+3,cy-6), fill=lighten(pal['clothes'],1.5))
    return im

def draw_dog_low(pal, anim, f, direction, frame=24):
    im=transparent((frame,frame)); d=ImageDraw.Draw(im); cx=frame//2; cy=14; dx,dy=DV[direction]
    step=(-1 if f%2 else 1) if anim=='walk' else 0
    d.ellipse([cx-8,cy+4,cx+8,cy+8], fill=(0,0,0,70))
    d.rectangle([cx-7,cy-3,cx+5,cy+4], fill=pal['clothes'], outline=pal['outline'])
    hx=cx+dx*5; hy=cy-4+dy*2
    d.ellipse([hx-4,hy-4,hx+5,hy+4], fill=pal['skin'], outline=pal['outline'])
    d.polygon([(hx-2,hy-3),(hx,hy-8),(hx+1,hy-2)], fill=darken(pal['skin'],.6), outline=pal['outline'])
    d.polygon([(hx+3,hy-3),(hx+5,hy-8),(hx+5,hy-2)], fill=darken(pal['skin'],.6), outline=pal['outline'])
    for lx in [-5,-1,3,6]: d.rectangle([cx+lx,cy+3+step,cx+lx+1,cy+8+step], fill=pal['outline'])
    if dy>=0: d.point((hx+2,hy), fill=(0,0,0))
    d.line([cx-8,cy-1,cx-12,cy-4-step], fill=pal['outline'], width=2)
    return im

def draw_rat_low(pal, anim, f, direction, frame=24):
    im=transparent((frame,frame)); d=ImageDraw.Draw(im); cx=frame//2; cy=15; dx,dy=DV[direction]
    wob= f%2 if anim=='walk' else 0
    d.ellipse([cx-8,cy-3,cx+7,cy+5], fill=pal['clothes'], outline=pal['outline'])
    hx=cx+dx*5; hy=cy-2+dy*2
    d.ellipse([hx-4,hy-4,hx+4,hy+3], fill=pal['skin'], outline=pal['outline'])
    d.ellipse([hx-5,hy-6,hx-1,hy-2], fill=lighten(pal['skin'],1.15), outline=pal['outline'])
    d.ellipse([hx+1,hy-6,hx+5,hy-2], fill=lighten(pal['skin'],1.15), outline=pal['outline'])
    d.line([cx-8,cy+1,cx-13,cy+4+wob], fill=pal['tail'], width=1)
    d.point((hx+2,hy), fill=(0,0,0))
    return im

def draw_mosquito_low(pal, anim, f, direction, frame=24):
    im=transparent((frame,frame)); d=ImageDraw.Draw(im); cx=frame//2; cy=12; dx,dy=DV[direction]
    wing_alpha = 90 if f%2 else 150
    d.ellipse([cx-10,cy-8,cx-1,cy], fill=(200,245,255,wing_alpha), outline=(80,130,160,100))
    d.ellipse([cx+1,cy-8,cx+10,cy], fill=(200,245,255,wing_alpha), outline=(80,130,160,100))
    d.ellipse([cx-4,cy-2,cx+4,cy+8], fill=pal['clothes'], outline=pal['outline'])
    d.ellipse([cx-3,cy-6,cx+3,cy-1], fill=pal['skin'], outline=pal['outline'])
    d.line([cx,cy-3,cx+dx*8,cy-3+dy*5], fill=pal['tail'], width=1)
    for off in [-3,0,3]:
        d.line([cx+off,cy+2,cx+off-4,cy+9], fill=pal['outline'])
        d.line([cx+off,cy+2,cx+off+4,cy+9], fill=pal['outline'])
    return im

def draw_plant_low(pal, anim, f, direction, frame=24):
    im=transparent((frame,frame)); d=ImageDraw.Draw(im); cx=frame//2; cy=15; dx,dy=DV[direction]
    sway=math.sin(f*.9)*1.5 if anim in ('walk','attack','idle') else 0
    d.rectangle([cx-2,cy-1,cx+2,cy+8], fill=pal['tail'], outline=pal['outline'])
    d.ellipse([cx-9,cy+3,cx-2,cy+8], fill=darken(pal['tail'],.7), outline=pal['outline'])
    d.ellipse([cx+2,cy+3,cx+9,cy+8], fill=darken(pal['tail'],.7), outline=pal['outline'])
    hx=cx+int(dx*3+sway); hy=cy-6+int(dy*2)
    d.ellipse([hx-8,hy-6,hx+8,hy+6], fill=pal['clothes'], outline=pal['outline'])
    d.polygon([(hx-7,hy),(hx-1,hy-2),(hx-5,hy+4)], fill=(250,250,220), outline=pal['outline'])
    d.polygon([(hx+7,hy),(hx+1,hy-2),(hx+5,hy+4)], fill=(250,250,220), outline=pal['outline'])
    return im

def draw_boss_low(pal, anim, f, direction, name, frame=48):
    im=transparent((frame,frame)); d=ImageDraw.Draw(im); cx=frame//2; cy=frame//2+3; dx,dy=DV[direction]
    wob = 1 if f%2 else -1
    d.ellipse([cx-18,cy+13,cx+18,cy+20], fill=(0,0,0,85))
    if 'caminhao' in name:
        d.rectangle([8,15+wob,40,34+wob], fill=pal['clothes'], outline=pal['outline'])
        d.rectangle([28,9+wob,42,24+wob], fill=lighten(pal['clothes'],1.2), outline=pal['outline'])
        for x in [12,32]: d.ellipse([x,31+wob,x+8,39+wob], fill=(25,25,25), outline=pal['outline'])
        d.rectangle([11,17+wob,18,23+wob], fill=(170,210,230), outline=pal['outline'])
        d.rectangle([29,13+wob,38,19+wob], fill=(160,230,200), outline=pal['outline'])
        d.line([20,17+wob,38,30+wob], fill=(80,20,120), width=2)
    elif 'jacare' in name:
        d.ellipse([6,18+wob,40,33+wob], fill=pal['clothes'], outline=pal['outline'])
        d.polygon([(28,18+wob),(45,13+wob),(42,27+wob),(29,29+wob)], fill=lighten(pal['clothes'],1.1), outline=pal['outline'])
        for tx in range(32,43,4): d.polygon([(tx,20+wob),(tx+2,23+wob),(tx-1,23+wob)], fill=(255,245,210), outline=pal['outline'])
        d.line([9,21+wob,2,14+wob], fill=pal['outline'], width=3)
        d.line([9,29+wob,2,36+wob], fill=pal['outline'], width=3)
    elif 'mosquito' in name:
        for ox in [-17,17]: d.ellipse([cx+ox-13,cy-18,cx+ox+13,cy+2], fill=(210,245,255,105), outline=(80,150,170,130))
        d.ellipse([cx-8,cy-12,cx+8,cy+15], fill=pal['clothes'], outline=pal['outline'])
        d.ellipse([cx-7,cy-22,cx+7,cy-10], fill=pal['skin'], outline=pal['outline'])
        d.line([cx,cy-16,cx+22,cy-24+wob], fill=pal['tail'], width=2)
        for off in [-6,-2,2,6]: d.line([cx+off,cy+4,cx+off+wob*6,cy+22], fill=pal['outline'], width=2)
    elif 'dj' in name:
        d.ellipse([4,26,44,43], fill=(30,20,40), outline=pal['outline'])
        d.rectangle([8,12+wob,40,32+wob], fill=pal['clothes'], outline=pal['outline'])
        d.ellipse([16,2+wob,32,18+wob], fill=pal['skin'], outline=pal['outline'])
        d.rectangle([13,4+wob,35,10+wob], fill=(20,20,30), outline=pal['outline'])
        for x in [13,30]: d.ellipse([x,31,x+6,37], fill=(160,255,130), outline=pal['outline'])
        d.arc([15,2+wob,33,20+wob], 200,340, fill=(235,235,250), width=2)
    else:
        # final villain mutant baron
        d.ellipse([cx-15,cy-18+wob,cx+15,cy+15+wob], fill=pal['clothes'], outline=pal['outline'])
        d.ellipse([cx-10,cy-28+wob,cx+10,cy-10+wob], fill=pal['skin'], outline=pal['outline'])
        d.polygon([(cx-7,cy-26+wob),(cx,cy-36+wob),(cx+7,cy-26+wob)], fill=pal.get('hat',(230,190,30)), outline=pal['outline'])
        d.line([cx-15,cy-4+wob,cx-28,cy-15+wob], fill=pal['outline'], width=5)
        d.line([cx+15,cy-4+wob,cx+28,cy-15+wob], fill=pal['outline'], width=5)
        d.line([cx-5,cy+14,cx-10,cy+24], fill=pal['outline'], width=5)
        d.line([cx+5,cy+14,cx+10,cy+24], fill=pal['outline'], width=5)
    return im

def make_boss_sheet(name, pal, frame=96):
    low=frame//2; cols=6; rows=len(ANIMS)*len(DIRS)
    sheet=transparent((cols*frame, rows*frame))
    for ai,(anim,nf) in enumerate(ANIMS):
        for di,dr in enumerate(DIRS):
            for c in range(cols):
                ff=c%nf
                lim=draw_boss_low(pal, anim, ff, dr, name, frame=low)
                sim=scale2(lim,(frame,frame))
                sheet.paste(sim,(c*frame,(ai*len(DIRS)+di)*frame),sim)
    sheet.save(IMG/'sprites/bosses'/f'{name}.png', optimize=True)

# palettes
OUT=(34,26,31)
skins=[(184,111,69),(218,151,100),(132,83,62),(236,183,124),(101,66,51)]
heroes={
 'leo_mandacaru': dict(outline=OUT, skin=(234,196,162), clothes=(28,28,34), sleeve=(232,232,238), pants=(28,28,34), hair=(62,42,34), hat=(232,232,238)),
 'bia_faisca': dict(outline=OUT, skin=(224,190,156), clothes=(45,56,78), sleeve=(95,184,215), pants=(38,40,54), hair=(48,28,22), hat=(210,170,110)),
}
make_sheet('leo_mandacaru', IMG/'sprites/protagonists', heroes['leo_mandacaru'], kind='hero', accessory=None, frame=56)
make_sheet('bia_faisca', IMG/'sprites/protagonists', heroes['bia_faisca'], kind='hero', accessory='hairbig', frame=56)

enemies={
'zumbi_bairro': dict(outline=OUT, skin=(120,185,112), clothes=(95,90,135), sleeve=(90,160,105), pants=(55,60,70), hair=(40,45,40)),
'noiva_fantasma': dict(outline=OUT, skin=(210,235,245), clothes=(235,235,245), sleeve=(190,220,240), pants=(210,210,230), hair=(150,150,170)),
'cachorro_zumbi': dict(outline=OUT, skin=(130,95,75), clothes=(105,75,55), pants=(60,50,45), hair=(80,60,50)),
'rato_mutante': dict(outline=OUT, skin=(160,135,145), clothes=(115,100,110), pants=(80,80,80), hair=(80,60,80), tail=(225,130,150)),
'mosquito_mutante': dict(outline=OUT, skin=(105,170,120), clothes=(60,90,85), pants=(60,90,85), hair=(40,70,60), tail=(205,50,50)),
'palhaco_demonico': dict(outline=OUT, skin=(242,242,218), clothes=(220,45,65), sleeve=(245,210,50), pants=(40,120,220), hair=(240,60,40)),
'boneco_posto': dict(outline=OUT, skin=(240,225,80), clothes=(230,50,70), sleeve=(245,245,245), pants=(55,100,190), hair=(40,40,40)),
'slime_toxico': dict(outline=OUT, skin=(110,255,115), clothes=(65,230,85), pants=(65,230,85), hair=(20,120,40)),
'seguranca_possuido': dict(outline=OUT, skin=(170,120,85), clothes=(35,45,65), sleeve=(35,45,65), pants=(30,35,45), hair=(20,20,20), hat=(35,35,45)),
'motoqueiro_fantasma': dict(outline=OUT, skin=(170,220,240), clothes=(50,50,55), sleeve=(90,90,95), pants=(30,30,35), hair=(10,10,10), hat=(220,40,45)),
'planta_quintal': dict(outline=OUT, skin=(95,170,70), clothes=(190,60,90), pants=(80,130,50), hair=(40,100,40), tail=(55,145,55)),
'fantasma_carnaval': dict(outline=OUT, skin=(195,235,255), clothes=(180,100,230), sleeve=(255,210,70), pants=(80,220,170), hair=(235,60,140)),
}
for n,p in enemies.items():
    acc = 'helmet' if 'seguranca' in n or 'motoqueiro' in n else None
    make_sheet(n, IMG/'sprites/enemies', p, kind='enemy', accessory=acc)

npcs={
'dona_neusa': ('apron', dict(outline=OUT, skin=skins[3], clothes=(240,120,100), sleeve=(230,170,100), pants=(120,70,60), hair=(90,70,55), apron=(245,240,220))),
'ze_motoboy': ('helmet', dict(outline=OUT, skin=skins[1], clothes=(245,205,50), sleeve=(30,30,30), pants=(35,50,80), hair=(30,30,30), hat=(245,205,50))),
'gari_joel': ('cap', dict(outline=OUT, skin=skins[2], clothes=(255,120,35), sleeve=(255,160,60), pants=(30,70,60), hair=(30,25,20), hat=(255,120,35))),
'prof_marta': (None, dict(outline=OUT, skin=skins[3], clothes=(100,160,220), sleeve=(240,240,210), pants=(70,70,100), hair=(80,50,35))),
'skatista_lu': ('cap', dict(outline=OUT, skin=skins[0], clothes=(60,220,160), sleeve=(240,80,110), pants=(45,45,70), hair=(30,25,22), hat=(45,220,160))),
'policial_ana': ('cap', dict(outline=OUT, skin=skins[2], clothes=(30,70,150), sleeve=(30,70,150), pants=(25,35,90), hair=(30,30,25), hat=(30,70,150))),
'pastel_ivan': ('apron', dict(outline=OUT, skin=skins[4], clothes=(220,80,40), sleeve=(250,210,60), pants=(70,40,30), hair=(50,35,25), apron=(255,230,160))),
'crianca_beto': ('cap', dict(outline=OUT, skin=skins[1], clothes=(80,200,245), sleeve=(240,80,80), pants=(45,80,160), hair=(55,30,25), hat=(245,70,55))),
'vo_cida': (None, dict(outline=OUT, skin=skins[3], clothes=(190,120,210), sleeve=(230,200,240), pants=(120,80,130), hair=(220,220,220))),
'enfermeira_rosa': ('cap', dict(outline=OUT, skin=skins[0], clothes=(240,240,245), sleeve=(200,235,240), pants=(80,170,185), hair=(80,50,40), hat=(240,240,245))),
'porteiro_naldo': ('cap', dict(outline=OUT, skin=skins[2], clothes=(70,100,160), sleeve=(220,220,180), pants=(50,50,70), hair=(30,25,20), hat=(70,100,160))),
'musico_tito': (None, dict(outline=OUT, skin=skins[4], clothes=(120,80,220), sleeve=(250,190,60), pants=(40,35,60), hair=(20,20,25))),
}
for n,(acc,pal) in npcs.items():
    make_sheet(n, IMG/'sprites/npcs', pal, kind='npc', accessory=acc)

bosses={
'caminhao_lixo_possuido': dict(outline=OUT, skin=(110,220,130), clothes=(50,165,85), pants=(30,100,60), hair=(30,30,30)),
'jacare_esgoto_mutante': dict(outline=OUT, skin=(75,180,80), clothes=(50,155,75), pants=(25,90,50), tail=(30,100,50)),
'rainha_mosquito': dict(outline=OUT, skin=(160,230,170), clothes=(90,50,130), tail=(220,40,70)),
'dj_necromante': dict(outline=OUT, skin=(170,125,95), clothes=(90,40,130), hat=(30,20,60)),
'barao_entulho': dict(outline=OUT, skin=(220,165,95), clothes=(120,35,120), hat=(235,180,30)),
}
for n,p in bosses.items(): make_boss_sheet(n,p)

# portraits 128x128
try:
    font_big=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
    font_sm=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 10)
except:
    font_big=font_sm=None

def make_portrait(name, pal, title, accessory=None):
    im=Image.new('RGBA',(128,128),(25,20,32,255)); d=ImageDraw.Draw(im)
    # frame bg gradient blocks
    for y in range(0,128,4):
        col=(30+y//8,25+y//10,42+y//7,255)
        d.rectangle([0,y,127,y+3], fill=col)
    d.rectangle([4,4,123,123], outline=(245,200,85), width=3)
    d.ellipse([38,27,90,80], fill=pal['skin'], outline=OUT, width=3)
    hair=pal.get('hair',(40,30,20))
    if accessory=='cap':
        d.pieslice([34,18,94,60],180,360, fill=pal.get('hat',(220,40,40)), outline=OUT, width=2)
        d.rectangle([43,21,86,31], fill=pal.get('hat',(220,40,40)))
    elif accessory=='hairbig':
        d.ellipse([34,14,94,54], fill=hair, outline=OUT, width=3)
        d.rectangle([29,46,42,88], fill=hair)
        d.rectangle([86,46,99,88], fill=hair)
    else:
        d.pieslice([34,18,94,58],180,360, fill=hair, outline=OUT, width=2)
    d.ellipse([50,51,55,57], fill=(10,10,10)); d.ellipse([73,51,78,57], fill=(10,10,10))
    d.arc([55,58,75,72], 0,180, fill=(80,30,35), width=2)
    d.rectangle([30,80,98,119], fill=pal['clothes'], outline=OUT, width=3)
    d.rectangle([44,80,50,119], fill=pal.get('sleeve', pal['clothes']))
    d.rectangle([78,80,84,119], fill=pal.get('sleeve', pal['clothes']))
    d.text((8,106), title[:18], font=font_big, fill=(255,245,190))
    im.save(IMG/'portraits'/f'{name}.png', optimize=True)
for n,p in heroes.items(): make_portrait(n,p,'Felipe' if 'leo' in n else 'Nika', None if 'leo' in n else 'hairbig')
for n,p in list(enemies.items())[:12]: make_portrait(n,p,n.replace('_',' ')[:14], None)
for n,(acc,p) in npcs.items(): make_portrait(n,p,n.replace('_',' ')[:14], acc)
for n,p in bosses.items(): make_portrait(n,p,n.replace('_',' ')[:14])

# tilesets
TILE=32
names=[]
cols=8
rows=12
sheet=Image.new('RGBA',(cols*TILE,rows*TILE),(0,0,0,0)); d=ImageDraw.Draw(sheet)

def tile_at(idx): return (idx%cols*TILE, idx//cols*TILE)

def add_tile(name, base, pattern='noise', accent=None, solid=False):
    idx=len(names); names.append(name); x,y=tile_at(idx)
    d.rectangle([x,y,x+TILE-1,y+TILE-1], fill=base+(255,))
    rng=random.Random(hash(name)&0xffffffff)
    if pattern=='asphalt':
        for _ in range(18):
            px0=x+rng.randrange(0,TILE); py=y+rng.randrange(0,TILE); c=lighten(base, rng.uniform(.85,1.25))
            d.point((px0,py), fill=c+(255,))
        d.line([x+3,y+16,x+12,y+16], fill=(235,220,120,255), width=2)
        d.line([x+20,y+16,x+29,y+16], fill=(235,220,120,255), width=2)
    elif pattern=='bricks':
        for yy in range(y,y+TILE,8): d.line([x,yy,x+TILE,yy], fill=darken(base,.65)+(255,))
        for yy in range(0,TILE,8):
            off=0 if (yy//8)%2==0 else 8
            for xx in range(x+off,x+TILE,16): d.line([xx,y+yy,xx,y+yy+8], fill=darken(base,.65)+(255,))
    elif pattern=='grass':
        for _ in range(28):
            xx=x+rng.randrange(TILE); yy=y+rng.randrange(TILE); d.line([xx,yy,xx+rng.choice([-1,0,1]),yy-2], fill=lighten(base, rng.uniform(.8,1.4))+(255,))
    elif pattern=='sand':
        for _ in range(22):
            xx=x+rng.randrange(0,TILE-5); yy=y+rng.randrange(0,TILE-4); d.arc([xx,yy,xx+4,yy+3], 0,180, fill=darken(base,.75)+(255,))
    elif pattern=='water':
        for yy in range(4,TILE,8): d.arc([x+2,y+yy,x+14,y+yy+5],0,180, fill=lighten(base,1.4)+(255,), width=1); d.arc([x+16,y+yy+2,x+30,y+yy+7],0,180, fill=lighten(base,1.25)+(255,), width=1)
    elif pattern=='lab':
        for yy in range(y,y+TILE,16): d.line([x,yy,x+TILE,yy], fill=darken(base,.6)+(255,))
        for xx in range(x,x+TILE,16): d.line([xx,y,xx,y+TILE], fill=darken(base,.6)+(255,))
        d.rectangle([x+3,y+3,x+8,y+8], fill=lighten(base,1.25)+(255,))
    if accent:
        d.rectangle([x+1,y+1,x+TILE-2,y+TILE-2], outline=accent+(255,))
    return idx

# theme tiles
for nm, base, patterns in [
('urbano',(75,76,82),['asphalt','bricks','grass']),
('feira',(120,92,62),['bricks','sand','grass']),
('escola',(115,135,160),['lab','bricks','grass']),
('cemiterio',(75,95,78),['grass','bricks','asphalt']),
('favela',(95,80,70),['bricks','asphalt','grass']),
('praia',(208,182,105),['sand','water','grass']),
('metro',(65,68,78),['lab','asphalt','bricks']),
('lab',(95,105,125),['lab','water','bricks']),
('junina',(120,80,45),['sand','bricks','grass']),
('shopping',(115,105,130),['lab','bricks','asphalt'])]:
    add_tile(f'{nm}_floor', base, patterns[0])
    add_tile(f'{nm}_wall', darken(base,.65), patterns[1], accent=lighten(base,1.25))
    add_tile(f'{nm}_decor', lighten(base,1.15), patterns[2])
# common hazards
add_tile('slime', (64,200,80), 'water')
add_tile('fire_floor', (220,85,35), 'sand')
add_tile('dark_void', (28,25,35), 'noise')
sheet.save(IMG/'tilesets'/'tiles_brasil.png', optimize=True)

# Props sheet
PROP=48; pcols=8
prop_defs=[]
prop_sheet=transparent((pcols*PROP,5*PROP)); pd=ImageDraw.Draw(prop_sheet)
def prop(name):
    idx=len(prop_defs); prop_defs.append(name); return idx, (idx%pcols*PROP, idx//pcols*PROP)

def draw_prop_rect(name, base, detail=None):
    idx,(x,y)=prop(name)
    pd.ellipse([x+8,y+36,x+40,y+45], fill=(0,0,0,70))
    pd.rectangle([x+8,y+12,x+40,y+38], fill=base+(255,), outline=OUT+(255,), width=2)
    if detail:
        detail(x,y)
# car
idx,(x,y)=prop('carro_popular'); pd.ellipse([x+5,y+34,x+43,y+44], fill=(0,0,0,70)); pd.rectangle([x+7,y+17,x+42,y+35], fill=(200,60,70,255), outline=OUT+(255,), width=2); pd.rectangle([x+13,y+12,x+32,y+23], fill=(90,180,220,255), outline=OUT+(255,));
for wx in [x+10,x+34]: pd.ellipse([wx,y+31,wx+8,y+40], fill=(25,25,25,255), outline=OUT+(255,))
# tree
idx,(x,y)=prop('arvore_mangueira'); pd.ellipse([x+12,y+12,x+36,y+43], fill=(0,0,0,50)); pd.rectangle([x+21,y+24,x+27,y+41], fill=(110,75,45,255), outline=OUT+(255,));
for ox,oy,col in [(5,5,(60,150,70)),(16,2,(65,170,75)),(23,7,(45,135,65)),(10,15,(80,180,70))]: pd.ellipse([x+ox,y+oy,x+ox+23,y+oy+20], fill=col+(255,), outline=OUT+(255,))
# feira barraca
idx,(x,y)=prop('barraca_feira'); pd.rectangle([x+5,y+17,x+43,y+38], fill=(135,80,45,255), outline=OUT+(255,), width=2); 
for i,c in enumerate([(240,60,60),(245,230,70),(70,180,80),(240,60,60)]): pd.rectangle([x+6+i*9,y+7,x+15+i*9,y+18], fill=c+(255,), outline=OUT+(255,))
# tomb
idx,(x,y)=prop('tumulo'); pd.ellipse([x+14,y+35,x+34,y+43], fill=(0,0,0,70)); pd.rounded_rectangle([x+14,y+10,x+34,y+38], radius=5, fill=(145,150,150,255), outline=OUT+(255,), width=2); pd.line([x+24,y+15,x+24,y+28], fill=(80,80,80,255), width=2); pd.line([x+19,y+20,x+29,y+20], fill=(80,80,80,255), width=2)
# desk
idx,(x,y)=prop('carteira_escola'); pd.rectangle([x+9,y+16,x+39,y+30], fill=(155,105,60,255), outline=OUT+(255,), width=2); pd.line([x+13,y+30,x+10,y+40], fill=OUT+(255,), width=2); pd.line([x+35,y+30,x+38,y+40], fill=OUT+(255,), width=2); pd.rectangle([x+15,y+8,x+33,y+14], fill=(80,110,170,255), outline=OUT+(255,))
# bench
idx,(x,y)=prop('banco_praca'); pd.rectangle([x+7,y+20,x+41,y+26], fill=(130,80,45,255), outline=OUT+(255,), width=2); pd.rectangle([x+9,y+29,x+39,y+34], fill=(110,70,40,255), outline=OUT+(255,), width=2); pd.line([x+12,y+34,x+9,y+42], fill=OUT+(255,), width=2); pd.line([x+36,y+34,x+39,y+42], fill=OUT+(255,), width=2)
# lamp
idx,(x,y)=prop('poste_luz'); pd.rectangle([x+22,y+10,x+26,y+42], fill=(70,70,85,255), outline=OUT+(255,)); pd.ellipse([x+16,y+3,x+32,y+16], fill=(245,230,130,255), outline=OUT+(255,), width=2)
# trash
idx,(x,y)=prop('lixeira'); pd.rectangle([x+14,y+15,x+34,y+39], fill=(60,140,85,255), outline=OUT+(255,), width=2); pd.rectangle([x+12,y+12,x+36,y+17], fill=(45,100,65,255), outline=OUT+(255,));
# door
idx,(x,y)=prop('porta_madeira'); pd.rectangle([x+11,y+4,x+37,y+44], fill=(120,70,40,255), outline=OUT+(255,), width=2); pd.rectangle([x+15,y+10,x+33,y+28], outline=(80,40,25,255), width=2); pd.ellipse([x+31,y+25,x+34,y+28], fill=(245,220,90,255))
# barricade
idx,(x,y)=prop('barricada');
for yy in [16,25,34]: pd.rectangle([x+5,y+yy,x+43,y+yy+5], fill=(120,70,40,255), outline=OUT+(255,));
pd.line([x+10,y+12,x+38,y+42], fill=OUT+(255,), width=3)
# beach umbrella
idx,(x,y)=prop('guarda_sol'); pd.line([x+24,y+15,x+24,y+42], fill=OUT+(255,), width=3); pd.pieslice([x+6,y+0,x+42,y+30],180,360, fill=(245,80,80,255), outline=OUT+(255,)); pd.pieslice([x+14,y+0,x+34,y+28],180,360, fill=(245,230,70,255))
# lab machine
idx,(x,y)=prop('maquina_lab'); pd.rectangle([x+9,y+9,x+39,y+40], fill=(75,95,120,255), outline=OUT+(255,), width=2); pd.rectangle([x+14,y+14,x+34,y+24], fill=(70,230,170,255), outline=OUT+(255,));
for i,c in enumerate([(230,70,70),(240,210,70),(80,220,120)]): pd.ellipse([x+14+i*7,y+29,x+19+i*7,y+34], fill=c+(255,), outline=OUT+(255,))
# caixa
idx,(x,y)=prop('caixa_madeira'); pd.rectangle([x+10,y+13,x+38,y+41], fill=(140,90,50,255), outline=OUT+(255,), width=2); pd.line([x+11,y+14,x+37,y+40], fill=(80,45,25,255), width=2); pd.line([x+37,y+14,x+11,y+40], fill=(80,45,25,255), width=2)
# hydrant
idx,(x,y)=prop('hidrante'); pd.rectangle([x+19,y+16,x+29,y+39], fill=(220,50,55,255), outline=OUT+(255,), width=2); pd.rectangle([x+15,y+22,x+33,y+29], fill=(200,40,45,255), outline=OUT+(255,)); pd.ellipse([x+17,y+9,x+31,y+21], fill=(220,50,55,255), outline=OUT+(255,))
# shopping escalator broken
idx,(x,y)=prop('escada_rolante'); pd.polygon([(8,38),(18,12),(41,12),(31,38)], fill=(80,85,100,255), outline=OUT+(255,));
for k in range(5): pd.line([x+12+k*5,y+35-k*5,x+35+k*1,y+35-k*5], fill=(120,125,140,255))
# flag junina
idx,(x,y)=prop('bandeirinhas'); pd.line([x+4,y+12,x+44,y+9], fill=OUT+(255,), width=2);
for k,c in enumerate([(240,70,70),(240,220,60),(70,190,90),(60,160,240),(220,80,180)]): pd.polygon([(x+6+k*8,y+12),(x+13+k*8,y+11),(x+10+k*8,y+20)], fill=c+(255,), outline=OUT+(255,))
# favela wall graffiti
idx,(x,y)=prop('muro_grafite'); pd.rectangle([x+4,y+18,x+44,y+39], fill=(115,95,80,255), outline=OUT+(255,), width=2); pd.text((x+9,y+22),'BOO', fill=(245,90,180,255), font=font_big)
prop_sheet.save(IMG/'props'/'props_brasil.png', optimize=True)

# Items sheet 32x32
ITEM=32; icol=8
items=['agua_turbinada','chinelo_explosivo','rojao_junino','spray_fogo','guarana_explosivo','estilingue','panela_bomba','aspirador_paranormal','coxinha','caldo_cana','kit_cura','amuleto']
item_sheet=transparent((icol*ITEM,2*ITEM)); idr=ImageDraw.Draw(item_sheet)
for idx,n in enumerate(items):
    x=(idx%icol)*ITEM; y=(idx//icol)*ITEM
    idr.ellipse([x+5,y+21,x+27,y+29], fill=(0,0,0,55))
    if 'agua' in n:
        idr.rectangle([x+8,y+10,x+24,y+18], fill=(70,190,245,255), outline=OUT+(255,), width=2); idr.rectangle([x+20,y+7,x+29,y+12], fill=(235,235,220,255), outline=OUT+(255,)); idr.rectangle([x+9,y+18,x+14,y+25], fill=(40,100,180,255), outline=OUT+(255,))
    elif 'chinelo' in n:
        idr.ellipse([x+8,y+8,x+19,y+26], fill=(240,210,60,255), outline=OUT+(255,), width=2); idr.line([x+13,y+13,x+16,y+20], fill=(70,170,80,255), width=2)
    elif 'rojao' in n:
        idr.rectangle([x+12,y+7,x+20,y+24], fill=(220,50,65,255), outline=OUT+(255,), width=2); idr.polygon([(12+x,7+y),(20+x,7+y),(16+x,2+y)], fill=(240,220,80,255), outline=OUT+(255,)); idr.line([x+16,y+24,x+22,y+29], fill=(240,180,60,255), width=2)
    elif 'spray' in n:
        idr.rectangle([x+10,y+8,x+22,y+26], fill=(180,180,190,255), outline=OUT+(255,), width=2); idr.rectangle([x+12,y+5,x+20,y+9], fill=(240,90,60,255), outline=OUT+(255,)); idr.polygon([(x+22,y+12),(x+30,y+9),(x+29,y+15)], fill=(250,120,40,255))
    elif 'guarana' in n:
        idr.rectangle([x+12,y+6,x+20,y+26], fill=(20,170,90,255), outline=OUT+(255,), width=2); idr.rectangle([x+11,y+11,x+21,y+18], fill=(230,60,55,255), outline=OUT+(255,))
    elif 'estilingue' in n:
        idr.line([x+16,y+25,x+12,y+10], fill=(120,70,45,255), width=3); idr.line([x+16,y+25,x+22,y+10], fill=(120,70,45,255), width=3); idr.arc([x+9,y+8,x+25,y+16], 0,180, fill=OUT+(255,), width=2)
    elif 'panela' in n:
        idr.ellipse([x+7,y+13,x+25,y+25], fill=(180,185,195,255), outline=OUT+(255,), width=2); idr.rectangle([x+10,y+9,x+22,y+15], fill=(210,215,220,255), outline=OUT+(255,)); idr.line([x+22,y+8,x+28,y+3], fill=(245,60,50,255), width=2)
    elif 'aspirador' in n:
        idr.ellipse([x+8,y+13,x+23,y+26], fill=(120,80,190,255), outline=OUT+(255,), width=2); idr.line([x+20,y+15,x+29,y+7], fill=(180,150,230,255), width=3)
    elif 'coxinha' in n:
        idr.polygon([(x+16,y+5),(x+8,y+25),(x+24,y+25)], fill=(220,150,55,255), outline=OUT+(255,)); idr.point((x+14,y+17), fill=(245,220,120,255)); idr.point((x+18,y+20), fill=(245,220,120,255))
    elif 'caldo' in n:
        idr.rectangle([x+10,y+8,x+22,y+25], fill=(230,240,210,255), outline=OUT+(255,), width=2); idr.rectangle([x+12,y+9,x+20,y+14], fill=(120,230,80,255)); idr.line([x+22,y+7,x+27,y+3], fill=(70,180,60,255), width=2)
    elif 'kit' in n:
        idr.rectangle([x+7,y+8,x+25,y+25], fill=(245,245,245,255), outline=OUT+(255,), width=2); idr.rectangle([x+14,y+11,x+18,y+22], fill=(220,60,60,255)); idr.rectangle([x+10,y+15,x+22,y+18], fill=(220,60,60,255))
    else:
        idr.ellipse([x+9,y+7,x+23,y+24], fill=(80,200,210,255), outline=OUT+(255,), width=2); idr.ellipse([x+13,y+11,x+19,y+19], fill=(245,230,80,255), outline=OUT+(255,))
item_sheet.save(IMG/'items'/'items_brasil.png', optimize=True)

# effects sheet rows: explosion, smoke, fire, water, poison, spark, rescue
EFF=48; ecols=8; effects=['explosion','smoke','fire','water','poison','spark','rescue']
eff_sheet=transparent((ecols*EFF,len(effects)*EFF)); ed=ImageDraw.Draw(eff_sheet)
for r,name in enumerate(effects):
    for f in range(ecols):
        x=f*EFF; y=r*EFF; cx=x+24; cy=y+24
        if name=='explosion':
            rad=5+f*5
            ed.ellipse([cx-rad,cy-rad,cx+rad,cy+rad], fill=(250,180,45,max(40,255-f*25)), outline=(160,40,20,max(0,255-f*30)))
            ed.ellipse([cx-rad//2,cy-rad//2,cx+rad//2,cy+rad//2], fill=(255,240,120,max(0,230-f*20)))
        elif name=='smoke':
            for k in range(4):
                rad=6+f*2+k*2; ox=int(math.sin(f+k)*8); oy=-f*2+k*3
                ed.ellipse([cx+ox-rad,cy+oy-rad,cx+ox+rad,cy+oy+rad], fill=(120,120,125,max(0,150-f*12-k*15)))
        elif name=='fire':
            rad=12+f%3
            ed.polygon([(cx,cy-18-rad//3),(cx-12,cy+15),(cx,cy+7),(cx+12,cy+15)], fill=(240,80+f*8,30,220), outline=(120,30,20,180))
            ed.polygon([(cx,cy-8),(cx-6,cy+12),(cx+6,cy+12)], fill=(255,230,80,230))
        elif name=='water':
            ed.ellipse([cx-4-f*2,cy-4-f*2,cx+4+f*2,cy+4+f*2], outline=(70,180,245,max(255-f*24,30)), width=3)
        elif name=='poison':
            for k in range(5): ed.ellipse([cx-8+k*4,cy-5-int(f*1.3)+k%2*3,cx-3+k*4,cy-int(f*1.3)+k%2*3], fill=(80,230,80,max(40,190-f*15)))
        elif name=='spark':
            col=(245,245,100,max(0,255-f*30)); ed.line([cx,cy-18+f,cx,cy+18-f], fill=col, width=2); ed.line([cx-18+f,cy,cx+18-f,cy], fill=col, width=2); ed.line([cx-12,cy-12,cx+12,cy+12], fill=col, width=1); ed.line([cx+12,cy-12,cx-12,cy+12], fill=col, width=1)
        else:
            ed.ellipse([cx-8-f,cy-8-f,cx+8+f,cy+8+f], outline=(120,255,180,max(0,250-f*25)), width=2); ed.text((cx-4,cy-8),'!', fill=(255,255,255,max(0,250-f*25)), font=font_big)
eff_sheet.save(IMG/'effects'/'effects_brasil.png', optimize=True)

# UI logo/menu backgrounds
menu=Image.new('RGBA',(960,540),(22,18,30,255)); md=ImageDraw.Draw(menu)
for y in range(540):
    col=(22+y//20,18+y//32,30+y//18,255); md.line([0,y,960,y], fill=col)
# stylized skyline
for i in range(24):
    x=i*45+random.randint(-5,10); h=random.randint(60,170); c=(35+random.randint(0,25),35+random.randint(0,20),45+random.randint(0,35),255)
    md.rectangle([x,360-h,x+40,440], fill=c, outline=(20,18,25,255))
    for wx in range(x+6,x+35,10):
        for wy in range(360-h+10,430,16):
            if random.random()<.35: md.rectangle([wx,wy,wx+4,wy+4], fill=(230,200,80,120))
# stars and haze
for sx,sy in [(90,60),(160,38),(240,88),(310,54),(420,76),(520,34),(610,64),(700,92),(812,48),(890,72)]:
    md.rectangle([sx,sy,sx+2,sy+2], fill=(230,230,245,180))
md.ellipse([700,30,920,160], fill=(40,36,70,38))
menu.save(IMG/'ui'/'menu_bg.png', optimize=True)
logo=transparent((640,180)); ld=ImageDraw.Draw(logo)
try: titlefont=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 56)
except: titlefont=None
for off in [(4,4),(2,2),(0,0)]:
    fill=(35,20,45,255) if off!=(0,0) else (255,215,75,255)
    ld.text((20+off[0],25+off[1]), 'ZUMBIS NA', font=titlefont, fill=fill, stroke_width=2, stroke_fill=(35,20,45,255))
    ld.text((20+off[0],85+off[1]), 'QUEBRADA', font=titlefont, fill=(90,235,125,255) if off==(0,0) else fill, stroke_width=2, stroke_fill=(35,20,45,255))
logo.save(IMG/'ui'/'logo.png', optimize=True)
# loading/victory/defeat panels
for name,text,bg in [('loading','ZUMBIS NA QUEBRADA', (30,25,40)),('victory','QUEBRADA SALVA!',(25,70,45)),('gameover','DEU RUIM...', (70,25,35))]:
    im=Image.new('RGBA',(960,540),bg+(255,)); dr=ImageDraw.Draw(im)
    dr.rectangle([60,80,900,460], outline=(245,215,90,255), width=5)
    dr.text((140,210), text, font=titlefont, fill=(255,240,140,255), stroke_width=3, stroke_fill=(20,15,25,255))
    im.save(IMG/'ui'/f'{name}.png', optimize=True)

# metadata JSON via JS-friendly file perhaps
import json
meta={
 'animations': {a:n for a,n in ANIMS}, 'directions': DIRS,
 'tiles': names, 'props': prop_defs, 'items': items, 'effects': effects,
 'sprites': {
   'protagonists': list(heroes.keys()), 'enemies': list(enemies.keys()), 'npcs': list(npcs.keys()), 'bosses': list(bosses.keys())
 }
}
(ROOT/'assets'/'asset_manifest.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')

# procedural audio WAV
SR=22050

def synth_note(freq, dur, vol=.25, wave_type='square', decay=True):
    n=int(SR*dur); t=np.arange(n)/SR
    if wave_type=='square': y=np.sign(np.sin(2*np.pi*freq*t))
    elif wave_type=='saw': y=2*((freq*t)%1)-1
    elif wave_type=='tri': y=2*np.abs(2*((freq*t)%1)-1)-1
    elif wave_type=='noise': y=np.random.uniform(-1,1,n)
    else: y=np.sin(2*np.pi*freq*t)
    env=np.ones(n)
    a=min(n, int(SR*.01));
    if a>0: env[:a]=np.linspace(0,1,a)
    if decay: env*=np.linspace(1,.15,n)
    return (y*env*vol).astype(np.float32)

def write_wav(path, data):
    data=np.clip(data,-1,1)
    with wave.open(str(path),'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(v*32767)) for v in data))

def make_loop(name, scale, bpm=118, bars=8, mood=0):
    beat=60/bpm
    total=int(SR*beat*4*bars)
    arr=np.zeros(total,dtype=np.float32)
    root=scale[0]
    for i in range(bars*8):
        start=int(i*beat/2*SR)
        freq=scale[(i*2+mood)%len(scale)]
        note=synth_note(freq, beat*.40, .08, 'tri')
        arr[start:start+len(note)] += note
        if i%2==0:
            harm=synth_note(freq*0.5, beat*.35, .035, 'square')
            arr[start:start+len(harm)] += harm
        if i%4==0:
            bass=synth_note(root/2 if i%8 else root/4, beat*.85, .07, 'sine')
            arr[start:start+len(bass)] += bass
            kick=synth_note(55, .05, .08, 'sine')
            arr[start:start+len(kick)] += kick
        if i%4==2:
            sn=synth_note(220, .03, .045, 'noise')
            arr[start:start+len(sn)] += sn
    # gentle master fade loop
    arr *= .9
    write_wav(AUD/'music'/f'{name}.wav', arr)
base=[261.63,293.66,311.13,349.23,392.00,415.30,466.16,523.25]
make_loop('menu_malandro_assombrado', base, 102, 10, 1)
make_loop('fase_rua_treta', [220,246.94,261.63,293.66,329.63,349.23,392], 124, 8, 0)
make_loop('feira_maldita', [196,220,246.94,261.63,293.66,329.63,392], 126, 8, 2)
make_loop('escola_pancada', [174.61,196,220,246.94,261.63,293.66,349.23], 116, 8, 3)
make_loop('cemiterio_samba_sombrio', [164.81,185,196,220,246.94,277,329.63], 108, 8, 4)
make_loop('praia_assombrada', [246.94,277,311,329.63,370,415,493.88], 114, 8, 1)
make_loop('laboratorio_final', [130.81,146.83,155.56,174.61,196,207.65,233.08], 132, 8, 5)
make_loop('boss_pancadao_oculto', [110,123.47,130.81,146.83,164.81,174.61,196], 138, 8, 6)
make_loop('vitoria', [261.63,329.63,392,523.25,659.25,783.99], 112, 4, 0)
make_loop('gameover', [220,207.65,196,174.61,164.81,146.83], 74, 4, 0)
# sfx
sfx_defs={
 'shoot': (800,.08,'square'), 'pickup':(1200,.12,'tri'), 'explosion':(90,.35,'noise'), 'hit':(150,.12,'saw'),
 'rescue':(880,.25,'tri'), 'zombie':(80,.3,'saw'), 'click':(1000,.04,'square'), 'door':(250,.18,'tri'), 'splash':(500,.15,'noise'), 'boss_roar':(70,.55,'saw')}
for n,(freq,dur,wv) in sfx_defs.items():
    arr=synth_note(freq,dur,.35,wv)
    if n=='rescue':
        extra=np.zeros_like(arr); tone=synth_note(freq*1.5,dur*.7,.18,'square'); start=int(SR*.05); extra[start:min(len(arr),start+len(tone))]=tone[:max(0,min(len(tone),len(arr)-start))]; arr+=extra
    if n=='explosion': arr+=synth_note(60,dur,.22,'sine')
    write_wav(AUD/'sfx'/f'{n}.wav', arr)
print('Generated assets:', ROOT)
