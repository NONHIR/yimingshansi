
let savedTheme = 'light';
try { savedTheme = localStorage.getItem('game-theme') || 'light'; } catch (e) { /* 本地预览/隐私模式下可能禁止 localStorage */ }
document.body.setAttribute('data-theme', savedTheme);
let themeToggleClicks = 0;
let easterEggShown = false;
let musicPlaying = false;
const musicTracks = [
  { title: '没有共产党就没有新中国', artist: '本地音乐', src: '没有共产党就没有新中国.mp3' }
];
const defaultMusicTrack = musicTracks[0];
const guideKey = 'military-training-guide-hidden';
let guidePage = 0;
const guidePages = [
  {
    title: '先活下来，再争表现',
    content: '<p>这是一个 <strong>10 回合、30 天</strong>的生存模拟。每回合先处理一个事件，再经历两天自由行动。</p><p>玩法就是根据你的选项决定你是什么结局（真的结局哦），部分根据事实改编。</p>'
  },
  {
    title: '每天的数值怎么走',
    content: '<ul class="guide-list"><li><b>认真训练</b><br>评分 +5、教官A好感 +2、教官B好感 -1；行动消耗理智 10，连续训练会加快核心数值消耗！</li><li><b>摸鱼</b><br>行动恢复理智 +10，扣除每日消耗后净恢复 +5；评分 -3、教官A -1、教官B +2。</li><li><b>跟队长请假</b><br>生命 +10，行动恢复理智 +10，扣除每日消耗后净恢复 +5；评分 -5。</li><li><b>每天结束</b><br>所有行动后固定消耗理智 5。数值变化会在顶部即时显示哦。</li></ul>'
  },
  {
    title: '选项怎么判断',
    content: '<p>先看文字，再思考可能影响的数值：想冲评分和教官A好感，就偏向训练；状态危险时，优先跟队长请假或使用背包补给。</p><p>带有风险的选项概率被抓，有的选项选项需要足够现金。第 5 回合会获得父母补助，并开放第二次补货。</p><p><strong>第一回合结束时，生命和理智会被调整为 50。</strong>评分低于等于 15 会出现危险提示，低于 0 才会触发出局确认；生命 ≤ 0、理智 ≤ 0、金钱 < -20 也会触发出局确认。</p><p><strong>补给效果会写在商店里。</strong>买完后进入背包，点击物品即可使用。</p>'
  }
];
document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.getElementById('themeToggle');
  if(toggle){
    toggle.onclick = function(){
      themeToggleClicks++;
      if (themeToggleClicks >= 3 && !easterEggShown) openEasterEgg();
    };
  }

  const easterEggClose = document.getElementById('easterEggClose');
  if (easterEggClose) easterEggClose.onclick = closeEasterEgg;

  const musicToggle = document.getElementById('musicToggle');
  if (musicToggle) musicToggle.onclick = toggleMusicPlayer;

  const gameMusic = document.getElementById('gameMusic');
  const musicPlayButton = document.getElementById('musicPlayButton');
  const musicProgress = document.getElementById('musicProgress');
  const musicCloseButton = document.getElementById('musicCloseButton');
  if (gameMusic) {
    gameMusic.src = defaultMusicTrack.src;
    gameMusic.addEventListener('play', function(){ musicPlaying = true; updateMusicButton(); updateMusicPlayer(); });
    gameMusic.addEventListener('pause', function(){ musicPlaying = false; updateMusicButton(); updateMusicPlayer(); });
    gameMusic.addEventListener('timeupdate', updateMusicProgress);
    gameMusic.addEventListener('ended', function(){ gameMusic.currentTime = 0; gameMusic.play(); });
    gameMusic.play().catch(function() {});
  }
  document.addEventListener('pointerdown', startMusic, { once: true });
  if (musicPlayButton) musicPlayButton.onclick = toggleMusic;
  if (musicProgress) musicProgress.oninput = seekMusic;
  if (musicCloseButton) musicCloseButton.onclick = closeMusicPlayer;
  document.addEventListener('pointerdown', function(event) {
    const player = document.getElementById('musicPlayer');
    if (player && player.classList.contains('is-open') && !player.contains(event.target) && event.target !== musicToggle) {
      closeMusicPlayer();
    }
  });

  const backpackTitle = document.getElementById('backpackTitle');
  if (backpackTitle) {
    backpackTitle.onclick = toggleBackpack;
    backpackTitle.onkeydown = function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleBackpack();
      }
    };
  }

  const guideNext = document.getElementById('guideNextBtn');
  const guideSkip = document.getElementById('guideSkipBtn');
  const guideNever = document.getElementById('guideNeverBtn');
  if (guideNext) guideNext.onclick = nextGuidePage;
  if (guideSkip) guideSkip.onclick = closeGuide;
  if (guideNever) guideNever.onclick = function(){
    try { localStorage.setItem(guideKey, '1'); } catch (e) {}
    closeGuide();
  };
});

function startMusic() {
  const gameMusic = document.getElementById('gameMusic');
  if (gameMusic) gameMusic.play().catch(function() {});
}

