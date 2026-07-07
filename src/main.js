(() => {
'use strict';

const GAME_W = 960, GAME_H = 540, TILE = 32;
const DATA = window.ZNQ_DATA;
const MAN = DATA.manifest;
const LEVELS = DATA.levels;
const ANIMS = ['idle','walk','attack','hit','death'];
const ANIM_FRAMES = { idle:4, walk:6, attack:4, hit:3, death:6 };
const DIRS = ['S','SE','E','NE','N','NW','W','SW'];
const TILE_NAMES = MAN.tiles;
const PROP_NAMES = MAN.props;
const ITEM_NAMES = MAN.items;
const EFFECT_NAMES = MAN.effects;
const tileId = n => Math.max(0, TILE_NAMES.indexOf(n));
const propId = n => Math.max(0, PROP_NAMES.indexOf(n));
const itemId = n => Math.max(0, ITEM_NAMES.indexOf(n));
const effectId = n => Math.max(0, EFFECT_NAMES.indexOf(n));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const len = (x,y) => Math.hypot(x,y) || 1;
const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const randRange = (rng,a,b) => a + (b-a)*rng();
const sign = v => v < -0.1 ? -1 : v > 0.1 ? 1 : 0;

const DIR_VECS = [{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1}];
const LANGS = ['pt','en','ru'];
const LANG_NAMES = {pt:'Português', en:'English', ru:'Русский'};
const I18N = {
  pt: {
    splash_press:'Pressione ENTER / TOQUE para começar',
    menu_new:'Novo Jogo', menu_continue:'Continuar', menu_language:'Idioma', menu_options:'Opções', menu_controls:'Controles', menu_credits:'Créditos',
    menu_tagline:'Top-down arcade brasileiro • teclado • mouse • gamepad • touch',
    title_options:'OPÇÕES', title_controls:'CONTROLES', title_credits:'CRÉDITOS INTERNOS', title_language:'SELECIONAR IDIOMA',
    music:'Música', sfx:'Efeitos', back:'Voltar',
    options_hint:'Use ←/→ para ajustar volume.',
    controls_1:'P1: WASD ou setas para mover | Clique/Espaço atira na direção atual',
    controls_2:'Q troca arma | E interage/resgata | ESC pausa',
    controls_3:'P2: pressione C para entrar | IJKL move | U atira | O troca arma',
    controls_4:'Gamepad: analógico move | A/RT atira | RB troca | B interage',
    controls_5:'Touch: analógico virtual à esquerda e botões à direita',
    press_back:'Pressione ENTER ou toque para voltar.',
    credits_1:'Criação, direção e revisão: Felipe.', credits_2:'Design, código, sprites PNG e áudio WAV gerados proceduralmente neste pacote.', credits_3:'Sem SVG e sem conteúdo copiado de obras existentes.', credits_4:'Identidade original: terror cômico brasileiro com vibe retrô 16-bit/32-bit.',
    continue_hint:'ENTER / ESPAÇO / TOQUE para continuar o caos', splashHeadline:'A cidade apagou. O caos acendeu.', splashSubline:'Felipe e Nika precisam salvar a quebrada de um experimento sobrenatural que deu muito, muito errado.', confirmHint:'A / ENTER / TOQUE para confirmar', cutsceneHint:'A / ENTER / TOQUE para continuar', pauseHint:'ESC / START / B para continuar', loadingText:'CARREGANDO O CAOS...', errorTitle:'Erro em tempo de execução', errorHelp:'Abra novamente a página ou baixe a versão corrigida.',
    gameover_return:'Pressione ENTER/TOQUE para voltar ao menu',
    victory_end:'Fim da campanha! Pressione ENTER/TOQUE',
    next_phase:'Pressione ENTER/TOQUE para próxima fase',
    rescued:'Resgatados', time:'Tempo', bonus:'Bônus', campaign_score:'Pontuação da campanha',
    lives:'Vidas', ammo:'Munição', npcs:'NPCs', target:'alvo', stage:'Fase', exit:'SAÍDA',
    level_unlocked:'Portão liberado! Corre pra saída antes que apareça mais assombração.',
    coop_join:'Nika entrou no coop local!', continue_msg:'voltou com um continue!', rescued_msg:'resgatado!',
    villain_name:'Barão do Entulho', mission_prefix:'Missão do momento:',
    story_1:'Apagou tudo de uma vez... e agora tem zumbi, fantasma e até pombo estranho fazendo plantão na rua. Isso já passou muito do normal.',
    story_2:'Eu falei: quando junta lixo tóxico, laboratório clandestino e guru picareta da internet, o resultado nunca é "tranquilo".',
    story_3:'Cidadãos do caos, apreciem minha obra! Em poucos minutos, a cidade inteira vai virar um condomínio assombrado premium!',
    story_4:'Premium? O ônibus sumiu, o poste explodiu e o cachorro do seu Zeca tá brilhando no escuro. Isso aí é golpe sobrenatural.',
    story_5:'Respira, herói. A regra é clara: salvar a galera, catar item útil e descer a porrada no apocalipse improvisado.',
    story_6:'Então fechou. Hoje a quebrada não cai. E se cair, a gente levanta no continue.',
    stage_intro_2:'Plano simples: salva o povo, pega o que prestar e não vira almoço de assombração.'
  },
  en: {
    splash_press:'Press ENTER / TAP to start',
    menu_new:'New Game', menu_continue:'Continue', menu_language:'Language', menu_options:'Options', menu_controls:'Controls', menu_credits:'Credits',
    menu_tagline:'Brazilian arcade top-down • keyboard • mouse • gamepad • touch',
    title_options:'OPTIONS', title_controls:'CONTROLS', title_credits:'CREDITS', title_language:'SELECT LANGUAGE',
    music:'Music', sfx:'Effects', back:'Back',
    options_hint:'Use ←/→ to adjust volume.',
    controls_1:'P1: WASD or arrows to move | Click/Space shoots in current facing direction',
    controls_2:'Q switch weapon | E interact/rescue | ESC pause',
    controls_3:'P2: press C to join | IJKL move | U shoot | O switch weapon',
    controls_4:'Gamepad: left stick move | A/RT shoot | RB switch | B interact',
    controls_5:'Touch: virtual stick on the left and buttons on the right',
    press_back:'Press ENTER or tap to go back.',
    credits_1:'Created, directed and reviewed by Felipe.', credits_2:'Design, code, PNG sprites and WAV audio generated procedurally in this package.', credits_3:'No SVG and no copied content from existing works.', credits_4:'Original identity: Brazilian comedic horror with a retro 16-bit/32-bit vibe.',
    continue_hint:'ENTER / SPACE / TAP to continue',
    gameover_return:'Press ENTER/TAP to return to the menu',
    victory_end:'Campaign complete! Press ENTER/TAP',
    next_phase:'Press ENTER/TAP for the next stage',
    rescued:'Rescued', time:'Time', bonus:'Bonus', campaign_score:'Campaign score',
    lives:'Lives', ammo:'Ammo', npcs:'NPCs', target:'target', stage:'Stage', exit:'EXIT',
    level_unlocked:'Gate unlocked! Run to the glowing exit.',
    coop_join:'Nika joined local co-op!', continue_msg:'came back with a continue!', rescued_msg:'rescued!',
    villain_name:'Baron Trash', mission_prefix:'Current mission:',
    story_1:'The whole block blacked out at once... and now there are zombies, ghosts, and even weird pigeons patrolling the street. This is way beyond normal.',
    story_2:'I told you: when toxic waste, a secret lab, and a scammy internet guru get together, the result is never "fine".',
    story_3:'Citizens of chaos, behold my masterpiece! In just a few minutes, this whole city will become a premium haunted condo!',
    story_4:'Premium? The bus vanished, the streetlight exploded, and Mr. Zeca’s dog is glowing in the dark. That is a supernatural scam.',
    story_5:'Breathe, hero. The plan is simple: rescue the people, grab useful junk, and beat up this improvised apocalypse.',
    story_6:'Then it’s settled. The neighborhood is not going down tonight. And if it does, we are getting back up on a continue.',
    stage_intro_2:'Simple plan: rescue people, grab useful junk, and do not become supernatural lunch.'
  },
  ru: {
    splash_press:'Нажмите ENTER / коснитесь, чтобы начать',
    menu_new:'Новая игра', menu_continue:'Продолжить', menu_language:'Язык', menu_options:'Настройки', menu_controls:'Управление', menu_credits:'Авторы',
    menu_tagline:'Бразильский top-down arcade • клавиатура • мышь • геймпад • touch',
    title_options:'НАСТРОЙКИ', title_controls:'УПРАВЛЕНИЕ', title_credits:'АВТОРЫ', title_language:'ВЫБОР ЯЗЫКА',
    music:'Музыка', sfx:'Эффекты', back:'Назад',
    options_hint:'Используйте ←/→ для громкости.',
    controls_1:'P1: WASD или стрелки для движения | Клик/Пробел стреляют по текущему направлению',
    controls_2:'Q смена оружия | E взаимодействие/спасение | ESC пауза',
    controls_3:'P2: нажмите C чтобы войти | IJKL движение | U выстрел | O смена оружия',
    controls_4:'Геймпад: левый стик движение | A/RT выстрел | RB смена | B действие',
    controls_5:'Touch: виртуальный стик слева и кнопки справа',
    press_back:'Нажмите ENTER или коснитесь, чтобы вернуться.',
    credits_1:'Создание, режиссура и проверка: Felipe.', credits_2:'Дизайн, код, PNG-спрайты и WAV-аудио процедурно созданы в этом пакете.', credits_3:'Без SVG и без копирования существующих произведений.', credits_4:'Оригинальный стиль: бразильский комедийный хоррор с ретро вайбом 16/32-bit.',
    continue_hint:'ENTER / ПРОБЕЛ / КАСАНИЕ чтобы продолжить',
    gameover_return:'Нажмите ENTER/касание для возврата в меню',
    victory_end:'Кампания завершена! Нажмите ENTER/касание',
    next_phase:'Нажмите ENTER/касание для следующего этапа',
    rescued:'Спасено', time:'Время', bonus:'Бонус', campaign_score:'Счёт кампании',
    lives:'Жизни', ammo:'Патроны', npcs:'NPC', target:'цель', stage:'Этап', exit:'ВЫХОД',
    level_unlocked:'Выход открыт! Бегите к сияющему выходу.',
    coop_join:'Nika присоединилась к локальному коопу!', continue_msg:'вернулся с continue!', rescued_msg:'спасён!',
    villain_name:'Барон Хлама', mission_prefix:'Текущая задача:',
    story_1:'Во всём районе внезапно погас свет... а теперь по улице бродят зомби, призраки и даже какие-то странные голуби. Это уже совсем ненормально.',
    story_2:'Я же говорила: если смешать токсичные отходы, подпольную лабораторию и мошенника-гуру из интернета, ничего "спокойного" не выйдет.',
    story_3:'Граждане хаоса, любуйтесь моим шедевром! Ещё немного — и весь город превратится в элитный дом с привидениями!',
    story_4:'Элитный? Автобус исчез, фонарь взорвался, а пёс дяди Зеки светится в темноте. Это какой-то сверхъестественный развод.',
    story_5:'Спокойнее, герой. План простой: спасаем людей, хватаем всё полезное и ломаем этот импровизированный апокалипсис.',
    story_6:'Значит так. Сегодня район не падёт. А если и падёт — мы поднимемся на continue.',
    stage_intro_2:'План простой: спасаем людей, берём всё полезное и не становимся обедом для нечисти.'
  }
};
const LEVEL_TEXT = {
  pt: { names:['Rua do Bairro','Feira Maldita','Escola em Pânico','Cemitério da Vila','Praça dos Pombos Possuídos','Condomínio do Inferno','Shopping Fantasma','Favela em Chamas','Metrô Interrompido','Praia Assombrada','Festa Junina dos Mortos','Laboratório do Barão'], objectives:['Resgate os vizinhos e ache a saída.','Salve a feira antes do pastel morder.','Pegue a chave e tire a turma dali.','Derrube o caminhão possuído.','Limpe a praça dos pombos do além.','Ache a garagem e encare o jacaré.','Tire o povo da liquidação eterna.','Apague o fogo e a rainha mosquito.','Atravesse antes do atraso eterno.','Salve a praia da maré fantasma.','Pare o arraial necromante.','Derrote o Barão e feche o rasgo.'] },
  en: { names:['Neighborhood Street','Cursed Market','School Panic','Village Cemetery','Possessed Pigeon Square','Condo of Doom','Haunted Mall','Favela in Flames','Metro Shutdown','Haunted Beach','Festival of the Dead','Baron Lab'], objectives:['Rescue the neighbors and find the exit.','Save the market before snacks bite back.','Grab the key and rescue the class.','Defeat the possessed garbage truck.','Clear the square of ghost pigeons.','Find the garage and face the alligator.','Free shoppers from the eternal sale.','Stop the fire and mosquito queen.','Cross before the eternal delay.','Save the beach from the ghost tide.','Shut down the undead festival.','Defeat the Baron and seal the rift.'] },
  ru: { names:['Улица района','Проклятый рынок','Школа в панике','Кладбище','Площадь голубей','Адский комплекс','Призрачный ТЦ','Фавела в огне','Метро закрыто','Пляж с призраками','Праздник мёртвых','Лаборатория Барона'], objectives:['Спасите соседей и найдите выход.','Спасите рынок от злых закусок.','Возьмите ключ и спасите класс.','Победите одержимый мусоровоз.','Очистите площадь от голубей-призраков.','Найдите гараж и бейте аллигатора.','Выведите людей из вечной распродажи.','Потушите огонь и королеву комаров.','Перейдите пути без вечной задержки.','Спасите пляж от призрачной волны.','Остановите праздник мертвецов.','Победите Барона и закройте разлом.'] }
};
function tx(game,key){ return (I18N[game.lang] && I18N[game.lang][key]) || I18N.pt[key] || key; }
function speakerName(game,id){
  if(id==='felipe') return 'Felipe';
  if(id==='nika') return 'Nika';
  if(id==='villain') return tx(game,'villain_name');
  return id;
}
function levelNameFor(game, idx){ return (LEVEL_TEXT[game.lang] && LEVEL_TEXT[game.lang].names[idx]) || LEVELS[idx].name; }
function levelObjectiveFor(game, idx){ return (LEVEL_TEXT[game.lang] && LEVEL_TEXT[game.lang].objectives[idx]) || LEVELS[idx].objective; }

function mulberry32(seed){ return function(){ let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function dirIndexFromVec(x,y){
  if (Math.abs(x) < .15 && Math.abs(y) < .15) return 0;
  const ang = Math.atan2(y, x); // E=0
  const oct = Math.round(((ang + Math.PI*2) % (Math.PI*2)) / (Math.PI/4)) % 8;
  return [2,1,0,7,6,5,4,3][oct];
}
function circleRectHit(cx,cy,cr,rx,ry,rw,rh){
  const px = clamp(cx, rx, rx+rw), py = clamp(cy, ry, ry+rh);
  return Math.hypot(cx-px, cy-py) < cr;
}
const UI_I18N = {
  pt:{
    studioPresents:'apresenta', splashPress:'Pressione ENTER, clique ou toque para continuar', pauseTitle:'PAUSE', resume:'Continuar', titleScreen:'Tela de título', introCards:['Em uma noite comum, a quebrada ficou sem luz... menos os prédios, que começaram a piscar sozinhos.','Um laboratório barato abriu um rasgo sobrenatural sem pedir alvará.','Agora Felipe e Nika precisam salvar geral antes que o caos vire rotina.'],
    selectLanguage:'SELECIONE O IDIOMA',
    languageHint:'Você pode trocar o idioma depois em Opções.',
    newGame:'Novo Jogo', continue:'Continuar', achievements:'Conquistas', options:'Opções', controls:'Controles', credits:'Créditos', pauseTitle:'PAUSADO', returnTitle:'Voltar à Tela de Título', achievementsTitle:'CONQUISTAS', locked:'Bloqueada', achievementUnlocked:'Conquista desbloqueada!', hpRecover:'recuperou vida!', energyBoost:'energia na veia!', picked:'pegou', bossDefeated:'Chefão derrotado! O povo agradece.',
    music:'Música', sfx:'Efeitos', language:'Idioma', back:'Voltar',
    titleFooter:'Arcade brasileiro de terror cômico • 1 ou 2 jogadores • teclado • gamepad • touch',
    controlsTitle:'CONTROLES', creditsTitle:'CRÉDITOS', optionsTitle:'OPÇÕES',
    controlsLines:[
      'P1: WASD ou setas para mover | Clique/Espaço atira na direção atual',
      'Q troca arma | E interage/resgata | ESC pausa',
      'P2: pressione C para entrar | IJKL move | U atira | O troca arma',
      'Gamepad: analógico move | A/RT atira | RB troca | B interage',
      'Touch: analógico virtual à esquerda e botões à direita'
    ],
    controlsBack:'Pressione ENTER ou toque para voltar.',
    creditsLines:['De Felipe'],
    gameoverSub:'Pressione ENTER/TOQUE para voltar ao menu',
    victorySub:'Fim da campanha! Pressione ENTER/TOQUE',
    nextPhase:'Pressione ENTER/TOQUE para próxima fase',
    exit:'SAÍDA', lives:'Vidas', ammo:'Munição', npcs:'NPCs', target:'alvo', stage:'Fase',
    chooseLanguagePt:'Português do Brasil', chooseLanguageEn:'English', chooseLanguageRu:'Русский',
    optionHint:'Use ←/→ para ajustar. ENTER alterna a opção selecionada.'
  },
  en:{
    studioPresents:'presents', splashPress:'Press ENTER, click or tap to continue', pauseTitle:'PAUSE', resume:'Resume', titleScreen:'Title screen', introCards:['On an ordinary night, the whole neighborhood went dark... except the buildings blinking on their own.','A cheap secret lab opened a supernatural rift without a permit.','Now Felipe and Nika must rescue everyone before chaos becomes routine.'],
    selectLanguage:'SELECT LANGUAGE',
    languageHint:'You can change the language later in Options.',
    newGame:'New Game', continue:'Continue', achievements:'Achievements', options:'Options', controls:'Controls', credits:'Credits', pauseTitle:'PAUSED', returnTitle:'Return to Title Screen', achievementsTitle:'ACHIEVEMENTS', locked:'Locked', achievementUnlocked:'Achievement unlocked!', hpRecover:'recovered health!', energyBoost:'energy boost!', picked:'picked up', bossDefeated:'Boss defeated! The people thank you.',
    music:'Music', sfx:'SFX', language:'Language', back:'Back',
    titleFooter:'8-way movement • shooting follows facing direction • keyboard • gamepad • touch',
    controlsTitle:'CONTROLS', creditsTitle:'CREDITS', optionsTitle:'OPTIONS',
    controlsLines:[
      'P1: WASD or arrows to move | Click/Space shoots in current facing direction',
      'Q changes weapon | E interacts/rescues | ESC pauses',
      'P2: press C to join | IJKL moves | U shoots | O changes weapon',
      'Gamepad: left stick moves | A/RT shoots | RB swaps | B interacts',
      'Touch: virtual stick on the left and action buttons on the right'
    ],
    controlsBack:'Press ENTER or tap to go back.',
    creditsLines:['By Felipe'],
    gameoverSub:'Press ENTER/TAP to return to the menu',
    victorySub:'Campaign cleared! Press ENTER/TAP',
    nextPhase:'Press ENTER/TAP for the next stage',
    exit:'EXIT', lives:'Lives', ammo:'Ammo', npcs:'NPCs', target:'goal', stage:'Stage',
    chooseLanguagePt:'Português do Brasil', chooseLanguageEn:'English', chooseLanguageRu:'Русский',
    optionHint:'Use ←/→ to adjust. Press ENTER to toggle the selected option.'
  },
  ru:{
    studioPresents:'представляет', splashPress:'Нажмите ENTER, щёлкните или коснитесь, чтобы продолжить', pauseTitle:'ПАУЗА', resume:'Продолжить', titleScreen:'Титульный экран', introCards:['Обычной ночью район погрузился во тьму... кроме домов, где окна начали мигать сами.','Дешёвая тайная лаборатория открыла сверхъестественный разлом без разрешения.','Теперь Felipe и Nika должны спасти всех, пока хаос не стал нормой.'],
    selectLanguage:'ВЫБЕРИТЕ ЯЗЫК',
    languageHint:'Позже язык можно изменить в настройках.',
    newGame:'Новая игра', continue:'Продолжить', achievements:'Достижения', options:'Настройки', controls:'Управление', credits:'Авторы', pauseTitle:'ПАУЗА', returnTitle:'Вернуться к титульному экрану', achievementsTitle:'ДОСТИЖЕНИЯ', locked:'Закрыто', achievementUnlocked:'Достижение открыто!', hpRecover:'восстановил здоровье!', energyBoost:'заряд энергии!', picked:'подобрал', bossDefeated:'Босс побеждён! Люди благодарны.',
    music:'Музыка', sfx:'Эффекты', language:'Язык', back:'Назад',
    titleFooter:'8 направлений • выстрел по направлению персонажа • клавиатура • геймпад • touch',
    controlsTitle:'УПРАВЛЕНИЕ', creditsTitle:'АВТОРЫ', optionsTitle:'НАСТРОЙКИ',
    controlsLines:[
      'P1: WASD или стрелки для движения | Клик/Пробел стреляют по направлению',
      'Q меняет оружие | E взаимодействие/спасение | ESC пауза',
      'P2: нажмите C для входа | IJKL движение | U выстрел | O смена оружия',
      'Геймпад: левый стик движется | A/RT стреляет | RB меняет | B действие',
      'Touch: виртуальный стик слева и кнопки действий справа'
    ],
    controlsBack:'Нажмите ENTER или коснитесь, чтобы вернуться.',
    creditsLines:['Felipe'],
    gameoverSub:'Нажмите ENTER/касание, чтобы вернуться в меню',
    victorySub:'Кампания пройдена! Нажмите ENTER/касание',
    nextPhase:'Нажмите ENTER/касание для следующего этапа',
    exit:'ВЫХОД', lives:'Жизни', ammo:'Патроны', npcs:'NPC', target:'цель', stage:'Этап',
    chooseLanguagePt:'Português do Brasil', chooseLanguageEn:'English', chooseLanguageRu:'Русский',
    optionHint:'Используйте ←/→ для настройки. ENTER переключает выбранную опцию.'
  }
};

class Loader {
  constructor(){ this.images={}; this.audio={}; this.total=0; this.done=0; }
  addImage(key,path){ this.total++; const img=new Image(); img.onload=()=>this.done++; img.onerror=()=>{console.warn('Falha imagem',path); this.done++;}; img.src=path; this.images[key]=img; }
  addAudio(key,path){ this.total++; const a=new Audio(); a.preload='auto'; a.oncanplaythrough=()=>{ if(!a._loaded){a._loaded=true; this.done++;} }; a.onerror=()=>{console.warn('Falha áudio',path); this.done++;}; a.src=path; this.audio[key]=a; setTimeout(()=>{ if(!a._loaded){a._loaded=true; this.done++;} },1800); }
  get progress(){ return this.total ? this.done/this.total : 1; }
}

class AudioBus {
  constructor(loader){ this.loader=loader; this.musicVolume=Number(localStorage.znq_music ?? .55); this.sfxVolume=Number(localStorage.znq_sfx ?? .75); this.current=null; this.muted=false; }
  save(){ localStorage.znq_music=this.musicVolume; localStorage.znq_sfx=this.sfxVolume; }
  playMusic(name){
    const a=this.loader.audio['music/'+name];
    if(!a) return; if(this.current===a){ if(a.paused) a.play().catch(()=>{}); return; }
    if(this.current){ this.current.pause(); this.current.currentTime=0; }
    this.current=a; a.loop=true; a.volume=this.musicVolume; a.play().catch(()=>{});
  }
  stopMusic(){ if(this.current){ this.current.pause(); this.current.currentTime=0; this.current=null; } }
  sfx(name, vol=1){ const src=this.loader.audio['sfx/'+name]; if(!src) return; try{ const a=src.cloneNode(); a.volume=clamp(this.sfxVolume*vol,0,1); a.play().catch(()=>{}); }catch{} }
  updateVolumes(){ if(this.current) this.current.volume=this.musicVolume; this.save(); }
}

class Input {
  constructor(canvas){
    this.canvas=canvas; this.keys=new Set(); this.pressed=new Set(); this.mouse={x:0,y:0,down:false,clicked:false};
    this.touchActive=false; this.joy={id:null,active:false,x:0,y:0,dx:0,dy:0}; this.buttons={shoot:false,switch:false,item:false,pause:false};
    this.gpPrev=[]; this.gpAxisLatch={};
    window.addEventListener('keydown', e=>{ if(!this.keys.has(e.code)) this.pressed.add(e.code); this.keys.add(e.code); if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); });
    window.addEventListener('keyup', e=>this.keys.delete(e.code));
    canvas.addEventListener('mousemove', e=>this.setMouse(e));
    canvas.addEventListener('mousedown', e=>{ this.setMouse(e); this.mouse.down=true; this.mouse.clicked=true; });
    window.addEventListener('mouseup', ()=>this.mouse.down=false);
    canvas.addEventListener('touchstart', e=>this.touch(e), {passive:false});
    canvas.addEventListener('touchmove', e=>this.touch(e), {passive:false});
    canvas.addEventListener('touchend', e=>this.touch(e), {passive:false});
    canvas.addEventListener('touchcancel', e=>this.touch(e), {passive:false});
  }
  setMouse(e){ const r=this.canvas.getBoundingClientRect(); this.mouse.x=(e.clientX-r.left)*GAME_W/r.width; this.mouse.y=(e.clientY-r.top)*GAME_H/r.height; }
  touch(e){
    e.preventDefault(); this.touchActive=true; this.buttons={shoot:false,switch:false,item:false,pause:false};
    const r=this.canvas.getBoundingClientRect(); const touches=[...e.touches];
    let joySeen=false;
    for(const t of touches){
      const x=(t.clientX-r.left)*GAME_W/r.width, y=(t.clientY-r.top)*GAME_H/r.height;
      if(x<GAME_W*0.45){
        joySeen=true; if(!this.joy.active){ this.joy.x=x; this.joy.y=y; }
        this.joy.active=true; const dx=x-this.joy.x, dy=y-this.joy.y; const l=Math.hypot(dx,dy), m=58; this.joy.dx=clamp(dx/m,-1,1); this.joy.dy=clamp(dy/m,-1,1); if(l>m){ this.joy.x=x-dx/l*m; this.joy.y=y-dy/l*m; }
      } else {
        const defs=this.touchButtonDefs();
        for(const b of defs){ if(Math.hypot(x-b.x,y-b.y)<b.r) this.buttons[b.id]=true; }
      }
    }
    if(!joySeen){ this.joy.active=false; this.joy.dx=0; this.joy.dy=0; }
    if(touches[0]){ this.mouse.x=(touches[0].clientX-r.left)*GAME_W/r.width; this.mouse.y=(touches[0].clientY-r.top)*GAME_H/r.height; }
  }
  touchButtonDefs(){ return [
    {id:'shoot',x:850,y:405,r:54,label:'ATIRAR'}, {id:'switch',x:758,y:423,r:38,label:'TROCAR'},
    {id:'item',x:835,y:310,r:38,label:'AÇÃO'}, {id:'pause',x:910,y:45,r:30,label:'II'}
  ]; }
  pollGamepads(){ this.gps = Array.from(navigator.getGamepads?.() || []); }
  gpButtonPressed(btn,pad=0){ const gp=this.gps?.[pad]; if(!gp) return false; const cur=!!gp.buttons?.[btn]?.pressed; const prev=!!(this.gpPrev[pad]?.buttons?.[btn]); return cur && !prev; }
  gpButtonDown(btn,pad=0){ const gp=this.gps?.[pad]; return !!gp?.buttons?.[btn]?.pressed; }
  gpAxisTap(axis,dir,pad=0,threshold=.55){ const gp=this.gps?.[pad]; if(!gp) return false; const v=gp.axes?.[axis] || 0; const key=`${pad}_${axis}_${dir}`; const active = dir>0 ? v>threshold : v<-threshold; const prev = !!this.gpAxisLatch[key]; this.gpAxisLatch[key]=active; return active && !prev; }
  commitGamepadState(){ this.gpPrev = (this.gps||[]).map(gp=>({buttons:(gp?.buttons||[]).map(b=>!!b.pressed)})); }
  consume(code){ if(this.pressed.has(code)){ this.pressed.delete(code); return true; } return false; }
  anyConfirm(){ return this.consume('Enter') || this.consume('Space') || this.mouse.clicked || this.buttons.shoot || this.gpButtonPressed(0) || this.gpButtonPressed(9); }
  anyBack(){ return this.consume('Escape') || this.gpButtonPressed(1) || this.gpButtonPressed(8); }
  navDown(){ return this.consume('ArrowDown') || this.consume('KeyS') || this.gpAxisTap(1,1) || this.gpAxisTap(7,1) || this.gpButtonPressed(13); }
  navUp(){ return this.consume('ArrowUp') || this.consume('KeyW') || this.gpAxisTap(1,-1) || this.gpAxisTap(7,-1) || this.gpButtonPressed(12); }
  navLeft(){ return this.consume('ArrowLeft') || this.consume('KeyA') || this.gpAxisTap(0,-1) || this.gpAxisTap(6,-1) || this.gpButtonPressed(14); }
  navRight(){ return this.consume('ArrowRight') || this.consume('KeyD') || this.gpAxisTap(0,1) || this.gpAxisTap(6,1) || this.gpButtonPressed(15); }
  endFrame(){ this.pressed.clear(); this.mouse.clicked=false; this.commitGamepadState(); }
}

class SpriteAnim {
  static row(anim, dir){ return ANIMS.indexOf(anim)*8 + dir; }
  static draw(ctx, img, x,y, frameSize, anim, dir, t, scale=1){
    const frames=ANIM_FRAMES[anim] || 4; const fps = anim==='idle'?5: anim==='death'?7:10;
    const col = Math.floor(t*fps)%frames; const row=SpriteAnim.row(anim,dir);
    ctx.drawImage(img, col*frameSize, row*frameSize, frameSize, frameSize, Math.round(x-frameSize*scale/2), Math.round(y-frameSize*scale/2), frameSize*scale, frameSize*scale);
  }
}

const ENEMY_STATS = {
  zumbi_bairro:{hp:30,speed:55,damage:12,score:100,behavior:'chase'}, noiva_fantasma:{hp:35,speed:70,damage:14,score:140,behavior:'phase'},
  cachorro_zumbi:{hp:22,speed:105,damage:10,score:120,behavior:'dash'}, rato_mutante:{hp:18,speed:95,damage:8,score:90,behavior:'swarm'},
  mosquito_mutante:{hp:16,speed:120,damage:8,score:110,behavior:'zigzag'}, palhaco_demonico:{hp:46,speed:64,damage:18,score:180,behavior:'throw'},
  boneco_posto:{hp:40,speed:50,damage:16,score:170,behavior:'chase'}, slime_toxico:{hp:36,speed:45,damage:11,score:130,behavior:'slime'},
  seguranca_possuido:{hp:55,speed:58,damage:18,score:190,behavior:'guard'}, motoqueiro_fantasma:{hp:45,speed:130,damage:20,score:220,behavior:'dash'},
  planta_quintal:{hp:38,speed:0,damage:12,score:150,behavior:'turret'}, fantasma_carnaval:{hp:32,speed:82,damage:13,score:160,behavior:'phase'}
};
const BOSS_STATS = {
  caminhao_lixo_possuido:{hp:560,speed:70,damage:25,score:2500}, jacare_esgoto_mutante:{hp:660,speed:85,damage:28,score:3000},
  rainha_mosquito:{hp:620,speed:95,damage:22,score:3200}, dj_necromante:{hp:720,speed:55,damage:24,score:3500}, barao_entulho:{hp:900,speed:65,damage:30,score:5000}
};
const WEAPONS = [
  {name:'Água Turbinada', item:'agua_turbinada', ammo:999, cooldown:.16, speed:440, damage:13, life:.85, effect:'water'},
  {name:'Chinelo Explosivo', item:'chinelo_explosivo', ammo:10, cooldown:.5, speed:300, damage:45, life:.9, explosion:70, effect:'explosion'},
  {name:'Rojão Junino', item:'rojao_junino', ammo:8, cooldown:.65, speed:360, damage:62, life:1.2, explosion:90, effect:'fire'},
  {name:'Spray com Fogo', item:'spray_fogo', ammo:80, cooldown:.07, speed:260, damage:7, life:.25, cone:true, effect:'fire'},
  {name:'Guaraná Explosivo', item:'guarana_explosivo', ammo:5, cooldown:.85, speed:220, damage:80, life:1.1, explosion:110, effect:'explosion'},
  {name:'Estilingue', item:'estilingue', ammo:30, cooldown:.22, speed:520, damage:18, life:.8, effect:'spark'}
];
const ACHIEVEMENTS = [
  {id:'first_rescue', title:{pt:'Primeiro Resgate',en:'First Rescue',ru:'Первое спасение'}, desc:{pt:'Resgate seu primeiro morador.',en:'Rescue your first resident.',ru:'Спасите первого жителя.'}},
  {id:'first_zombie', title:{pt:'Molhou, Caiu',en:'Soaked and Down',ru:'Мокрый и побеждённый'}, desc:{pt:'Derrote seu primeiro inimigo.',en:'Defeat your first enemy.',ru:'Победите первого врага.'}},
  {id:'five_rescues', title:{pt:'Mutirão de Resgate',en:'Rescue Crew',ru:'Команда спасения'}, desc:{pt:'Resgate 5 pessoas na campanha.',en:'Rescue 5 people in the campaign.',ru:'Спасите 5 человек за кампанию.'}},
  {id:'stage_clear', title:{pt:'Portão Liberado',en:'Gate Open',ru:'Ворота открыты'}, desc:{pt:'Conclua sua primeira fase.',en:'Clear your first stage.',ru:'Пройдите первый этап.'}},
  {id:'boss_down', title:{pt:'Chefão no Chão',en:'Boss on the Floor',ru:'Босс повержен'}, desc:{pt:'Derrote um chefe.',en:'Defeat a boss.',ru:'Победите босса.'}},
  {id:'coop_join', title:{pt:'Dupla Dinâmica',en:'Dynamic Duo',ru:'Динамичный дуэт'}, desc:{pt:'Chame Nika para o coop local.',en:'Bring Nika into local co-op.',ru:'Позовите Nika в локальный кооп.'}},
  {id:'arsenal', title:{pt:'Sacola de Tranqueira',en:'Junk Arsenal',ru:'Арсенал хлама'}, desc:{pt:'Pegue uma arma especial.',en:'Pick up a special weapon.',ru:'Подберите особое оружие.'}},
  {id:'half_campaign', title:{pt:'Meia Quebrada Salva',en:'Halfway Hero',ru:'Половина района'}, desc:{pt:'Chegue à metade da campanha.',en:'Reach the campaign halfway point.',ru:'Дойдите до середины кампании.'}},
  {id:'campaign_clear', title:{pt:'A Quebrada Vive',en:'The Hood Lives',ru:'Район жив'}, desc:{pt:'Finalize a campanha.',en:'Finish the campaign.',ru:'Завершите кампанию.'}}
];
const WEAPON_LABELS = {
  agua_turbinada:{pt:'Água Turbinada',en:'Turbo Water Blaster',ru:'Турбо-водомёт'},
  chinelo_explosivo:{pt:'Chinelo Explosivo',en:'Explosive Flip-Flop',ru:'Взрывной шлёпанец'},
  rojao_junino:{pt:'Rojão Junino',en:'Festival Rocket',ru:'Праздничная ракета'},
  spray_fogo:{pt:'Spray com Fogo',en:'Fire Spray',ru:'Огненный спрей'},
  guarana_explosivo:{pt:'Guaraná Explosivo',en:'Explosive Guaraná',ru:'Взрывная гуарана'},
  estilingue:{pt:'Estilingue',en:'Slingshot',ru:'Рогатка'}
};
const ITEM_LABELS = {
  kit_cura:{pt:'Kit de Cura',en:'First Aid Kit',ru:'Аптечка'},
  coxinha:{pt:'Coxinha',en:'Coxinha Snack',ru:'Кошинья'},
  caldo_cana:{pt:'Caldo de Cana',en:'Sugarcane Juice',ru:'Тростниковый сок'}
};


class Player {
  constructor(id, sprite, x,y){
    this.kind='player'; this.id=id; this.sprite=sprite; this.x=x; this.y=y; this.r=14; this.hp=100; this.maxHp=100; this.lives=3; this.speed=145;
    this.dir=0; this.aim={x:0,y:1}; this.anim='idle'; this.t=0; this.inv=0; this.cool=0; this.score=0; this.weapon=0; this.joined=true; this.dead=false; this.animLock=0;
    this.ammo=[999,4,4,40,3,20]; this.name=id===1?'Felipe':'Nika';
  }
}
class Enemy {
  constructor(type,x,y,level=0){ const st=ENEMY_STATS[type]||ENEMY_STATS.zumbi_bairro; Object.assign(this,{kind:'enemy',type,x,y,r:15,hp:st.hp+level*4,maxHp:st.hp+level*4,speed:st.speed+level*1.5,damage:st.damage,behavior:st.behavior,score:st.score,dir:0,anim:'idle',t:0,hit:0,cool:Math.random()*1.5,dead:false,phase:0}); }
}
class Boss {
  constructor(type,x,y,level=0){ const st=BOSS_STATS[type]; Object.assign(this,{kind:'boss',type,x,y,r:42,hp:st.hp,maxHp:st.hp,speed:st.speed,damage:st.damage,score:st.score,dir:0,anim:'idle',t:0,hit:0,cool:2,dead:false,phase:0}); }
}
class NPC {
  constructor(type,x,y){ Object.assign(this,{kind:'npc',type,x,y,r:14,dir:0,anim:'idle',t:0,rescued:false,panic:Math.random()*10}); }
}
class Projectile {
  constructor(x,y,vx,vy,weapon,owner){ Object.assign(this,{kind:'projectile',x,y,vx,vy,weapon,owner,life:weapon.life,r:weapon.cone?13:6,damage:weapon.damage,dead:false,t:0}); }
}
class Pickup { constructor(item,x,y){ Object.assign(this,{kind:'pickup',item,x,y,r:14,t:0,dead:false}); } }
class Effect { constructor(type,x,y,scale=1){ Object.assign(this,{type,x,y,t:0,life:.55,scale}); } }

class ZNQGame {
  constructor(){
    this.canvas=document.getElementById('game'); this.ctx=this.canvas.getContext('2d'); this.ctx.imageSmoothingEnabled=false;
    this.input=new Input(this.canvas); this.loader=new Loader(); this.audio=new AudioBus(this.loader); this.state='boot'; this.menuIndex=0; this.optionIndex=0; this.pauseIndex=0; this.lang=localStorage.znq_lang || 'pt'; this.langIndex=Math.max(0, LANGS.indexOf(this.lang)); this.last=0; this.time=0;
    this.camera={x:0,y:0}; this.levelIndex=Number(localStorage.znq_progress||0); this.campaignScore=0; this.stageTimer=0; this.message=''; this.messageTime=0;
    this.dialog=[]; this.dialogIndex=0; this.afterDialog=null; this.players=[]; this.p2Joined=false; this.brandTimer=0; this.introTimer=0; this.introStep=0; this.pauseIndex=0; this.achievementIndex=0; this.achievements=this.loadAchievements(); this.achievementToast=null; this.achievementToastTime=0; this.totalRescued=Number(localStorage.znq_total_rescued||0);
    this.loadAssets(); requestAnimationFrame(t=>this.loop(t));
  }
  tr(key){ const dict=UI_I18N[this.lang] || UI_I18N.pt; return dict[key] ?? UI_I18N.pt[key] ?? key; }
  trList(key){ const dict=UI_I18N[this.lang] || UI_I18N.pt; return dict[key] ?? UI_I18N.pt[key] ?? []; }
  menuItems(){ return [this.tr('newGame'), this.tr('continue'), this.tr('achievements'), this.tr('options'), this.tr('controls'), this.tr('credits')]; }
  setLanguage(code){ this.lang=code; this.langIndex=Math.max(0, LANGS.indexOf(code)); localStorage.znq_lang=code; }
  loadAchievements(){ try{ return JSON.parse(localStorage.znq_achievements||'{}') || {}; }catch{ return {}; } }
  saveAchievements(){ localStorage.znq_achievements=JSON.stringify(this.achievements); }
  achText(a,field){ return (a[field] && (a[field][this.lang] || a[field].en || a[field].pt)) || ''; }
  weaponName(w){ const l=WEAPON_LABELS[w.item]; return l ? (l[this.lang]||l.en||w.name) : w.name; }
  itemName(id){ const l=ITEM_LABELS[id]; return l ? (l[this.lang]||l.en||friendlyName(id)) : friendlyName(id); }
  unlockAchievement(id){ const a=ACHIEVEMENTS.find(x=>x.id===id); if(!a || this.achievements[id]) return; this.achievements[id]=Date.now(); this.saveAchievements(); this.achievementToast=a; this.achievementToastTime=3.2; this.audio.sfx('rescue',.7); }
  loadAssets(){
    const L=this.loader;
    L.addImage('tiles','assets/images/tilesets/tiles_brasil.png'); L.addImage('props','assets/images/props/props_brasil.png'); L.addImage('items','assets/images/items/items_brasil.png'); L.addImage('effects','assets/images/effects/effects_brasil.png');
    ['menu_bg','logo','loading','victory','gameover','studio','intro1','intro2','intro3'].forEach(n=>L.addImage('ui/'+n,`assets/images/ui/${n}.png`));
    for(const [cat,names] of Object.entries(MAN.sprites)){
      const folder=cat==='protagonists'?'protagonists':cat==='enemies'?'enemies':cat==='npcs'?'npcs':'bosses';
      for(const n of names) L.addImage(`${cat}/${n}`,`assets/images/sprites/${folder}/${n}.png`);
    }
    const allPortraits=[...MAN.sprites.protagonists,...MAN.sprites.enemies,...MAN.sprites.npcs,...MAN.sprites.bosses];
    [...new Set(allPortraits)].forEach(n=>L.addImage('portrait/'+n,`assets/images/portraits/${n}.png`));
    ['menu_malandro_assombrado','fase_rua_treta','feira_maldita','escola_pancada','cemiterio_samba_sombrio','praia_assombrada','laboratorio_final','boss_pancadao_oculto','vitoria','gameover'].forEach(n=>L.addAudio('music/'+n,`assets/audio/music/${n}.wav`));
    ['shoot','pickup','explosion','hit','rescue','zombie','click','door','splash','boss_roar'].forEach(n=>L.addAudio('sfx/'+n,`assets/audio/sfx/${n}.wav`));
  }
  loop(ts){
    try{
      const dt=Math.min(.033,(ts-this.last)/1000 || .016); this.last=ts; this.time+=dt; this.input.pollGamepads(); this.update(dt); this.draw(); this.input.endFrame();
    }catch(err){
      console.error('ZNQ runtime error:', err);
      this.runtimeError = err?.message || String(err);
      this.state='error';
      this.draw();
    }
    requestAnimationFrame(t=>this.loop(t));
  }
  update(dt){
    if(this.state==='boot' && this.loader.progress>=1){ this.state='studio'; this.brandTimer=0; this.audio.playMusic('menu_malandro_assombrado'); }
    if(this.messageTime>0) this.messageTime-=dt; if(this.achievementToastTime>0) this.achievementToastTime-=dt;
    if(this.state==='studio') this.updateStudio(dt);
    else if(this.state==='openingIntro') this.updateOpeningIntro(dt);
    else if(this.state==='splash') this.updateSplash();
    else if(this.state==='menu') this.updateMenu();
    else if(this.state==='language') this.updateLanguage();
    else if(this.state==='options') this.updateOptions();
    else if(this.state==='controls' || this.state==='credits') this.updateBackOnly();
    else if(this.state==='achievements') this.updateAchievements();
    else if(this.state==='pause') this.updatePauseMenu();
    else if(this.state==='cutscene') this.updateCutscene();
    else if(this.state==='playing') this.updateGame(dt);
    else if(this.state==='pause') this.updatePause();
    else if(this.state==='clear' || this.state==='gameover' || this.state==='victory') this.updateEndScreens();
  }

  updateStudio(dt){ this.brandTimer+=dt; if(this.brandTimer>2.8 || this.input.anyConfirm()){ this.audio.sfx('click',.35); this.state='openingIntro'; this.introTimer=0; this.introStep=0; } }
  updateOpeningIntro(dt){ const cards=this.trList('introCards'); this.introTimer+=dt; if(this.input.anyConfirm() || this.introTimer>3.2){ this.audio.sfx('click',.25); this.introTimer=0; this.introStep++; if(this.introStep>=cards.length){ this.state='splash'; } } }
  updateSplash(){ if(this.input.anyConfirm()){ this.audio.sfx('click'); this.state='language'; } }
  updateLanguage(){
    const items=LANGS;
    if(this.input.navDown()||this.input.navRight()){ this.langIndex=(this.langIndex+1)%items.length; this.audio.sfx('click',.4); }
    if(this.input.navUp()||this.input.navLeft()){ this.langIndex=(this.langIndex+items.length-1)%items.length; this.audio.sfx('click',.4); }
    if(this.input.anyConfirm()){ this.setLanguage(LANGS[this.langIndex]); this.audio.sfx('click'); this.state='menu'; }
    if(this.input.anyBack()) this.state='menu';
  }
  startNew(){
    this.audio.sfx('click'); this.levelIndex=0; this.campaignScore=0; this.p2Joined=false; this.players=[];
    localStorage.znq_progress=0;
    this.showDialog([
      ['leo_mandacaru',speakerName(this,'felipe'),tx(this,'story_1')],
      ['bia_faisca',speakerName(this,'nika'),tx(this,'story_2')],
      ['barao_entulho',speakerName(this,'villain'),tx(this,'story_3')],
      ['leo_mandacaru',speakerName(this,'felipe'),tx(this,'story_4')],
      ['bia_faisca',speakerName(this,'nika'),tx(this,'story_5')],
      ['leo_mandacaru',speakerName(this,'felipe'),tx(this,'story_6')]
    ], ()=>this.loadLevel(0));
  }
  continueGame(){ this.audio.sfx('click'); this.levelIndex=Number(localStorage.znq_progress||0); this.showLevelIntro(()=>this.loadLevel(this.levelIndex)); }
  showLevelIntro(cb){
    this.showDialog([
      ['leo_mandacaru',speakerName(this,'felipe'),`${tx(this,'stage')} ${this.levelIndex+1}: ${levelNameFor(this,this.levelIndex)}. ${tx(this,'mission_prefix')} ${levelObjectiveFor(this,this.levelIndex)}`],
      ['bia_faisca',speakerName(this,'nika'),tx(this,'stage_intro_2')]
    ], cb);
  }
  showDialog(lines, cb){ this.dialog=lines; this.dialogIndex=0; this.afterDialog=cb; this.state='cutscene'; this.audio.playMusic('menu_malandro_assombrado'); }
  updateCutscene(){ if(this.input.anyConfirm()){ this.audio.sfx('click'); this.dialogIndex++; if(this.dialogIndex>=this.dialog.length){ const cb=this.afterDialog; this.afterDialog=null; if(cb) cb(); else this.state='menu'; } } }
  updateMenu(){
    const items=this.menuItems();
    if(this.input.navDown()){this.menuIndex=(this.menuIndex+1)%items.length; this.audio.sfx('click',.4);} 
    if(this.input.navUp()){this.menuIndex=(this.menuIndex+items.length-1)%items.length; this.audio.sfx('click',.4);} 
    if(this.input.mouse.clicked){ const hit=this.menuHit(items); if(hit>=0){ this.menuIndex=hit; this.activateMenu(); } }
    if(this.input.anyConfirm()) this.activateMenu();
  }
  menuHit(items){ const mx=this.input.mouse.x, my=this.input.mouse.y; for(let i=0;i<items.length;i++){ const y=258+i*34; if(mx>320&&mx<640&&my>y-25&&my<y+10) return i; } return -1; }
  activateMenu(){ const i=this.menuIndex; if(i===0)this.startNew(); else if(i===1)this.continueGame(); else if(i===2){this.state='achievements';this.achievementIndex=0;} else if(i===3){this.state='options';this.optionIndex=0;} else if(i===4)this.state='controls'; else if(i===5)this.state='credits'; }
  updateOptions(){
    if(this.input.anyBack()){this.state='menu'; return;}
    if(this.input.navDown()) this.optionIndex=(this.optionIndex+1)%4;
    if(this.input.navUp()) this.optionIndex=(this.optionIndex+3)%4;
    const d=this.input.navRight()? .05 : this.input.navLeft()? -.05 : 0;
    if(d){
      if(this.optionIndex===0) this.audio.musicVolume=clamp(this.audio.musicVolume+d,0,1);
      if(this.optionIndex===1) this.audio.sfxVolume=clamp(this.audio.sfxVolume+d,0,1);
      if(this.optionIndex===2) this.setLanguage(LANGS[(this.langIndex + (d>0?1:LANGS.length-1))%LANGS.length]);
      this.audio.updateVolumes(); this.audio.sfx('click',.4);
    }
    if(this.input.anyConfirm() || this.input.mouse.clicked){
      if(this.optionIndex===2){ this.setLanguage(LANGS[(this.langIndex+1)%LANGS.length]); this.audio.sfx('click',.4); }
      if(this.optionIndex===3)this.state='menu';
    }
  }
  updateAchievements(){
    if(this.input.navDown()){ this.achievementIndex=(this.achievementIndex+1)%ACHIEVEMENTS.length; this.audio.sfx('click',.35); }
    if(this.input.navUp()){ this.achievementIndex=(this.achievementIndex+ACHIEVEMENTS.length-1)%ACHIEVEMENTS.length; this.audio.sfx('click',.35); }
    if(this.input.anyConfirm()||this.input.anyBack()){ this.audio.sfx('click'); this.state='menu'; }
  }
  updateBackOnly(){ if(this.input.anyConfirm()||this.input.anyBack()){ this.audio.sfx('click'); this.state='menu'; } }
  updatePauseMenu(){
    const items=[this.tr('continue'), this.tr('returnTitle')];
    if(this.input.navDown()||this.input.navRight()){ this.pauseIndex=(this.pauseIndex+1)%items.length; this.audio.sfx('click',.4); }
    if(this.input.navUp()||this.input.navLeft()){ this.pauseIndex=(this.pauseIndex+items.length-1)%items.length; this.audio.sfx('click',.4); }
    if(this.input.consume('Escape')||this.input.buttons.pause||this.input.gpButtonPressed(9)||this.input.gpButtonPressed(8)||this.input.anyBack()){ this.audio.sfx('click',.35); this.state='playing'; return; }
    if(this.input.anyConfirm()){
      this.audio.sfx('click');
      if(this.pauseIndex===0){ this.state='playing'; }
      else { this.state='menu'; this.audio.playMusic('menu_malandro_assombrado'); }
    }
  }
  updateEndScreens(){ if(this.input.anyConfirm()||this.input.gpButtonPressed(9)){ this.audio.sfx('click'); if(this.state==='clear'){ this.nextLevel(); } else { this.state='menu'; this.audio.playMusic('menu_malandro_assombrado'); } } }
  nextLevel(){
    this.levelIndex++;
    if(this.levelIndex>=LEVELS.length){ this.unlockAchievement('campaign_clear'); this.state='victory'; this.audio.playMusic('vitoria'); localStorage.znq_progress=0; return; }
    localStorage.znq_progress=this.levelIndex; if(this.levelIndex>=Math.floor(LEVELS.length/2)) this.unlockAchievement('half_campaign'); this.showLevelIntro(()=>this.loadLevel(this.levelIndex));
  }
  loadLevel(idx){
    this.state='playing'; this.levelIndex=idx; this.stageTimer=0; this.level=generateLevel(idx);
    const lv=LEVELS[idx]; this.audio.playMusic(lv.boss ? 'boss_pancadao_oculto' : lv.music);
    this.players=[new Player(1,'leo_mandacaru',this.level.spawn.x,this.level.spawn.y)];
    if(this.p2Joined) this.players.push(new Player(2,'bia_faisca',this.level.spawn.x+36,this.level.spawn.y));
    this.enemies=this.level.enemies; this.npcs=this.level.npcs; this.boss=this.level.boss; this.pickups=this.level.pickups; this.projectiles=[]; this.effects=[]; this.hazards=this.level.hazards;
    this.rescued=0; this.required=Math.ceil(this.npcs.length*.8); this.exitOpen=false; this.showMessage(levelNameFor(this,idx)+' — '+levelObjectiveFor(this,idx),4);
    if(lv.boss) this.audio.sfx('boss_roar');
  }
  showMessage(t,sec=2){ this.message=t; this.messageTime=sec; }
  updateGame(dt){
    this.stageTimer+=dt;
    if(this.input.consume('Escape')||this.input.buttons.pause||this.input.gpButtonPressed(9)||this.input.gpButtonPressed(8)){ this.pauseIndex=0; this.state='pause'; this.audio.sfx('click',.35); return; }
    if(this.input.consume('KeyC') && !this.p2Joined){ this.p2Joined=true; this.players.push(new Player(2,'bia_faisca',this.level.spawn.x+36,this.level.spawn.y)); this.showMessage(tx(this,'coop_join'),2); this.unlockAchievement('coop_join'); }
    this.updatePlayers(dt); this.updateNPCs(dt); this.updateEnemies(dt); this.updateBoss(dt); this.updateProjectiles(dt); this.updatePickups(dt); this.updateEffects(dt); this.updateHazards(dt);
    if(!this.exitOpen && this.rescued>=this.required && (!this.boss || this.boss.dead)){ this.exitOpen=true; this.audio.sfx('door'); this.showMessage(tx(this,'level_unlocked'),3); }
    if(this.exitOpen){ for(const p of this.players.filter(p=>!p.dead)){ if(Math.hypot(p.x-this.level.exit.x,p.y-this.level.exit.y)<44){ this.finishStage(); break; } } }
    if(this.players.every(p=>p.dead)){ this.state='gameover'; this.audio.playMusic('gameover'); }
    this.updateCamera(dt);
  }
  updatePause(){
    const items=[this.tr('continue'), this.tr('returnTitle')];
    if(this.input.navDown()||this.input.navUp()){ this.pauseIndex=(this.pauseIndex+1)%items.length; this.audio.sfx('click',.35); }
    if(this.input.anyBack()){ this.state='playing'; return; }
    if(this.input.anyConfirm()){
      this.audio.sfx('click',.35);
      if(this.pauseIndex===0){ this.state='playing'; }
      else { this.state='menu'; this.pauseIndex=0; this.audio.playMusic('menu_malandro_assombrado'); }
    }
  }
  finishStage(){
    this.unlockAchievement('stage_clear'); let bonus=Math.max(0, Math.floor((300-this.stageTimer)*8)); this.campaignScore += this.players.reduce((s,p)=>s+p.score,0) + bonus;
    this.stageResult={rescued:this.rescued,total:this.npcs.length,time:this.stageTimer,bonus,score:this.campaignScore}; this.state='clear'; this.audio.playMusic('vitoria');
  }
  updatePlayers(dt){
    for(const p of this.players){ if(p.dead) continue; p.t+=dt; p.cool=Math.max(0,p.cool-dt); p.inv=Math.max(0,p.inv-dt); p.animLock=Math.max(0,p.animLock-dt); let mx=0,my=0,fire=false,sw=false,act=false;
      if(p.id===1){
        mx += (this.input.keys.has('KeyD')||this.input.keys.has('ArrowRight')?1:0) - (this.input.keys.has('KeyA')||this.input.keys.has('ArrowLeft')?1:0);
        my += (this.input.keys.has('KeyS')||this.input.keys.has('ArrowDown')?1:0) - (this.input.keys.has('KeyW')||this.input.keys.has('ArrowUp')?1:0);
        if(this.input.joy.active){ mx=this.input.joy.dx; my=this.input.joy.dy; }
        const gp=navigator.getGamepads?.()[0]; if(gp){ let ax=gp.axes[0]||0, ay=gp.axes[1]||0; const dx=(gp.buttons[15]?.pressed?1:0)-(gp.buttons[14]?.pressed?1:0); const dy=(gp.buttons[13]?.pressed?1:0)-(gp.buttons[12]?.pressed?1:0); if(Math.hypot(ax,ay)<=.2 && (dx||dy)){ ax=dx; ay=dy; } if(Math.hypot(ax,ay)>.2){mx=ax; my=ay;} fire=fire||gp.buttons[0]?.pressed||gp.buttons[7]?.pressed; sw=sw||this.input.gpButtonPressed(5,0)||this.input.gpButtonPressed(4,0); act=act||this.input.gpButtonPressed(1,0)||this.input.gpButtonPressed(2,0); }
        fire = fire || this.input.mouse.down || this.input.keys.has('Space') || this.input.buttons.shoot;
        sw = sw || this.input.consume('KeyQ') || this.input.consume('Tab') || this.input.buttons.switch;
        act = act || this.input.consume('KeyE') || this.input.buttons.item;
      } else {
        mx += (this.input.keys.has('KeyL')?1:0) - (this.input.keys.has('KeyJ')?1:0); my += (this.input.keys.has('KeyK')?1:0) - (this.input.keys.has('KeyI')?1:0);
        fire=this.input.keys.has('KeyU'); sw=this.input.consume('KeyO'); act=this.input.consume('KeyP'); const gp=navigator.getGamepads?.()[1]||navigator.getGamepads?.()[0]; const padIndex=navigator.getGamepads?.()[1]?1:0; if(gp){ let ax=gp.axes[0]||0, ay=gp.axes[1]||0; const dx=(gp.buttons[15]?.pressed?1:0)-(gp.buttons[14]?.pressed?1:0); const dy=(gp.buttons[13]?.pressed?1:0)-(gp.buttons[12]?.pressed?1:0); if(Math.hypot(ax,ay)<=.2 && (dx||dy)){ ax=dx; ay=dy; } if(Math.hypot(ax,ay)>.2){mx=ax;my=ay;} fire=fire||gp.buttons[0]?.pressed||gp.buttons[7]?.pressed; sw=sw||this.input.gpButtonPressed(5,padIndex)||this.input.gpButtonPressed(4,padIndex); act=act||this.input.gpButtonPressed(1,padIndex)||this.input.gpButtonPressed(2,padIndex); }
      }
      if(sw) { p.weapon=(p.weapon+1)%WEAPONS.length; this.audio.sfx('click',.35); this.showMessage(`${p.name}: ${this.weaponName(WEAPONS[p.weapon])}`,1.2); }
      const l=Math.hypot(mx,my);
      if(l>.05){
        mx/=l; my/=l;
        this.moveEntity(p,mx*p.speed*dt,my*p.speed*dt);
        p.dir=dirIndexFromVec(mx,my);
        p.aim={x:mx,y:my};
        if(p.animLock<=0) p.anim='walk';
      } else {
        const face=DIR_VECS[p.dir] || {x:0,y:1};
        p.aim={x:face.x,y:face.y};
        if(p.animLock<=0) p.anim='idle';
      }
      if(fire) this.fireWeapon(p); if(act) this.tryInteract(p);
      for(const h of this.hazards){ if(!h.dead && Math.hypot(p.x-h.x,p.y-h.y)<h.r+p.r && p.inv<=0) this.damagePlayer(p,h.damage||8); }
    }
  }
  tryInteract(p){
    for(const npc of this.npcs){ if(!npc.rescued && Math.hypot(p.x-npc.x,p.y-npc.y)<42){ this.rescueNPC(npc,p); return; } }
    for(const pr of this.level.props){ if(pr.name==='porta_madeira' && Math.hypot(p.x-pr.x,p.y-pr.y)<44){ pr.solid=false; pr.open=true; this.audio.sfx('door'); this.effects.push(new Effect('rescue',pr.x,pr.y,.8)); } }
  }
  fireWeapon(p){
    const w=WEAPONS[p.weapon]; if(p.cool>0) return; if(p.ammo[p.weapon]<=0 && w.ammo!==999){ this.audio.sfx('click',.25); p.weapon=0; return; }
    const face = DIR_VECS[p.dir] || p.aim || {x:0,y:1}; p.aim={x:face.x,y:face.y}; p.cool=w.cooldown; if(w.ammo!==999) p.ammo[p.weapon]--; p.anim='attack'; p.animLock=.34; p.t=0; this.audio.sfx('shoot',.45);
    const spread=w.cone? .25 : 0; const shots=w.cone?2:1;
    for(let i=0;i<shots;i++){ const a=Math.atan2(face.y,face.x)+(i-(shots-1)/2)*spread; const vx=Math.cos(a)*w.speed, vy=Math.sin(a)*w.speed; this.projectiles.push(new Projectile(p.x+Math.cos(a)*18,p.y+Math.sin(a)*18,vx,vy,w,p)); }
  }
  damagePlayer(p,amt){ if(p.inv>0||p.dead) return; p.hp-=amt; p.inv=1.1; p.anim='hit'; p.animLock=.22; p.t=0; this.audio.sfx('hit',.5); this.effects.push(new Effect('spark',p.x,p.y,.8)); if(p.hp<=0){ p.lives--; if(p.lives>=0){ p.hp=p.maxHp; p.x=this.level.spawn.x; p.y=this.level.spawn.y; p.inv=2.5; this.showMessage(`${p.name} ${tx(this,'continue_msg')}`,1.6); } else { p.dead=true; p.anim='death'; p.animLock=.7; p.t=0; } } }
  updateNPCs(dt){
    for(const npc of this.npcs){ npc.t+=dt; if(npc.rescued) continue; npc.panic+=dt; const near=this.nearestPlayer(npc); if(near && Math.hypot(near.x-npc.x,near.y-npc.y)<32) this.rescueNPC(npc,near); npc.dir=Math.floor((Math.sin(npc.panic)*4+4))%8; }
  }
  rescueNPC(npc,p){ if(npc.rescued) return; npc.rescued=true; npc.anim='hit'; this.rescued++; this.totalRescued++; localStorage.znq_total_rescued=this.totalRescued; this.unlockAchievement('first_rescue'); if(this.totalRescued>=5) this.unlockAchievement('five_rescues'); p.score+=250; this.audio.sfx('rescue'); this.effects.push(new Effect('rescue',npc.x,npc.y,1.1)); this.showMessage(`${friendlyName(npc.type)} ${tx(this,'rescued_msg')}`,1.4); if(Math.random()<.45) this.dropRandom(npc.x,npc.y); }
  updateEnemies(dt){
    for(const e of this.enemies){ if(e.dead) continue; e.t+=dt; e.hit=Math.max(0,e.hit-dt); e.cool-=dt; const p=this.nearestPlayer(e); if(!p) continue;
      const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy); let vx=dx/l, vy=dy/l; e.dir=dirIndexFromVec(vx,vy); e.anim=e.speed>0?'walk':'idle';
      if(e.behavior==='zigzag'){ const s=Math.sin(this.time*5+e.x*.01); const ox=-vy*s*.8, oy=vx*s*.8; vx=vx*.7+ox; vy=vy*.7+oy; }
      if(e.behavior==='phase'){ if(Math.sin(this.time*2+e.x)>.75){ vx*=1.8; vy*=1.8; } }
      if(e.behavior==='dash' && e.cool<0){ vx*=2.5; vy*=2.5; if(e.cool<-0.45)e.cool=1.8; }
      if(e.behavior==='turret'){ vx=vy=0; if(e.cool<0){ this.enemyShoot(e,p,260,10); e.cool=1.8; } }
      if(e.behavior==='throw' && e.cool<0 && l<260){ this.enemyShoot(e,p,220,14); e.cool=2.2; }
      if(e.behavior==='slime' && e.cool<0){ this.hazards.push({x:e.x,y:e.y,r:24,t:4,damage:6,type:'poison',dead:false}); e.cool=2.2; }
      const sp=e.speed; if(sp>0) this.moveEntity(e,vx*sp*dt,vy*sp*dt);
      for(const pl of this.players){ if(!pl.dead && Math.hypot(pl.x-e.x,pl.y-e.y)<pl.r+e.r) this.damagePlayer(pl,e.damage); }
    }
    this.enemies=this.enemies.filter(e=>!e.remove);
  }
  enemyShoot(e,p,speed,damage){ const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy); const w={name:'Maldição',speed,damage,life:2,effect:'poison'}; const pr=new Projectile(e.x,e.y,dx/l*speed,dy/l*speed,w,e); pr.enemy=true; this.projectiles.push(pr); this.audio.sfx('zombie',.25); }
  updateBoss(dt){
    const b=this.boss; if(!b || b.dead) return; b.t+=dt; b.hit=Math.max(0,b.hit-dt); b.cool-=dt; const p=this.nearestPlayer(b); if(!p) return; const dx=p.x-b.x, dy=p.y-b.y, l=len(dx,dy); let vx=dx/l, vy=dy/l; b.dir=dirIndexFromVec(vx,vy); b.phase = b.hp < b.maxHp*.45 ? 2 : 1; let sp=b.speed*(b.phase===2?1.35:1);
    if(b.type.includes('caminhao')){ if(b.cool<0){ sp*=3; if(b.cool<-0.55){b.cool=2.4; this.audio.sfx('boss_roar',.5);} } }
    else if(b.type.includes('jacare')){ if(b.cool<0){ for(let a=0;a<Math.PI*2;a+=Math.PI/4) this.projectiles.push(new Projectile(b.x,b.y,Math.cos(a)*210,Math.sin(a)*210,{name:'Esgoto',damage:16,life:1.4,effect:'poison'},b)); b.cool=2.2; } }
    else if(b.type.includes('mosquito')){ const s=Math.sin(this.time*4); vx=vx*.6-vy*s; vy=vy*.6+vx*s*.2; if(b.cool<0){ for(let i=0;i<3;i++) this.enemyShoot(b,p,250+i*40,13); b.cool=1.4; } }
    else if(b.type.includes('dj')){ if(b.cool<0){ this.spawnEnemyNear('fantasma_carnaval', b.x, b.y); this.spawnEnemyNear('palhaco_demonico', b.x, b.y); for(let a=0;a<Math.PI*2;a+=Math.PI/6) this.projectiles.push(new Projectile(b.x,b.y,Math.cos(a)*180,Math.sin(a)*180,{name:'Batida Sombria',damage:12,life:1.7,effect:'spark'},b)); b.cool=3.0; } }
    else { if(b.cool<0){ this.spawnEnemyNear('slime_toxico',b.x,b.y); this.spawnEnemyNear('seguranca_possuido',b.x,b.y); this.enemyShoot(b,p,300,18); b.cool=2.0; } }
    this.moveEntity(b,vx*sp*dt,vy*sp*dt); for(const pl of this.players){ if(!pl.dead && Math.hypot(pl.x-b.x,pl.y-b.y)<pl.r+b.r) this.damagePlayer(pl,b.damage); }
  }
  spawnEnemyNear(type,x,y){ const a=Math.random()*Math.PI*2; const e=new Enemy(type,x+Math.cos(a)*80,y+Math.sin(a)*80,this.levelIndex); this.enemies.push(e); }
  updateProjectiles(dt){
    for(const pr of this.projectiles){ if(pr.dead) continue; pr.t+=dt; pr.life-=dt; pr.x+=pr.vx*dt; pr.y+=pr.vy*dt; if(pr.life<=0 || this.collides(pr.x,pr.y,pr.r,true)){ this.killProjectile(pr); continue; }
      if(pr.enemy){ for(const p of this.players){ if(!p.dead && Math.hypot(p.x-pr.x,p.y-pr.y)<p.r+pr.r){ this.damagePlayer(p,pr.damage); this.killProjectile(pr); break; } } }
      else { for(const e of this.enemies){ if(!e.dead && Math.hypot(e.x-pr.x,e.y-pr.y)<e.r+pr.r){ this.damageEnemy(e,pr.damage,pr.owner); this.killProjectile(pr); break; } }
        if(!pr.dead && this.boss && !this.boss.dead && Math.hypot(this.boss.x-pr.x,this.boss.y-pr.y)<this.boss.r+pr.r){ this.damageBoss(this.boss,pr.damage,pr.owner); this.killProjectile(pr); }
      }
    }
    this.projectiles=this.projectiles.filter(p=>!p.dead);
  }
  killProjectile(pr){ if(pr.dead)return; pr.dead=true; const ef=pr.weapon.effect||'spark'; if(pr.weapon.explosion){ this.effects.push(new Effect('explosion',pr.x,pr.y,pr.weapon.explosion/70)); this.audio.sfx('explosion',.6); this.areaDamage(pr.x,pr.y,pr.weapon.explosion,pr.weapon.damage,pr.owner); } else this.effects.push(new Effect(ef,pr.x,pr.y,.7)); }
  areaDamage(x,y,r,damage,owner){ for(const e of this.enemies){ if(!e.dead && Math.hypot(e.x-x,e.y-y)<r+e.r) this.damageEnemy(e,damage,owner); } if(this.boss&&!this.boss.dead&&Math.hypot(this.boss.x-x,this.boss.y-y)<r+this.boss.r) this.damageBoss(this.boss,damage,owner); }
  damageEnemy(e,dmg,owner){ e.hp-=dmg; e.hit=.15; e.anim='hit'; this.effects.push(new Effect('spark',e.x,e.y,.6)); if(e.hp<=0){ this.unlockAchievement('first_zombie'); e.dead=true; e.remove=true; owner.score+=e.score; this.effects.push(new Effect('smoke',e.x,e.y,.9)); if(Math.random()<.18) this.dropRandom(e.x,e.y); } }
  damageBoss(b,dmg,owner){ b.hp-=dmg; b.hit=.2; this.effects.push(new Effect('spark',b.x,b.y,1.2)); if(b.hp<=0){ this.unlockAchievement('boss_down'); b.dead=true; owner.score+=b.score; this.effects.push(new Effect('explosion',b.x,b.y,2.0)); this.audio.sfx('explosion',1); this.showMessage(this.tr('bossDefeated'),3); } }
  dropRandom(x,y){ const pool=['kit_cura','coxinha','caldo_cana','chinelo_explosivo','rojao_junino','spray_fogo','guarana_explosivo','estilingue']; this.pickups.push(new Pickup(pool[Math.floor(Math.random()*pool.length)],x,y)); }
  updatePickups(dt){ for(const it of this.pickups){ it.t+=dt; if(it.dead) continue; for(const p of this.players){ if(!p.dead && Math.hypot(p.x-it.x,p.y-it.y)<p.r+it.r){ this.collect(it,p); break; } } } this.pickups=this.pickups.filter(i=>!i.dead); }
  collect(it,p){ it.dead=true; this.audio.sfx('pickup'); this.effects.push(new Effect('rescue',it.x,it.y,.7)); const idx=itemId(it.item); if(it.item==='kit_cura'){ p.hp=clamp(p.hp+45,0,p.maxHp); this.showMessage(`${p.name} ${this.tr('hpRecover')}`,1); } else if(it.item==='coxinha'||it.item==='caldo_cana'){ p.hp=clamp(p.hp+20,0,p.maxHp); p.speed+= it.item==='caldo_cana'?8:0; this.showMessage(`${this.itemName(it.item)}: ${this.tr('energyBoost')}`,1); } else { const w=WEAPONS.findIndex(w=>w.item===it.item); if(w>=0){ p.ammo[w]+=WEAPONS[w].ammo===999?0:WEAPONS[w].ammo; p.weapon=w; this.unlockAchievement('arsenal'); this.showMessage(`${p.name} ${this.tr('picked')} ${this.weaponName(WEAPONS[w])}!`,1.5); } } }
  updateHazards(dt){ for(const h of this.hazards){ h.t-=dt; if(h.t<=0)h.dead=true; } this.hazards=this.hazards.filter(h=>!h.dead); }
  updateEffects(dt){ for(const e of this.effects){ e.t+=dt; if(e.t>e.life)e.dead=true; } this.effects=this.effects.filter(e=>!e.dead); }
  nearestPlayer(o){ let best=null,bd=1e9; for(const p of this.players){ if(p.dead) continue; const d=Math.hypot(p.x-o.x,p.y-o.y); if(d<bd){bd=d; best=p;} } return best; }
  moveEntity(e,dx,dy){ if(!this.collides(e.x+dx,e.y,e.r,false,e)) e.x+=dx; if(!this.collides(e.x,e.y+dy,e.r,false,e)) e.y+=dy; }
  collides(x,y,r,projectile=false,self=null){
    if(!this.level) return false; if(x<r||y<r||x>this.level.w*TILE-r||y>this.level.h*TILE-r) return true;
    const checks=[[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r],[x,y]];
    for(const [cx,cy] of checks){ const tx=Math.floor(cx/TILE), ty=Math.floor(cy/TILE); if(this.level.solid[ty]?.[tx]) return true; }
    if(projectile) return false;
    for(const pr of this.level.props){ if(pr.solid && pr!==self && circleRectHit(x,y,r,pr.x-18,pr.y-18,36,36)) return true; }
    return false;
  }
  updateCamera(dt){ const active=this.players.filter(p=>!p.dead); const target=active.length? active.reduce((a,p)=>({x:a.x+p.x,y:a.y+p.y}),{x:0,y:0}) : this.level.spawn; const n=active.length||1; const tx=target.x/n-GAME_W/2, ty=target.y/n-GAME_H/2; this.camera.x += (clamp(tx,0,this.level.w*TILE-GAME_W)-this.camera.x)*.12; this.camera.y += (clamp(ty,0,this.level.h*TILE-GAME_H)-this.camera.y)*.12; }

  draw(){ const c=this.ctx; c.clearRect(0,0,GAME_W,GAME_H); c.imageSmoothingEnabled=false;
    if(this.state==='boot'){ this.drawLoading(); return; }
    if(this.state==='studio') this.drawStudio(); else if(this.state==='openingIntro') this.drawOpeningIntro(); else if(this.state==='splash') this.drawSplash(); else if(this.state==='menu') this.drawMenu(); else if(this.state==='language') this.drawLanguage(); else if(this.state==='options') this.drawOptions(); else if(this.state==='controls') this.drawControls(); else if(this.state==='achievements') this.drawAchievements(); else if(this.state==='credits') this.drawCredits(); else if(this.state==='cutscene') this.drawCutscene(); else if(this.state==='playing') this.drawGame(); else if(this.state==='pause') this.drawPause(); else if(this.state==='clear') this.drawClear(); else if(this.state==='gameover') this.drawPanel('gameover',this.tr('gameoverSub')); else if(this.state==='victory') this.drawPanel('victory',this.tr('victorySub')); else if(this.state==='error') this.drawError(); this.drawAchievementToast(); }
  drawLoading(){ const c=this.ctx; c.drawImage(this.loader.images['ui/loading']||new Image(),0,0); c.fillStyle='rgba(8,6,14,.38)'; c.fillRect(160,300,640,110); c.strokeStyle='#f5d85a'; c.lineWidth=4; c.strokeRect(160,300,640,110); c.textAlign='center'; c.font='24px ZnqArcade, monospace'; c.fillStyle='#fff08a'; c.fillText(this.tr('loadingText'),480,338); c.fillStyle='#fff0a0'; c.fillRect(280,360,400*this.loader.progress,18); c.strokeStyle='#241a26'; c.lineWidth=4; c.strokeRect(280,360,400,18); }
  drawTitleSky(){
    const c=this.ctx;
    const buildings=[
      {x:0,w:92,h:118},{x:70,w:88,h:145},{x:142,w:68,h:104},{x:202,w:118,h:164},{x:305,w:86,h:132},
      {x:382,w:98,h:180},{x:468,w:76,h:124},{x:532,w:110,h:168},{x:626,w:82,h:136},{x:694,w:120,h:178},{x:806,w:82,h:122},{x:872,w:88,h:154}
    ];
    for(let bi=0;bi<buildings.length;bi++){
      const b=buildings[bi], y=GAME_H-b.h;
      c.fillStyle=bi%2===0?'rgba(19,20,33,.92)':'rgba(28,25,42,.95)';
      c.fillRect(b.x,y,b.w,b.h);
      c.fillStyle='rgba(8,8,14,.35)'; c.fillRect(b.x+4,y+6,b.w-8,b.h-6);
      for(let wy=y+16; wy<y+b.h-16; wy+=16){
        for(let wx=b.x+10; wx<b.x+b.w-10; wx+=14){
          const blink=Math.sin(this.time*2.8 + bi*0.8 + wx*0.07 + wy*0.03);
          const on=((Math.floor((this.time*2 + bi + wx + wy)/7)%3)!==0) || blink>0.6;
          c.fillStyle=on?'rgba(255,232,120,.95)':'rgba(51,60,90,.45)';
          c.fillRect(wx,wy,6,8);
        }
      }
    }
    c.fillStyle='rgba(12,8,20,.85)';
    c.fillRect(0,GAME_H-48,GAME_W,48);
  }
  drawStudio(){ const c=this.ctx; c.fillStyle='#05060b'; c.fillRect(0,0,GAME_W,GAME_H); const img=this.loader.images['ui/studio']; if(img) c.drawImage(img,0,0,GAME_W,GAME_H); const fadeOut=Math.max(0,1-Math.max(0,this.brandTimer-2.3)/0.6); c.fillStyle=`rgba(0,0,0,${1-fadeOut})`; c.fillRect(0,0,GAME_W,GAME_H); }
  drawOpeningIntro(){ const c=this.ctx; c.fillStyle='#05060b'; c.fillRect(0,0,GAME_W,GAME_H); const imgs=[this.loader.images['ui/intro1'],this.loader.images['ui/intro2'],this.loader.images['ui/intro3']]; const img=imgs[this.introStep]; if(img){ c.drawImage(img,0,0,GAME_W,GAME_H); } else { this.drawTitleSky(); } c.fillStyle='rgba(5,6,11,.45)'; c.fillRect(0,0,GAME_W,GAME_H); const cards=this.trList('introCards'); const msg=cards[this.introStep]||''; const fade=Math.min(1,this.introTimer/0.55)*Math.min(1,Math.max(0,3.2-this.introTimer)/0.55); c.save(); c.globalAlpha=fade; c.fillStyle='rgba(10,10,18,.76)'; c.fillRect(60,340,840,140); c.strokeStyle='#f5d85a'; c.lineWidth=4; c.strokeRect(60,340,840,140); c.textAlign='center'; c.font='18px ZnqArcade, monospace'; c.fillStyle='#f8f3e8'; const lines=getWrappedLines(c,msg,760); let y=386-(lines.length-1)*10; for(const line of lines){ c.fillText(line,480,y); y+=24; } c.font='13px ZnqArcade, monospace'; c.fillStyle='#a8ffc4'; if(Math.floor(this.time*2)%2===0) c.fillText(this.tr('splashPress'),480,454); c.restore(); }
  drawSplash(){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(5,7,12,.24)'; c.fillRect(0,0,GAME_W,GAME_H); const logo=this.loader.images['ui/logo']; const pulse=1+Math.sin(this.time*2)*0.02; const lw=660*pulse, lh=224*pulse; c.drawImage(logo,480-lw/2,32+Math.sin(this.time*2.5)*4,lw,lh); const p1=this.loader.images['portrait/leo_mandacaru']; const p2=this.loader.images['portrait/bia_faisca']; const bob=Math.sin(this.time*3)*4; c.drawImage(p1,92,238+bob,154,154); c.drawImage(p2,714,238-bob,154,154); c.fillStyle='rgba(10,13,22,.86)'; c.fillRect(135,385,690,104); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(135,385,690,104); c.textAlign='center'; c.font='21px ZnqArcade, monospace'; c.fillStyle='#fff08a'; c.fillText(this.tr('splashHeadline'),480,418); c.font='15px ZnqArcade, monospace'; c.fillStyle='#e8f6ff'; const introLines=getWrappedLines(c,this.tr('splashSubline'),610); let iy=444; for(const line of introLines.slice(0,2)){ c.fillText(line,480,iy); iy+=18; } if(Math.floor(this.time*2)%2===0){ c.fillStyle='#a8ffc4'; c.font='16px ZnqArcade, monospace'; c.fillText(this.tr('splashPress'),480,482); } }
  drawLanguage(){ const c=this.ctx; this.drawMenuBackdrop(this.tr('selectLanguage')); c.textAlign='center'; c.font='16px ZnqArcade, monospace'; c.fillStyle='#d9f4ff'; c.fillText(this.tr('languageHint'),480,170); const labels={pt:this.tr('chooseLanguagePt'), en:this.tr('chooseLanguageEn'), ru:this.tr('chooseLanguageRu')}; for(let i=0;i<LANGS.length;i++){ const code=LANGS[i]; const x=66+i*276, y=208, bw=244, bh=128; c.fillStyle=i===this.langIndex?'rgba(245,216,90,.28)':'rgba(20,15,30,.78)'; c.fillRect(x,y,bw,bh); c.strokeStyle=i===this.langIndex?'#f5d85a':'#8ea0b5'; c.lineWidth=4; c.strokeRect(x,y,bw,bh); c.fillStyle=i===this.langIndex?'#fff08a':'#e8f6ff'; c.font='24px ZnqArcade, monospace'; c.textAlign='center'; c.fillText(code.toUpperCase(),x+bw/2,y+34); c.font='14px ZnqArcade, monospace'; const lines=getWrappedLines(c,labels[code],180); let yy=y+66; for(const line of lines.slice(0,3)){ c.fillText(line,x+bw/2,yy); yy+=18; } } c.fillStyle='#a8ffc4'; c.font='14px ZnqArcade, monospace'; c.fillText(this.tr('confirmHint'),480,402); c.fillText(this.tr('controlsBack'),480,426); }
  drawMenu(){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(5,7,12,.28)'; c.fillRect(0,0,GAME_W,GAME_H); const logo=this.loader.images['ui/logo']; c.drawImage(logo,155,24,650,220); const items=this.menuItems(); c.fillStyle='rgba(10,13,22,.82)'; c.fillRect(300,218,360,245); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(300,218,360,245); c.textAlign='center'; c.font='24px ZnqArcade, monospace'; for(let i=0;i<items.length;i++){ const y=258+i*34; c.fillStyle=i===this.menuIndex?'rgba(245,216,90,.24)':'rgba(0,0,0,0)'; if(i===this.menuIndex)c.fillRect(322,y-24,316,30); c.fillStyle=i===this.menuIndex?'#fff08a':'#e8f6ff'; c.fillText(items[i],480,y); } c.font='15px ZnqArcade, monospace'; c.fillStyle='#d4ffe2'; c.fillText('2026 Felipe',480,506); }
  drawOptions(){ const c=this.ctx; this.drawMenuBackdrop(this.tr('optionsTitle')); const opts=[`${this.tr('music')}: ${Math.round(this.audio.musicVolume*100)}%`,`${this.tr('sfx')}: ${Math.round(this.audio.sfxVolume*100)}%`,`${this.tr('language')}: ${this.lang==='pt'?this.tr('chooseLanguagePt'):this.lang==='ru'?this.tr('chooseLanguageRu'):this.tr('chooseLanguageEn')}`,this.tr('back')]; c.textAlign='center'; for(let i=0;i<opts.length;i++){ const y=192+i*58; c.fillStyle=i===this.optionIndex?'rgba(245,216,90,.20)':'rgba(20,15,30,.55)'; c.fillRect(180,y-24,600,42); c.strokeStyle=i===this.optionIndex?'#f5d85a':'#6c7a90'; c.strokeRect(180,y-24,600,42); c.fillStyle=i===this.optionIndex?'#fff08a':'#e8f6ff'; c.font='20px ZnqArcade, monospace'; const lines=getWrappedLines(c,opts[i],540); let yy=y-4-(lines.length-1)*10; for(const line of lines.slice(0,2)){ c.fillText(line,480,yy); yy+=20; } } c.font='14px ZnqArcade, monospace'; c.fillStyle='#d4ffe2'; const hint=getWrappedLines(c,this.tr('optionHint'),560); let hy=438; for(const line of hint.slice(0,2)){ c.fillText(line,480,hy); hy+=18; } }
  drawControls(){ const c=this.ctx; this.drawMenuBackdrop(this.tr('controlsTitle')); c.textAlign='left'; c.fillStyle='#e8f6ff'; c.font='16px ZnqArcade, monospace'; const lines=this.trList('controlsLines'); let y=168; for(const l of lines){ const wrapped=getWrappedLines(c,l,730); for(const line of wrapped){ c.fillText(line,110,y); y+=20; } y+=10; } c.textAlign='center'; c.fillStyle='#fff08a'; c.font='14px ZnqArcade, monospace'; c.fillText(this.tr('controlsBack'),480,452); }
  drawAchievements(){ const c=this.ctx; this.drawMenuBackdrop(this.tr('achievementsTitle')); const start=Math.max(0,Math.min(this.achievementIndex-2,ACHIEVEMENTS.length-5)); c.textAlign='left'; c.font='16px ZnqArcade, monospace'; for(let i=0;i<5;i++){ const idx=start+i, a=ACHIEVEMENTS[idx]; if(!a) continue; const y=174+i*52, unlocked=!!this.achievements[a.id]; c.fillStyle=idx===this.achievementIndex?'rgba(245,216,90,.18)':'rgba(20,15,30,.45)'; c.fillRect(120,y-24,720,46); c.strokeStyle=idx===this.achievementIndex?'#f5d85a':'#6c7a90'; c.strokeRect(120,y-24,720,46); c.fillStyle=unlocked?'#fff08a':'#8992a6'; c.fillText((unlocked?'★ ':'□ ')+this.achText(a,'title'),140,y-5); c.fillStyle=unlocked?'#e8f6ff':'#8992a6'; c.font='12px ZnqArcade, monospace'; const desc=unlocked?this.achText(a,'desc'):this.tr('locked'); const dlines=getWrappedLines(c,desc,640); let dy=y+8; for(const dl of dlines.slice(0,2)){ c.fillText(dl,160,dy); dy+=14; } c.font='16px ZnqArcade, monospace'; } c.textAlign='center'; c.font='14px ZnqArcade, monospace'; c.fillStyle='#a8ffc4'; c.fillText(this.tr('controlsBack'),480,448); }
  drawAchievementToast(){ if(!this.achievementToast || this.achievementToastTime<=0) return; const c=this.ctx, a=this.achievementToast; const alpha=Math.min(1,this.achievementToastTime,.45)/.45; c.save(); c.globalAlpha=alpha; c.fillStyle='rgba(12,9,20,.94)'; c.fillRect(600,76,330,78); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(600,76,330,78); c.textAlign='left'; c.font='15px ZnqArcade, monospace'; c.fillStyle='#a8ffc4'; c.fillText(this.tr('achievementUnlocked'),620,104); c.font='18px ZnqArcade, monospace'; c.fillStyle='#fff08a'; c.fillText('★ '+this.achText(a,'title'),620,132); c.restore(); }
  drawCredits(){ const c=this.ctx; this.drawMenuBackdrop(this.tr('creditsTitle')); c.textAlign='center'; c.fillStyle='#fff08a'; c.font='26px ZnqArcade, monospace'; c.fillText(this.trList('creditsLines')[0],480,230); c.fillStyle='#e8f6ff'; c.font='16px ZnqArcade, monospace'; c.fillText('Zumbis na Quebrada',480,272); c.fillText('2026 Felipe',480,300); c.fillStyle='#fff08a'; c.font='14px ZnqArcade, monospace'; c.fillText(this.tr('controlsBack'),480,448); }
  drawMenuBackdrop(title){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); c.fillStyle='rgba(8,10,18,.84)'; c.fillRect(72,60,816,420); c.strokeStyle='#f5d85a'; c.lineWidth=3; c.strokeRect(72,60,816,420); c.textAlign='center'; c.font='32px ZnqArcade, monospace'; c.fillStyle='#fff08a'; const lines=getWrappedLines(c,title,700); let y=116; for(const line of lines.slice(0,2)){ c.fillText(line,480,y); y+=34; } }
  drawCutscene(){ const c=this.ctx; c.drawImage(this.loader.images['ui/menu_bg'],0,0); const line=this.dialog[this.dialogIndex]||this.dialog[0]; const img=this.loader.images['portrait/'+line[0]] || this.loader.images['portrait/leo_mandacaru']; c.fillStyle='rgba(8,6,14,.76)'; c.fillRect(0,0,GAME_W,GAME_H); c.fillStyle='rgba(14,11,24,.96)'; c.fillRect(24,292,912,216); c.strokeStyle='#f5d85a'; c.lineWidth=4; c.strokeRect(24,292,912,216); c.fillStyle='rgba(18,14,29,.98)'; c.fillRect(42,170,214,248); c.strokeRect(42,170,214,248); c.drawImage(img,61,195,176,176); c.fillStyle='rgba(58,40,68,.96)'; c.fillRect(278,310,240,38); c.strokeStyle='#f5d85a'; c.strokeRect(278,310,240,38); c.font='21px ZnqArcade, monospace'; c.textAlign='center'; c.fillStyle='#fff08a'; c.fillText(line[1],398,336); c.font='16px ZnqArcade, monospace'; c.textAlign='left'; c.fillStyle='#e8f6ff'; const lines=getWrappedLines(c,line[2],620); let y=380; for(const t of lines.slice(0,6)){ c.fillText(t,286,y); y+=22; } c.font='13px ZnqArcade, monospace'; c.fillStyle='#a8ffc4'; c.fillText(this.tr('cutsceneHint'),286,474); c.textAlign='right'; c.fillStyle='#fff08a'; c.fillText(`${this.dialogIndex+1}/${this.dialog.length}`,900,474); c.textAlign='left'; }
  drawGame(){ const c=this.ctx; const cam=this.camera; this.drawMap(c,cam); this.drawHazards(c,cam); this.drawProps(c,cam); const drawables=[...this.pickups,...this.npcs.filter(n=>!n.rescued),...this.enemies.filter(e=>!e.dead),...(this.boss&&!this.boss.dead?[this.boss]:[]),...this.players.filter(p=>!p.dead),...this.projectiles]; drawables.sort((a,b)=>a.y-b.y); for(const o of drawables) this.drawObject(c,o,cam); this.drawEffects(c,cam); if(this.exitOpen) this.drawExit(c,cam); this.drawHUD(c); if(this.input.touchActive) this.drawTouch(c); }
  drawPause(){ const c=this.ctx; this.drawGame(); c.fillStyle='rgba(8,6,14,.55)'; c.fillRect(0,0,GAME_W,GAME_H); c.fillStyle='rgba(14,11,24,.96)'; c.fillRect(250,150,460,220); c.strokeStyle='#f5d85a'; c.lineWidth=4; c.strokeRect(250,150,460,220); c.textAlign='center'; c.fillStyle='#fff08a'; c.font='30px ZnqArcade, monospace'; c.fillText(this.tr('pauseTitle'),480,196); const items=[this.tr('continue'), this.tr('returnTitle')]; for(let i=0;i<items.length;i++){ const y=248+i*54; c.fillStyle=i===this.pauseIndex?'rgba(245,216,90,.20)':'rgba(20,15,30,.55)'; c.fillRect(300,y-24,360,40); c.strokeStyle=i===this.pauseIndex?'#f5d85a':'#6c7a90'; c.strokeRect(300,y-24,360,40); c.fillStyle=i===this.pauseIndex?'#fff08a':'#e8f6ff'; c.font='20px ZnqArcade, monospace'; const lines=getWrappedLines(c,items[i],320); let yy=y-4-(lines.length-1)*10; for(const line of lines.slice(0,2)){ c.fillText(line,480,yy); yy+=20; } } c.font='13px ZnqArcade, monospace'; c.fillStyle='#a8ffc4'; c.fillText(this.tr('pauseHint'),480,346); }
  drawMap(c,cam){ const sx=Math.floor(cam.x/TILE), sy=Math.floor(cam.y/TILE), ex=Math.ceil((cam.x+GAME_W)/TILE), ey=Math.ceil((cam.y+GAME_H)/TILE); const img=this.loader.images.tiles; for(let y=sy;y<=ey;y++){ for(let x=sx;x<=ex;x++){ if(y<0||x<0||y>=this.level.h||x>=this.level.w) continue; const id=this.level.tiles[y][x]; c.drawImage(img,(id%8)*32,Math.floor(id/8)*32,32,32,Math.floor(x*TILE-cam.x),Math.floor(y*TILE-cam.y),32,32); } } }
  drawProps(c,cam){ const img=this.loader.images.props; for(const p of this.level.props){ if(p.open) continue; const id=p.id; c.drawImage(img,(id%8)*48,Math.floor(id/8)*48,48,48,Math.round(p.x-24-cam.x),Math.round(p.y-24-cam.y),48,48); } }
  drawHazards(c,cam){ for(const h of this.hazards){ const row=effectId(h.type||'poison'), frame=Math.floor(this.time*10)%8; c.globalAlpha=clamp(h.t/1.2,0,1); c.drawImage(this.loader.images.effects,frame*48,row*48,48,48,h.x-24-cam.x,h.y-24-cam.y,48,48); c.globalAlpha=1; } }
  drawObject(c,o,cam){ if(o.kind==='pickup'){ const id=itemId(o.item); const bob=Math.sin(o.t*5)*4; c.drawImage(this.loader.images.items,(id%8)*32,Math.floor(id/8)*32,32,32,o.x-16-cam.x,o.y-20+bob-cam.y,32,32); return; }
    if(o.kind==='npc'){ SpriteAnim.draw(c,this.loader.images['npcs/'+o.type],o.x-cam.x,o.y-cam.y,48,'idle',o.dir,o.t); return; }
    if(o.kind==='enemy'){ const img=this.loader.images['enemies/'+o.type] || this.loader.images['enemies/zumbi_bairro']; c.globalAlpha=o.hit>0?.65:1; SpriteAnim.draw(c,img,o.x-cam.x,o.y-cam.y,48,o.anim,o.dir,o.t); c.globalAlpha=1; return; }
    if(o.kind==='boss'){ const img=this.loader.images['bosses/'+o.type]; c.globalAlpha=o.hit>0?.75:1; SpriteAnim.draw(c,img,o.x-cam.x,o.y-cam.y,96,o.anim,o.dir,o.t); c.globalAlpha=1; this.drawHealthBar(c,o.x-cam.x-45,o.y-cam.y-62,90,8,o.hp/o.maxHp,'#ff5966'); return; }
    if(o.kind==='player'){ c.globalAlpha=o.inv>0 && Math.floor(this.time*12)%2===0 ? .45 : 1; SpriteAnim.draw(c,this.loader.images['protagonists/'+o.sprite],o.x-cam.x,o.y-cam.y,56,o.anim,o.dir,o.t); c.globalAlpha=1; return; }
    if(o.kind==='projectile'){ const row=effectId(o.weapon.effect||'spark'), frame=Math.floor(o.t*18)%8; c.drawImage(this.loader.images.effects,frame*48,row*48,48,48,o.x-18-cam.x,o.y-18-cam.y,36,36); }
  }
  drawEffects(c,cam){ for(const e of this.effects){ const row=effectId(e.type), frame=clamp(Math.floor((e.t/e.life)*8),0,7); const s=48*e.scale; c.drawImage(this.loader.images.effects,frame*48,row*48,48,48,e.x-s/2-cam.x,e.y-s/2-cam.y,s,s); } }
  drawExit(c,cam){ const x=this.level.exit.x-cam.x, y=this.level.exit.y-cam.y; c.save(); c.translate(x,y); c.rotate(this.time*2); c.strokeStyle='#7dffb1'; c.lineWidth=5; c.globalAlpha=.85; c.strokeRect(-25,-25,50,50); c.globalAlpha=1; c.restore(); c.font='15px ZnqArcade, monospace'; c.fillStyle='#e8fff0'; c.textAlign='center'; c.fillText(tx(this,'exit'),x,y-36); }
  drawHUD(c){ c.fillStyle='rgba(10,8,18,.82)'; c.fillRect(0,0,GAME_W,72); c.strokeStyle='#f5d85a'; c.lineWidth=2; c.strokeRect(4,4,GAME_W-8,64); let x=18; for(const p of this.players){ c.font='15px ZnqArcade, monospace'; c.fillStyle='#fff08a'; c.fillText(`${p.name}  ${tx(this,'lives')}:${Math.max(0,p.lives+1)}`,x,21); this.drawHealthBar(c,x,30,150,12,p.hp/p.maxHp,'#68e083'); const w=WEAPONS[p.weapon]; c.fillStyle='#e8f6ff'; c.fillText(`${this.weaponName(w)}  ${tx(this,'ammo')}:${w.ammo===999?'∞':p.ammo[p.weapon]}`,x,60); x+=300; }
    c.textAlign='right'; c.fillStyle='#e8f6ff'; c.font='16px ZnqArcade, monospace'; c.fillText(`${tx(this,'npcs')}: ${this.rescued}/${this.npcs.length}  ${tx(this,'target')}:${this.required}`,GAME_W-18,24); c.fillText(`${tx(this,'stage')} ${this.levelIndex+1}/${LEVELS.length}: ${levelNameFor(this,this.levelIndex)}`,GAME_W-18,48); c.textAlign='left'; if(this.messageTime>0){ c.fillStyle='rgba(20,15,30,.86)'; c.fillRect(110,82,740,56); c.strokeStyle='#f5d85a'; c.strokeRect(110,82,740,56); c.textAlign='center'; c.fillStyle='#fff08a'; c.font='15px ZnqArcade, monospace'; const lines=getWrappedLines(c,this.message,690); let yy=104; for(const line of lines.slice(0,2)){ c.fillText(line,480,yy); yy+=18; } c.textAlign='left'; } }
  drawHealthBar(c,x,y,w,h,t,col){ c.fillStyle='#241a26'; c.fillRect(x,y,w,h); c.fillStyle=col; c.fillRect(x,y,w*clamp(t,0,1),h); c.strokeStyle='#f3e0a0'; c.strokeRect(x,y,w,h); }
  drawTouch(c){ const defs=this.input.touchButtonDefs(); c.globalAlpha=.72; c.strokeStyle='#e8f6ff'; c.fillStyle='rgba(20,15,30,.5)'; if(this.input.joy.active){ c.beginPath(); c.arc(this.input.joy.x,this.input.joy.y,58,0,Math.PI*2); c.fill(); c.stroke(); c.beginPath(); c.arc(this.input.joy.x+this.input.joy.dx*46,this.input.joy.y+this.input.joy.dy*46,23,0,Math.PI*2); c.fill(); c.stroke(); } else { c.beginPath(); c.arc(95,420,58,0,Math.PI*2); c.fill(); c.stroke(); }
    c.textAlign='center'; c.font='12px ZnqArcade, monospace'; for(const b of defs){ c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.fill(); c.stroke(); c.fillStyle='#fff08a'; c.fillText(b.label,b.x,b.y+4); c.fillStyle='rgba(20,15,30,.5)'; } c.globalAlpha=1; }
  drawClear(){ const c=this.ctx; this.drawPanel('victory',this.tr('nextPhase')); c.textAlign='center'; c.font='22px ZnqArcade, monospace'; c.fillStyle='#e8f6ff'; const r=this.stageResult; c.fillText(`${tx(this,'rescued')}: ${r.rescued}/${r.total}`,480,285); c.fillText(`${tx(this,'time')}: ${Math.floor(r.time)}s  ${tx(this,'bonus')}: ${r.bonus}`,480,318); c.fillText(`${tx(this,'campaign_score')}: ${r.score}`,480,351); }
  drawPanel(imgKey,sub){ const c=this.ctx; c.drawImage(this.loader.images['ui/'+imgKey],0,0); c.textAlign='center'; c.font='22px ZnqArcade, monospace'; c.fillStyle='#e8f6ff'; c.fillText(sub,480,430); }
  drawError(){ const c=this.ctx; c.fillStyle='#120d18'; c.fillRect(0,0,GAME_W,GAME_H); c.fillStyle='#fff08a'; c.textAlign='center'; c.font='28px ZnqArcade, monospace'; c.fillText(this.tr('errorTitle'),480,180); c.font='16px ZnqArcade, monospace'; c.fillStyle='#e8f6ff'; wrapText(c,this.runtimeError || 'Erro desconhecido',140,240,680,22); c.fillStyle='#a8ffc4'; c.fillText(this.tr('errorHelp'),480,360); }
}


function generateLevel(idx){
  const lv=LEVELS[idx], rng=mulberry32(9000+idx*1234);
  const w=56+idx*2, h=34+Math.floor(idx*.8);
  const floor=tileId(`${lv.theme}_floor`), wall=tileId(`${lv.theme}_wall`), decor=tileId(`${lv.theme}_decor`);
  const tiles=[], solid=[];
  for(let y=0;y<h;y++){
    tiles[y]=[]; solid[y]=[];
    for(let x=0;x<w;x++){
      const edge=x===0||y===0||x===w-1||y===h-1;
      tiles[y][x]=edge?wall:floor;
      solid[y][x]=edge;
    }
  }
  const spawn={x:80,y:h*TILE/2};
  const exit={x:(w-3)*TILE,y:h*TILE/2};
  const props=[];
  const hazards=[];
  const reserved=[];
  const addReserved=(x,y,r)=>reserved.push({x,y,r});
  addReserved(spawn.x,spawn.y,120); addReserved(exit.x,exit.y,120);

  function carveTileRect(x0,y0,ww,hh,id,solidValue=false){
    for(let y=Math.max(1,y0); y<Math.min(h-1,y0+hh); y++){
      for(let x=Math.max(1,x0); x<Math.min(w-1,x0+ww); x++){
        tiles[y][x]=id; solid[y][x]=solidValue;
      }
    }
  }
  function decorateStrip(y0,hh){
    for(let y=y0; y<Math.min(h-1,y0+hh); y++) for(let x=2; x<w-2; x++) if((x+y)%7===0 && !solid[y][x]) tiles[y][x]=decor;
  }
  function areaFreePx(x,y,r=42){
    if(x<48||y<48||x>w*TILE-48||y>h*TILE-48) return false;
    const tx=Math.floor(x/TILE), ty=Math.floor(y/TILE);
    if(solid[ty]?.[tx]) return false;
    for(const a of reserved) if(Math.hypot(a.x-x,a.y-y)<a.r+r) return false;
    for(const p of props) if(Math.hypot(p.x-x,p.y-y)<r+28) return false;
    return true;
  }
  function addProp(name,x,y,solidProp=true){
    props.push({id:propId(name),name,x,y,solid:solidProp}); addReserved(x,y,solidProp?34:24);
  }
  function addDoor(tileX,tileY){
    const x=tileX*TILE+16, y=tileY*TILE+16;
    if(tileX>1&&tileY>1&&tileX<w-1&&tileY<h-1){
      solid[tileY][tileX]=false; tiles[tileY][tileX]=floor;
      props.push({id:propId('porta_madeira'),name:'porta_madeira',x,y,solid:true,open:false}); addReserved(x,y,28);
    }
  }
  function addBuilding(x0,y0,ww,hh,doorSide='S'){
    carveTileRect(x0,y0,ww,hh,floor,false);
    for(let x=x0; x<x0+ww; x++){
      tiles[y0][x]=wall; solid[y0][x]=true;
      tiles[y0+hh-1][x]=wall; solid[y0+hh-1][x]=true;
    }
    for(let y=y0; y<y0+hh; y++){
      tiles[y][x0]=wall; solid[y][x0]=true;
      tiles[y][x0+ww-1]=wall; solid[y][x0+ww-1]=true;
    }
    const dx=Math.floor(x0+ww/2), dy=Math.floor(y0+hh/2);
    if(doorSide==='S') addDoor(dx,y0+hh-1);
    else if(doorSide==='N') addDoor(dx,y0);
    else if(doorSide==='E') addDoor(x0+ww-1,dy);
    else addDoor(x0,dy);
    addReserved((x0+ww/2)*TILE,(y0+hh/2)*TILE,Math.max(ww,hh)*TILE*.65);
  }
  function scatterFromPool(pool,count,minX,maxX,minY,maxY,solidProp=true){
    for(let i=0;i<count;i++){
      let tries=0,x,y;
      do{ x=randRange(rng,minX,maxX); y=randRange(rng,minY,maxY); tries++; } while(!areaFreePx(x,y,solidProp?40:28)&&tries<80);
      if(tries<80) addProp(pool[Math.floor(rng()*pool.length)],x,y,solidProp);
    }
  }
  function scatterInTiles(pool,count,x0,x1,y0,y1,solidProp=true){
    scatterFromPool(pool,count,x0*TILE+16,x1*TILE-16,y0*TILE+16,y1*TILE-16,solidProp);
  }
  function addPropLine(name,x0,y0,count,stepX,stepY,jitter=0,solidProp=true){
    for(let i=0;i<count;i++) addProp(name,x0+i*stepX+randRange(rng,-jitter,jitter),y0+i*stepY+randRange(rng,-jitter,jitter),solidProp);
  }
  function laneReserve(x0,y0,x1,y1){ addReserved((x0+x1)/2,(y0+y1)/2,Math.max(x1-x0,y1-y0)*0.42); }

  const laneY=Math.floor(h/2)-2;
  carveTileRect(1,laneY,w-2,4,lv.theme==='metro'?decor:floor,false);
  decorateStrip(laneY,4);

  const randomPool=(lv.props||[]).filter(n=>n!=='porta_madeira' && n!=='bandeirinhas');
  const nonSolidNames=new Set(['poste_luz','bandeirinhas']);

  switch(lv.theme){
    case 'urbano':
      carveTileRect(1,laneY-1,w-2,6,decor,false);
      addBuilding(4,4,11,8,'S'); addBuilding(18,4,12,8,'S'); addBuilding(34,4,12,8,'S');
      addBuilding(8,h-12,12,8,'N'); addBuilding(25,h-12,12,8,'N'); addBuilding(41,h-12,10,8,'N');
      addPropLine('poste_luz',130,110,5,180,0,8,false); addPropLine('poste_luz',130,h*TILE-110,5,180,0,8,false);
      addPropLine('carro_popular',220,laneY*TILE-26,4,170,0,18,true); addPropLine('carro_popular',280,(laneY+5)*TILE+6,3,210,0,18,true);
      scatterInTiles(['arvore_mangueira','lixeira','hidrante'],10,2,w-2,2,h-2,false);
      scatterInTiles(['banco_praca','lixeira'],8,3,w-3,3,h-3,true);
      break;
    case 'feira':
      carveTileRect(1,5,w-2,h-10,floor,false);
      for(let r=0;r<4;r++) for(let c=0;c<6;c++) addProp('barraca_feira',190+c*140,110+r*86,false);
      addPropLine('poste_luz',150,88,6,135,0,5,false); addPropLine('poste_luz',150,h*TILE-90,6,135,0,5,false);
      scatterInTiles(['caixa_madeira','lixeira'],10,3,w-3,3,h-3,true);
      scatterInTiles(['barricada'],4,6,w-6,4,h-4,true);
      break;
    case 'escola':
      carveTileRect(10,9,w-20,h-18,decor,false);
      addBuilding(4,4,13,9,'S'); addBuilding(20,4,13,9,'S'); addBuilding(36,4,13,9,'S');
      addBuilding(10,h-13,12,9,'N'); addBuilding(26,h-13,12,9,'N');
      addPropLine('banco_praca',320,160,4,110,0,0,true); addPropLine('arvore_mangueira',300,h*TILE-140,4,120,0,12,true);
      scatterInTiles(['carteira_escola','maquina_lab'],14,6,w-6,6,h-6,true);
      scatterInTiles(['lixeira','poste_luz'],8,3,w-3,3,h-3,false);
      break;
    case 'cemiterio':
      carveTileRect(1,1,w-2,h-2,floor,false);
      carveTileRect(2,laneY-1,w-4,6,decor,false);
      for(let gy=4;gy<h-4;gy+=4){
        for(let gx=5;gx<18;gx+=3) addProp(rng()<.82?'tumulo':'arvore_mangueira',gx*TILE+16,gy*TILE+16,true);
        for(let gx=26;gx<w-5;gx+=3) addProp(rng()<.82?'tumulo':'arvore_mangueira',gx*TILE+16,gy*TILE+16,true);
      }
      addPropLine('poste_luz',220,150,6,165,0,0,false);
      break;
    case 'favela':
      carveTileRect(1,laneY-2,w-2,8,decor,false);
      addBuilding(4,4,8,7,'S'); addBuilding(14,6,8,7,'S'); addBuilding(25,4,8,7,'S'); addBuilding(36,6,8,7,'S');
      addBuilding(9,h-11,8,6,'N'); addBuilding(21,h-12,9,7,'N'); addBuilding(34,h-11,8,6,'N');
      addPropLine('muro_grafite',150,120,4,180,0,16,true); addPropLine('muro_grafite',160,h*TILE-120,4,180,0,16,true);
      scatterInTiles(['carro_popular','barricada','hidrante'],10,4,w-4,4,h-4,true);
      scatterInTiles(['poste_luz','arvore_mangueira'],8,3,w-3,3,h-3,false);
      break;
    case 'praia':
      carveTileRect(1,1,w-2,5,decor,false);
      carveTileRect(1,6,w-2,h-7,floor,false);
      for(let y=8;y<h-4;y+=5) for(let x=7;x<w-6;x+=6) if((x+y)%3!==0) addProp('guarda_sol',x*TILE+16,y*TILE+16,false);
      addPropLine('poste_luz',170,110,5,170,0,0,false); addPropLine('banco_praca',220,h*TILE-115,4,175,0,0,true);
      scatterInTiles(['caixa_madeira','lixeira','arvore_mangueira'],8,3,w-3,4,h-3,true);
      break;
    case 'metro':
      carveTileRect(3,5,w-6,h-10,floor,false);
      carveTileRect(18,8,w-36,h-16,decor,false);
      addBuilding(5,4,10,6,'S'); addBuilding(w-15,4,10,6,'S'); addBuilding(5,h-10,10,6,'N'); addBuilding(w-15,h-10,10,6,'N');
      for(let y=9;y<h-9;y+=6){ carveTileRect(20,y,w-40,2,wall,true); }
      addPropLine('escada_rolante',240,140,2,950,0,0,true); addPropLine('escada_rolante',240,h*TILE-140,2,950,0,0,true);
      scatterInTiles(['lixeira','barricada','maquina_lab'],10,4,w-4,4,h-4,true);
      break;
    case 'lab':
      carveTileRect(1,1,w-2,h-2,decor,false);
      carveTileRect(2,laneY-1,w-4,6,floor,false);
      addBuilding(4,4,10,8,'S'); addBuilding(17,4,10,8,'S'); addBuilding(30,4,10,8,'S'); addBuilding(43,4,8,8,'S');
      addBuilding(8,h-12,10,8,'N'); addBuilding(22,h-12,10,8,'N'); addBuilding(36,h-12,10,8,'N');
      scatterInTiles(['maquina_lab','caixa_madeira','barricada'],18,4,w-4,4,h-4,true);
      scatterInTiles(['lixeira'],6,3,w-3,3,h-3,false);
      break;
    case 'junina':
      carveTileRect(1,1,w-2,h-2,floor,false);
      carveTileRect(10,8,w-20,h-16,decor,false);
      for(let x=6;x<w-6;x+=4) addProp('bandeirinhas',x*TILE+16,72,false);
      for(let r=0;r<3;r++) for(let c=0;c<5;c++) addProp('barraca_feira',200+c*150,125+r*102,false);
      addPropLine('poste_luz',170,h*TILE-95,5,160,0,0,false);
      scatterInTiles(['caixa_madeira','barricada'],10,4,w-4,4,h-4,true);
      break;
    case 'shopping':
      carveTileRect(1,1,w-2,h-2,floor,false);
      carveTileRect(2,laneY-2,w-4,8,decor,false);
      addBuilding(4,4,10,8,'S'); addBuilding(16,4,10,8,'S'); addBuilding(28,4,10,8,'S'); addBuilding(40,4,10,8,'S');
      addBuilding(10,h-12,10,8,'N'); addBuilding(24,h-12,10,8,'N'); addBuilding(38,h-12,10,8,'N');
      addPropLine('banco_praca',280,175,3,170,0,0,true); addPropLine('escada_rolante',250,laneY*TILE+32,2,560,0,0,true);
      scatterInTiles(['lixeira','caixa_madeira'],12,4,w-4,4,h-4,true);
      break;
    default:
      scatterFromPool(randomPool,18,150,(w-4)*TILE,80,(h-3)*TILE,true);
      break;
  }

  if(randomPool.length){
    scatterFromPool(randomPool.filter(n=>!nonSolidNames.has(n)),5+Math.floor(idx/2),150,(w-4)*TILE,84,(h-3)*TILE,true);
    const nonsolid=[...nonSolidNames].filter(n=>randomPool.includes(n));
    if(nonsolid.length) scatterFromPool(nonsolid,4,140,(w-4)*TILE,88,(h-3)*TILE,false);
  }

  const npcs=[]; const npcCount=5+Math.floor(idx/2);
  for(let i=0;i<npcCount;i++){
    let tries=0,x,y;
    do{ x=randRange(rng,170,(w-5)*TILE); y=randRange(rng,70,(h-3)*TILE); tries++; } while(!areaFreePx(x,y,48)&&tries<80);
    if(tries<80) npcs.push(new NPC(lv.npcs[i%lv.npcs.length],x,y));
  }
  const enemies=[]; const enemyCount=9+idx*2;
  for(let i=0;i<enemyCount;i++){
    let tries=0,x,y;
    do{ x=randRange(rng,260,(w-4)*TILE); y=randRange(rng,70,(h-3)*TILE); tries++; } while(!areaFreePx(x,y,42)&&tries<90);
    if(tries<90) enemies.push(new Enemy(lv.enemies[i%lv.enemies.length],x,y,idx));
  }
  const pickups=[]; const startItems=['kit_cura','coxinha','agua_turbinada','estilingue','spray_fogo','chinelo_explosivo','rojao_junino','caldo_cana'];
  for(let i=0;i<7;i++){
    let tries=0,x,y;
    do{ x=randRange(rng,150,(w-4)*TILE); y=randRange(rng,70,(h-3)*TILE); tries++; } while(!areaFreePx(x,y,36)&&tries<70);
    if(tries<70) pickups.push(new Pickup(startItems[(i+idx)%startItems.length],x,y));
  }

  if(['lab','favela','cemiterio'].includes(lv.theme)){
    for(let i=0;i<5+idx;i++){
      let tries=0,x,y;
      do{ x=randRange(rng,220,(w-5)*TILE); y=randRange(rng,80,(h-4)*TILE); tries++; } while(!areaFreePx(x,y,34)&&tries<70);
      if(tries<70) hazards.push({x,y,r:26,t:999,damage:6,type:lv.theme==='favela'?'fire':'poison',dead:false});
    }
  }
  const boss=lv.boss? new Boss(lv.boss,(w-8)*TILE,h*TILE/2,idx):null;
  return {w,h,tiles,solid,props,npcs,enemies,pickups,hazards,boss,spawn,exit};
}
function friendlyName(s){ return s.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()); }
function getWrappedLines(ctx,text,maxWidth){ const words=text.split(' '); const lines=[]; let line=''; for(const word of words){ const test=line? line+' '+word : word; if(ctx.measureText(test).width>maxWidth && line){ lines.push(line); line=word; } else line=test; } if(line) lines.push(line); return lines; }
function wrapText(ctx,text,x,y,maxWidth,lineHeight){ const lines=getWrappedLines(ctx,text,maxWidth); for(const line of lines){ ctx.fillText(line,x,y); y+=lineHeight; } return lines.length; }

window.addEventListener('load',()=>new ZNQGame());
})();