function stopMusic() {
  const gameMusic = document.getElementById('gameMusic');
  if (gameMusic) gameMusic.pause();
}

function toggleMusic() {
  if (musicPlaying) stopMusic();
  else startMusic();
}

function toggleMusicPlayer() {
  const player = document.getElementById('musicPlayer');
  if (!player) return;
  const isOpen = player.classList.toggle('is-open');
  player.setAttribute('aria-hidden', String(!isOpen));
  if (isOpen) updateMusicPlayer();
}

function closeMusicPlayer() {
  const player = document.getElementById('musicPlayer');
  if (!player) return;
  player.classList.remove('is-open');
  player.setAttribute('aria-hidden', 'true');
}

function updateMusicProgress() {
  const gameMusic = document.getElementById('gameMusic');
  const progress = document.getElementById('musicProgress');
  if (gameMusic && progress && gameMusic.duration) progress.value = (gameMusic.currentTime / gameMusic.duration) * 100;
}

function seekMusic() {
  const gameMusic = document.getElementById('gameMusic');
  const progress = document.getElementById('musicProgress');
  if (gameMusic && progress && gameMusic.duration) gameMusic.currentTime = (progress.value / 100) * gameMusic.duration;
}

function updateMusicPlayer() {
  const musicPlayButton = document.getElementById('musicPlayButton');
  if (!musicPlayButton) return;
  musicPlayButton.textContent = musicPlaying ? '❚❚' : '▶';
  musicPlayButton.title = musicPlaying ? '暂停音乐' : '播放音乐';
  musicPlayButton.setAttribute('aria-label', musicPlayButton.title);
}

function updateMusicButton() {
  const button = document.getElementById('musicToggle');
  if (!button) return;
  button.textContent = musicPlaying ? '♫' : '♪';
  button.title = musicPlaying ? '暂停音乐' : '播放音乐';
  button.setAttribute('aria-label', button.title);
  button.classList.toggle('is-playing', musicPlaying);
}

function openEasterEgg() {
  easterEggShown = true;
  const overlay = document.getElementById('easterEggOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
}

function closeEasterEgg() {
  const overlay = document.getElementById('easterEggOverlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
}

function openGameGuide() {
  guidePage = 0;
  renderGuidePage();
  const overlay = document.getElementById('guideOverlay');
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
}

function renderGuidePage() {
  const page = guidePages[guidePage];
  document.getElementById('guideProgress').textContent = '新手引导 · ' + (guidePage + 1) + ' / ' + guidePages.length;
  document.getElementById('guideTitle').textContent = page.title;
  document.getElementById('guideContent').innerHTML = page.content;
  document.getElementById('guideNextBtn').textContent = guidePage === guidePages.length - 1 ? '完成教程' : '下一步';
}

function nextGuidePage() {
  if (guidePage < guidePages.length - 1) {
    guidePage++;
    renderGuidePage();
    return;
  }
  closeGuide();
}

function closeGuide() {
  const overlay = document.getElementById('guideOverlay');
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
}

function toggleBackpack() {
  const backpack = document.getElementById('backpackCard');
  const title = document.getElementById('backpackTitle');
  if (!backpack || !title) return;
  const isOpen = backpack.classList.toggle('is-open');
  title.setAttribute('aria-expanded', String(isOpen));
  title.setAttribute('title', isOpen ? '收起背包' : '展开背包');
}

const state = {
  round: 1, health: 100, sanity: 100, money: 80, score: 50,
  instructorA: 0, instructorB: 0, trainCount: 0,
  actionsThisRound: 0, phase: 'event', gameOver: false,
  parentMoneyGiven: false, tauntApplied: false, effects: [], inventory: {},
  shopPhase: 'none',
};

let lastState = null;
let pendingEnd = null;

const shopItems = [
  { id: 'cola', name: '冰可乐', desc: '冰镇小甜水，一口下去快爽死了啊混蛋', effectText: '理智 +15', price: 18, type: 'restore', effect: { sanity: 15 } },
  { id: 'medicine', name: '藿香正气水', desc: '妈呀大姐苦死了，但这玩意真能救命', effectText: '生命 +20', price: 25, type: 'restore', effect: { health: 20 } },
  { id: 'energy', name: '白开水', desc: '不是这白开水怎么没味啊，日常补水用', effectText: '生命 +5，理智 +10', price: 32, type: 'restore', effect: { health: 5, sanity: 10 } },
  { id: 'insole', name: '加厚鞋垫', desc: '站军姿时脚底板没那么疼了，苟且偷生捏', effectText: '认真训练免除生命消耗，持续 3 次', price: 45, type: 'buff', buff: { type: 'noHealthCost', count: 3 } },
  { id: 'sunscreen', name: '防晒霜', desc: '烈日下不至于晒到脱皮，崩溃ing', effectText: '认真训练理智消耗减半，持续 3 次', price: 38, type: 'buff', buff: { type: 'halfSanityCost', count: 3 } },
  { id: 'notebook', name: '训练笔记', desc: '666卷到家了，教官会刮目相看', effectText: '认真训练额外获得评分 +2，持续 5 次', price: 35, type: 'buff', buff: { type: 'extraScore', count: 5, val: 2 } },
  { id: 'giftA', name: '一顿漂亮饭', desc: '规矩派的人情事故，教官A会记在心里', effectText: '教官A好感度 +15', price: 65, type: 'special', effect: { instructorA: 15 } },
  { id: 'giftB', name: '一长条中华', desc: '666日子不过了，但是教官B会记在心里', effectText: '教官B好感度 +15', price: 65, type: 'special', effect: { instructorB: 15 } },
];


const itemIcons = {
  cola: '🥤', medicine: '🧴', energy: '⚡', insole: '👟',
  sunscreen: '☀️', notebook: '📓', giftA: '🚬', giftB: '🍵'
};

const itemUseText = {
  cola: '喝下一口冰可乐，脑子清醒了一点。',
  medicine: '用了藿香正气水，身体状态缓了回来。',
  energy: '灌下一罐能量饮料，重新打起精神。',
  insole: '换上加厚鞋垫，接下来的训练舒服了一点。',
  sunscreen: '补了一层防晒，烈日下没那么难熬了。',
  notebook: '翻开训练笔记，快速复习了动作要领。',
  giftA: '你和教官A吃了顿漂亮饭，哥不白吃，哥记在心里。',
  giftB: '把准备好的烟交给教官B，教官快被你的礼物吓哭了，误闯天家。'
};

function addItem(id) {
  state.inventory[id] = (state.inventory[id] || 0) + 1;
  renderBackpack();
}

function useItem(id) {
  const item = shopItems.find(function(i){ return i.id === id; });
  if (!item || !state.inventory[id]) return;

  const prevState = JSON.parse(JSON.stringify(state));
  let consumed = true;

  if(item.type === 'restore'){
    applyStatDelta(item.effect);
  } else if(item.type === 'buff'){
    state.effects.push(Object.assign({}, item.buff));
  } else if(item.type === 'special'){
    applyStatDelta(item.effect);
  } else {
    consumed = false;
  }

  if(!consumed) return;

  state.inventory[id]--;
  if(state.inventory[id] <= 0) delete state.inventory[id];

  log('【背包】' + (itemUseText[id] || ('使用了：' + item.name)));
  updateStatus(prevState);
  renderBackpack();
}

function renderBackpack(){
  const box = document.getElementById('backpackItems');
  if(!box) return;
  box.innerHTML = '';

  const ids = Object.keys(state.inventory).filter(id => state.inventory[id] > 0);
  if(ids.length === 0){
    const empty = document.createElement('div');
    empty.className = 'empty-bag';
    empty.textContent = '花光光啦？';
    box.appendChild(empty);
    return;
  }

  ids.forEach(function(id){
    const item = shopItems.find(function(i){ return i.id === id; });
    if(!item) return;

    const row = document.createElement('div');
    row.className = 'backpack-item';
    row.title = '点击使用：' + item.name;
    row.onclick = function(){ useItem(id); };
    row.innerHTML =
      '<div class="backpack-icon">' + (itemIcons[id] || '📦') + '</div>' +
      '<div class="backpack-info">' +
        '<div class="backpack-name">' + item.name + '</div>' +
        '<div class="backpack-desc">' + item.desc + '</div>' +
        '<div class="backpack-effect">效果：' + item.effectText + '</div>' +
      '</div>' +
      '<div class="backpack-count">×' + state.inventory[id] + '</div>';
    box.appendChild(row);
  });
}

const events = [
  {
    id: 1, title: '第1回合：要求打扫卫生',
    text: '教官A黑着脸走进来：“厕所里有个污渍，全宿舍趴下做俯卧撑！”\n\n这是你到这里的第一天。你好像意识到，这里似乎和电视剧里演的不太一样呢。',
    options: [
      { text: '弯腰擦好每一处污渍，汗水滴在水泥地上', effects: { score: 5, instructorA: 3, sanity: -10 } },
      { text: '扫帚划过地面，留下几道敷衍的痕迹', effects: { score: -3, instructorB: 3, sanity: 5 } },
      { text: '摸出零食让同学帮忙干', effects: { money: -20, sanity: 10 }, req: { money: 20 } }
    ]
  },
  {
    id: 2, title: '第2回合：学唱红歌',
    text: '晚上集合，教官B带着大家学唱军歌。你五音不全，旁边的人已经笑出声了。',
    options: [
      { text: '扯着嗓子吼，跑调跑到姥姥家也不管了', effects: { score: 5, instructorA: 2, sanity: -10 } },
      { text: '嘴唇蠕动，声音比蚊子还小', effects: { score: 0, instructorB: 3, sanity: 0 } },
      { text: '捂着肚子蹲下，俺不会唱', effects: { score: -5, instructorB: 2, sanity: 8 } }
    ]
  },
  {
    id: 3, title: '第3回合：熄灯后的手机',
    text: '熄灯号已经吹过，但你发现室友在被窝里偷偷玩手机，屏幕光照在他脸上。好小子你完蛋了',
    options: [
      { text: '掀开被子一角，屏幕的蓝光映在脸上', effects: { sanity: 10, instructorB: 2, score: -3 }, risk: { chance: 0.3, text: '教官A查房破门而入！', effects: { score: -10, instructorA: -5 } } },
      { text: '翻身下床，敲响教官A的房门', effects: { instructorA: 5, instructorB: -5, score: 3, sanity: -5 } },
      { text: '翻个身，鼾声响起', effects: { sanity: 3 } }
    ]
  },
  {
    id: 4, title: '第4回合：外卖的诱惑',
    text: '训练结束后，有人神秘兮兮地说：“今晚偷偷点外卖，章丘烤鸡或者炸串，要一起吗？”',
    options: [
      { text: '打开美团点，烤鸡的香气钻进鼻子', effects: { money: -25, sanity: 12, health: 8 }, req: { money: 25 }, risk: { chance: 0.25, text: '巡逻队的脚步声在走廊响起！', effects: { score: -10, instructorA: -5 } } },
      { text: '摆摆手，转身走向食堂', effects: { instructorA: 3, sanity: -5 } },
      { text: '记下那个人的名字，明天阴他一波', effects: { instructorA: 5, instructorB: -5, score: 3, sanity: -8 } }
    ]
  },
  {
    id: 5, title: '第5回合：啊哦身体垮了',
    text: '连续几天的暴晒和高强度训练，你感觉眼前发黑。眼镜腿上的汗水流进眼角，刺痛难忍。\n\n【还有父母转账+60元到账】',
    options: [
      { text: '咬牙站直，眼前的黑点像飞蚊一样乱撞', effects: { health: -15, score: 5, instructorA: 3 } },
      { text: '扶着墙走向医务室，哇还有空调', effects: { money: -15, health: 20, score: -3 }, req: { money: 15 } },
      { text: '捂着肚子倒在床上，肚肚痛~', effects: { health: 10, score: -5, instructorB: 3, sanity: 8 } }
    ]
  },
  {
    id: 6, title: '第6回合：临时班委',
    text: '你被任命为临时班委，负责管理宿舍纪律。两个室友正在吵架，一个要开空调，一个说冻死了。',
    options: [
      { text: '啪地关掉空调，宿舍瞬间安静', effects: { instructorA: 5, instructorB: -3, score: 3, sanity: -5 } },
      { text: '把两人拉开，诉说道理', effects: { instructorA: -3, instructorB: 5, score: -2, sanity: 5 } },
      { text: '拉过被子蒙住头，都去死吧', effects: { score: -5, sanity: 8 } }
    ]
  },
  {
    id: 7, title: '第7回合：部门招新',
    text: '学生会的招新海报贴满了公告栏。有人说加入部门可以玩，有人说只是多干活（我们学校不存在社团性质官方部门所以就是纯苦力）。',
    options: [
      { text: '在报名表上写下自己的名字', effects: { sanity: -8, score: 3 } },
      { text: '把海报揉成一团扔进垃圾桶', effects: { sanity: 5, instructorA: 2 } },
      { text: '信封塞进负责人的抽屉', effects: { money: -30, score: 8 }, req: { money: 30 } }
    ]
  },
  {
    id: 8, title: '第8回合：课堂上的困意',
    text: '马原课上，老师正在讲那些重要的课程？你的眼皮越来越重，昨晚只睡了四小时呢。',
    options: [
      { text: '指甲掐进大腿，疼痛让人清醒', effects: { sanity: -10, score: 3, instructorA: 2 } },
      { text: '头一点一点，直接睡觉似磕头好吧', effects: { sanity: 12, score: -5, instructorB: 2 } },
      { text: '掏出零钱买杯速溶咖啡', effects: { money: -15, sanity: 5, score: 3 }, req: { money: 15 } }
    ]
  },
  {
    id: 9, title: '第9回合：小道消息',
    text: '有人偷偷说，校内可以买到“特价菜水果”——是拼多多多多买菜。很实惠好用，新生记得从这买水果很便宜。',
    options: [
      { text: '跟着买第二天自提，爽死了好吃还便宜', effects: { money: -20, health: 10, sanity: 10 }, req: { money: 20 }, risk: { chance: 0.3, text: '教官A站在校门口的路灯下！', effects: { score: -10, instructorA: -5 } } },
      { text: '摇头，转身去买小卖部溢价水果', effects: { instructorA: 3 } },
      { text: '把那个人的名字记在小本子上阴他一波', effects: { instructorA: 5, instructorB: -5, score: 5, sanity: -5 } }
    ]
  },
  {
    id: 10, title: '第10回合：最终审判',
    text: '最后三天。会操在即，名单还没宣读，空气已经绷直了。\n\n教官A从队列前走过，教官B在队尾停了一下。宣判会在这三天结束后到来——你还能决定自己以什么面目站到那一天。',
    options: [
      { text: '挺胸收腹，目光平视，把每个动作做到教官A点头为止', effects: { score: 5, instructorA: 4, sanity: -8 } },
      { text: '趁他们看不见把肌肉活动活动，太酸爽了', effects: { score: -3, instructorB: 4, sanity: 6 } },
      { text: '只把队列安安静静站完，阿巴阿巴~', effects: { score: 2, sanity: -4 } }
    ]
  }
];

function calendarDay() {
  if (state.phase === 'judgment') return 30;
  if (state.phase === 'action') return (state.round - 1) * 3 + 2 + state.actionsThisRound;
  return (state.round - 1) * 3 + 1;
}

function log(msg) {
  const logArea = document.getElementById('logArea');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = '第' + state.round + '回合 · 第' + calendarDay() + '天';
  const message = document.createElement('span');
  message.className = 'log-message';
  message.textContent = msg;
  entry.append(time, message);
  logArea.prepend(entry);
}

function logEventChoice(option, effects) {
  const text = option.text;
  const detail = text.indexOf('捡起') >= 0 ? '你选择把麻烦一件件处理掉，至少没人能说你没有认真面对。' :
    text.indexOf('扫帚') >= 0 ? '你把动作做完了，但没有把全部力气交出去，给自己留了一点余地。' :
    text.indexOf('手机') >= 0 ? '屏幕的微光短暂地把疲惫推开，代价是心里始终悬着一根弦。' :
    text.indexOf('休息') >= 0 ? '你没有逞强，先把快要散架的身体收了回来。' :
    '你做出了当下最愿意承担的选择，结果也随之落在身上。';
  const changes = [];
  if (effects.health) changes.push('生命 ' + (effects.health > 0 ? '+' : '') + effects.health);
  if (effects.sanity) changes.push('理智 ' + (effects.sanity > 0 ? '+' : '') + effects.sanity);
  if (effects.money) changes.push('金钱 ' + (effects.money > 0 ? '+' : '') + effects.money);
  if (effects.score) changes.push('评分 ' + (effects.score > 0 ? '+' : '') + effects.score);
  log('【选择】' + text + '。' + detail + (changes.length ? '（' + changes.join('，') + '）' : ''));
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function clampStats() {
  state.health = clamp(state.health, 0, 100);
  state.sanity = clamp(state.sanity, 0, 100);
}

function updateStatus(prevState = null) {
  clampStats();

  const pairs = [
    ['valHealth', state.health],
    ['valSanity', state.sanity],
    ['valMoney', state.money],
    ['valScore', state.score],
    ['valA', state.instructorA],
    ['valB', state.instructorB]
  ];

  function animateValue(el, next, prev){
    const changed = Number.isFinite(prev) && next !== prev;
    el.textContent = next;
    if(!changed) return;

    el.classList.remove('changed-up','changed-down');
    void el.offsetWidth;
    el.classList.add(next > prev ? 'changed-up' : 'changed-down');
    setTimeout(() => el.classList.remove('changed-up','changed-down'), 380);

    const delta = next - prev;
    const float = document.createElement('span');
    float.className = 'float-delta ' + (delta > 0 ? 'up' : 'down');
    float.textContent = (delta > 0 ? '+' : '') + delta;
    el.appendChild(float);
    setTimeout(() => float.remove(), 900);
  }

  pairs.forEach(function(pair){
    const el = document.getElementById(pair[0]);
    if(!el) return;
    let prev = null;
    if(prevState){
      const keyMap = {valHealth:'health',valSanity:'sanity',valMoney:'money',valScore:'score',valA:'instructorA',valB:'instructorB'};
      prev = prevState[keyMap[pair[0]]];
    }
    animateValue(el, pair[1], prev);
  });

  document.getElementById('valRound').textContent = state.round + '/10';
  const dayEl = document.getElementById('valDay');
  if (dayEl) dayEl.textContent = calendarDay() + '/30';

  document.getElementById('shopHealth').textContent = state.health;
  document.getElementById('shopSanity').textContent = state.sanity;
  document.getElementById('shopMoney').textContent = state.money;
  document.getElementById('shopScore').textContent = state.score;
  document.getElementById('shopA').textContent = state.instructorA;
  document.getElementById('shopB').textContent = state.instructorB;
  renderBackpack();
  updateDangerEffects();
}


function updateDangerEffects(){
  const body = document.body;
  body.classList.toggle('low-health', state.health < 30 && state.health > 0);
  body.classList.toggle('low-sanity', state.sanity < 20 && state.sanity > 0);
  body.classList.toggle('low-score', state.score <= 15 && state.score > 0);
}

function saveSnapshot() {
  lastState = JSON.parse(JSON.stringify(state));
}

function applyStatDelta(effects) {
  if (!effects) return;
  if (effects.health !== undefined) state.health += effects.health;
  if (effects.sanity !== undefined) state.sanity += effects.sanity;
  if (effects.money !== undefined) state.money += effects.money;
  if (effects.score !== undefined) state.score += effects.score;
  if (effects.instructorA !== undefined) state.instructorA += effects.instructorA;
  if (effects.instructorB !== undefined) state.instructorB += effects.instructorB;
  clampStats();
}

function applyEffects(effects, risk) {
  applyStatDelta(effects);
  if (risk && Math.random() < risk.chance) {
    log('【被抓到了！】' + risk.text);
    applyStatDelta(risk.effects);
  }
}

function checkEnd() {
  if (state.health <= 0) return { title: '送医离校', desc: '你在训练场上晕倒了。救护车把你拉走，医院诊断是懒癌晚期没救了，你的军训生涯就此结束。拜拜了兄弟' };
  if (state.sanity <= 0) return { title: '精神崩溃', desc: '你站在操场上，忽然大笑起来，然后大哭。教官们摇了摇头，派人把你送到了山东省精神病院。你在里面发了疯的踢正步...' };
  if (state.money < -20) return { title: '贷款危机', desc: '你的债务超过了可承受范围。你借了高利贷一块钱还一个亿，父母接到电话吓哭了，连夜把你接走，跑路了兄弟' };
  if (state.score < 0) return { title: '队长约谈', desc: '你的评分跌破了队伍底线。队长把你叫去办公室。谈话完，你决定复读一年离开这个地方。这是一个明智的选择。一年后你考上了山东大学，可喜可贺' };
  return null;
}

function tryEndOrContinue() {
  var endInfo = checkEnd();
  if (endInfo) {
    showConfirm(endInfo);
    return true;
  }
  return false;
}

function showConfirm(endInfo) {
  pendingEnd = endInfo;
  document.getElementById('confirmTitle').textContent = '迎来结局：' + endInfo.title;
  document.getElementById('confirmText').textContent = '你可以返回上一步，或者确认此结局。';
  document.getElementById('confirmOverlay').style.display = 'block';
  document.getElementById('confirmPanel').style.display = 'block';
}

function reopenShop() {
  const overlay = document.getElementById('shopOverlay');
  const stack = document.getElementById('shopStack');
  overlay.style.display = 'block';
  stack.style.display = 'flex';
  requestAnimationFrame(function() {
    overlay.classList.add('is-visible');
    stack.classList.add('is-visible');
  });
  renderShop();
}

function undoLastAction() {
  if (!lastState) return;
  Object.assign(state, JSON.parse(JSON.stringify(lastState)));
  pendingEnd = null;
  document.getElementById('confirmOverlay').style.display = 'none';
  document.getElementById('confirmPanel').style.display = 'none';
  updateStatus();
  log('【撤销】返回了上一步');
  if (state.shopPhase === 'initial' || state.shopPhase === 'round5') {
    reopenShop();
    return;
  }
  if (state.phase === 'event') {
    showEvent(false);
  } else if (state.phase === 'judgment') {
    showFinalJudgment(false);
  } else {
    showActionPhase(false);
  }
}

function confirmEndGame() {
  if (!pendingEnd) return;
  document.getElementById('confirmOverlay').style.display = 'none';
  document.getElementById('confirmPanel').style.display = 'none';
  document.getElementById('shopOverlay').style.display = 'none';
  document.getElementById('shopStack').style.display = 'none';
  endGame(pendingEnd.title, pendingEnd.desc);
}

function fadeTransition(callback) {
  var wrapper = document.getElementById('fadeWrapper');
  wrapper.classList.add('fade-out');
  setTimeout(function() {
    callback();
    wrapper.classList.remove('fade-out');
    wrapper.classList.add('fade-in');
    setTimeout(function() { wrapper.classList.remove('fade-in'); }, 350);
  }, 350);
}

function doTraining() {
  var healthCost = 0, sanityCost = 10, scoreGain = 5;
  state.trainCount++;
  if (state.trainCount % 2 === 0) healthCost = 10;

  var noHealthBuff = state.effects.find(function(e) { return e.type === 'noHealthCost' && e.count > 0; });
  if (noHealthBuff) { healthCost = 0; noHealthBuff.count--; if (noHealthBuff.count <= 0) log('【加厚鞋垫】效果已耗尽'); }

  var halfSanityBuff = state.effects.find(function(e) { return e.type === 'halfSanityCost' && e.count > 0; });
  if (halfSanityBuff) { sanityCost = 5; halfSanityBuff.count--; if (halfSanityBuff.count <= 0) log('【防晒霜】效果已耗尽'); }

  var extraScoreBuff = state.effects.find(function(e) { return e.type === 'extraScore' && e.count > 0; });
  if (extraScoreBuff) { scoreGain += extraScoreBuff.val; extraScoreBuff.count--; if (extraScoreBuff.count <= 0) log('【训练笔记】效果已耗尽'); }

  state.health -= healthCost;
  state.sanity -= sanityCost;
  state.score += scoreGain;
  state.instructorA += 2;
  state.instructorB -= 1;
  clampStats();
  log('【训练】你把动作一遍遍做稳，汗水顺着下巴滴落。评分上升了，但身体和理智都在提醒你别逞强。');
}

function doSlack() {
  state.sanity += 10;
  state.score -= 3;
  state.instructorA -= 1;
  state.instructorB += 2;
  clampStats();
  log('【摸鱼】你找到队列里短暂的阴影，教官B的视线掠过，却没有点破。精神缓了一口气，评分也付出了代价。');
}

function doRest() {
  state.health += 10;
  state.sanity += 10;
  state.score -= 5;
  clampStats();
  log('【请假】你向队长说明情况，暂时离开训练队列。身体缓过来一些，但评分也留下了缺口。');
}

function dailyCost() {
  state.sanity -= 5;
  clampStats();
  if (state.sanity <= 35 && state.sanity > 0) {
    log('【状态警告】理智正在逼近危险线，下一天不能再硬撑了。');
  }
}

function grantParentMoneyIfNeeded() {
  if (state.round === 5 && !state.parentMoneyGiven) {
    const prevState = JSON.parse(JSON.stringify(state));
    state.money += 60;
    state.parentMoneyGiven = true;
    log('【父母转账】钱到了。屏幕亮了一下，又暗下去。');
    updateStatus(prevState);
  }
}

function openInitialShop() {
  startMusic();
  state.shopPhase = 'initial';
  saveSnapshot();
  document.getElementById('shopTitle').textContent = '军营小卖部';
  document.getElementById('shopSubtitle').textContent = '出发前的准备。口袋里只有八十块，先想清楚最需要什么。';
  document.getElementById('shopCloseBtn').textContent = '进入军训';
  reopenShop();
}

function openRound5Shop() {
  state.shopPhase = 'round5';
  saveSnapshot();
  document.getElementById('shopTitle').textContent = '军营小卖部';
  document.getElementById('shopSubtitle').textContent = '父母刚打来一笔钱。这是第二次，也是最后一次补货的机会。';
  document.getElementById('shopCloseBtn').textContent = '继续训练';

  const overlay = document.getElementById('round5StoryOverlay');
  const btn = document.getElementById('round5StoryBtn');
  if(overlay){
    overlay.style.display = 'flex';
    btn.onclick = function(){
      overlay.style.display = 'none';
      reopenShop();
    };
  } else {
    reopenShop();
  }
}

function closeShop() {
  if (tryEndOrContinue()) return;
  const overlay = document.getElementById('shopOverlay');
  const stack = document.getElementById('shopStack');
  overlay.classList.remove('is-visible');
  stack.classList.remove('is-visible');
  setTimeout(function() {
    overlay.style.display = 'none';
    stack.style.display = 'none';
  }, 200);
  if (state.shopPhase === 'initial') {
    state.shopPhase = 'none';
    state.phase = 'event';
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('statusBar').style.display = 'grid';
    document.getElementById('diaryCard').style.display = 'block';
    const backpack = document.getElementById('backpackCard');
    const backpackTitle = document.getElementById('backpackTitle');
    backpack.classList.remove('is-open');
    backpackTitle.setAttribute('aria-expanded', 'false');
    backpackTitle.setAttribute('title', '展开背包');
    backpack.style.display = 'block';
    updateStatus();
    showEvent(true);
  } else if (state.shopPhase === 'round5') {
    state.shopPhase = 'none';
    state.phase = 'action';
    state.actionsThisRound = 0;
    showActionPhase(true);
  }
}

function renderShop() {
  var div = document.getElementById('shopItems');
  div.innerHTML = '';
  shopItems.forEach(function(item) {
    var row = document.createElement('div');
    row.className = 'shop-item';
    var canBuy = state.money >= item.price;
    row.innerHTML = '<div class="shop-item-info"><div class="shop-item-name">' + item.name + '</div><div class="shop-item-desc">' + item.desc + '</div><div class="shop-item-effect">效果：' + item.effectText + '</div></div><div style="display:flex;align-items:center;"><span class="shop-item-price">RMB ' + item.price + '</span><button ' + (canBuy ? '' : 'disabled') + ' onclick="buyItem(\'' + item.id + '\', this)">放入背包</button></div>';
    div.appendChild(row);
  });
}

function buyItem(id, button) {
  var item = shopItems.find(function(i) { return i.id === id; });
  if (!item || state.money < item.price) return;

  const prevState = JSON.parse(JSON.stringify(state));
  state.money -= item.price;
  addItem(id);

  log('【小卖部】购买并放入背包：' + item.name);
  updateStatus(prevState);
  renderBackpack();
  if (button) {
    button.textContent = '已放入背包';
    button.classList.add('is-added');
    button.disabled = true;
    setTimeout(renderShop, 280);
  } else {
    renderShop();
  }
}

function afterEventResolved() {
  if (state.round === 5) {
    fadeTransition(function() { openRound5Shop(); });
    return;
  }
  state.phase = 'action';
  state.actionsThisRound = 0;
  showActionPhase(true);
}

function showEvent(animate) {
  function render() {
    state.phase = 'event';
    grantParentMoneyIfNeeded();
    var ev = events[state.round - 1];
    document.getElementById('eventTitle').textContent = ev.title + ' · 第' + calendarDay() + '天';
    document.getElementById('eventText').textContent = ev.text;
    var choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    updateStatus();

    ev.options.forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt.text;
      if (opt.req && opt.req.money && state.money < opt.req.money) btn.disabled = true;
      btn.onclick = function() {
        const prevState = JSON.parse(JSON.stringify(state));
        saveSnapshot();
        applyEffects(opt.effects, opt.risk);
        logEventChoice(opt, opt.effects || {});
        dailyCost();
        updateStatus(prevState);
        if (tryEndOrContinue()) return;
        afterEventResolved();
      };
      choicesDiv.appendChild(btn);
    });
  }

  if (animate) {
    fadeTransition(render);
  } else {
    render();
  }
}

function showActionPhase(animate) {
  function render() {
    state.phase = 'action';
    var choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    var day = calendarDay();
    var slot = state.actionsThisRound === 0 ? '次日' : '第三天';
    document.getElementById('eventTitle').textContent = '第' + state.round + '回合 · 第' + day + '天（' + slot + '）';
    document.getElementById('eventText').textContent = '集合哨又响了。你可以决定今天怎么过。';
    updateStatus();

    var actions = [
      { text: '认真训练（教官A会看在眼里，但身心俱疲）', fn: function() { doTraining(); dailyCost(); } },
      { text: '摸鱼（轻松一些，教官B觉得你识趣）', fn: function() { doSlack(); dailyCost(); } },
      { text: '跟队长请假（恢复身心，但会影响评分）', fn: function() { doRest(); dailyCost(); } }
    ];

    actions.forEach(function(act) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = act.text;
      btn.onclick = function() {
        const prevState = JSON.parse(JSON.stringify(state));
        saveSnapshot();
        act.fn();
        updateStatus(prevState);
        if (tryEndOrContinue()) return;
        nextActionOrRound();
      };
      choicesDiv.appendChild(btn);
    });
  }

  if (animate) {
    fadeTransition(render);
  } else {
    render();
  }
}

function applyRound1Taunt() {
  if (state.round !== 1 || state.tauntApplied) return;
  state.health = 50;
  state.sanity = 50;
  state.tauntApplied = true;
  updateStatus();
}

function showRound1Story() {
  applyRound1Taunt();
  const overlay = document.getElementById('round1StoryOverlay');
  const button = document.getElementById('round1StoryBtn');
  if (!overlay || !button) {
    state.round++;
    state.actionsThisRound = 0;
    showEvent(true);
    return;
  }
  overlay.style.display = 'flex';
  button.onclick = function() {
    overlay.style.display = 'none';
    state.round++;
    state.actionsThisRound = 0;
    state.phase = 'event';
    showEvent(true);
  };
}

function showFinalJudgment(animate) {
  function render() {
    state.phase = 'judgment';
    updateStatus();
    var aWins = state.instructorA >= state.instructorB;
    document.getElementById('eventTitle').textContent = '第10回合 · 第30天 · 宣判';
    if (aWins) {
      document.getElementById('eventText').textContent = '会操结束。风把旗帜吹得猎猎响。教官A念到一个名字——是你的，哇台下观众欣喜若狂。阳光刺眼，领奖台就在三步之外。';
    } else {
      document.getElementById('eventText').textContent = '会操结束。你腿一软，演技恰到好处。教官B看穿了，却没有多说什么。你握紧了手里的伪造请假条。咽了一口口水，你知道自己成功了。';
    }
    var choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    var btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = aWins ? '走上领奖台' : '倒在队伍后面';
    btn.onclick = function() {
      if (aWins) {
        endGame('达成结局：军训标兵', '在最后的颁奖日那天，你神情紧张，期待教官念出自己的名字，教官们慢慢来到了操场中央，教官A念出了你的名字。你站在领奖台上，阳光刺眼。你赢得了最后的胜利，成为众多新生里那颗耀眼的新星，但你在领奖的时候不断思考一个问题——这一切努力真的值得吗？');
      } else {
        endGame('达成结局：装病逃离', '你捂着肚子倒在地上，演技精湛。教官B看穿了你，但什么也没说带你去了章丘医院。你手里拿着伪造的假病历瞒天过海，一个月的训练凭借它你可以吃喝玩乐。你成功逃离了军训训练，却逃不掉内心的空虚。');
      }
    };
    choicesDiv.appendChild(btn);
  }

  if (animate) fadeTransition(render);
  else render();
}

function nextActionOrRound() {
  state.actionsThisRound++;
  if (state.actionsThisRound < 2) {
    showActionPhase(true);
    return;
  }
  if (state.round === 1) {
    showRound1Story();
    return;
  }
  if (state.round === 10) {
    showFinalJudgment(true);
    return;
  }
  state.round++;
  state.actionsThisRound = 0;
  state.phase = 'event';
  showEvent(true);
}

function endGame(title, desc) {
  state.gameOver = true;
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('backpackCard').style.display = 'none';
  document.getElementById('endScreen').classList.remove('hidden');
  document.getElementById('endTitle').textContent = title;
  document.getElementById('endDesc').textContent = desc;
}