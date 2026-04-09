import { useState, useEffect, useCallback, useRef } from 'react';

// Tone.js is loaded via CDN script tag in play.astro
declare const Tone: any;

// ═══════════════════════════════════════════
// AUDIO ENGINE - Chiptune Pokémon Style
// ═══════════════════════════════════════════
let audioStarted = false;
let overworldLoop: any = null;
let battleLoop: any = null;
let journalLoop: any = null;

async function ensureAudio() {
  if (!audioStarted) {
    await Tone.start();
    Tone.getDestination().volume.value = -8;
    audioStarted = true;
  }
}

function createJournalMusic() {
  if (journalLoop) return journalLoop;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.3 },
    volume: -18
  }).toDestination();
  const melody = ["C4","E4","G4","C5","B4","G4","E4","F4","A4","C5","E5","D5","C5","A4","G4","E4"];
  let step = 0;
  const seq = new Tone.Loop((time: any) => {
    const i = step % melody.length;
    synth.triggerAttackRelease(melody[i], "4n", time);
    step++;
  }, "4n");
  journalLoop = { seq, synth, start: () => { step = 0; seq.start(0); Tone.getTransport().bpm.value = 80; Tone.getTransport().start(); }, stop: () => { seq.stop(); } };
  return journalLoop;
}

function createOverworldMusic() {
  if (overworldLoop) return overworldLoop;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 },
    volume: -14
  }).toDestination();
  const bass = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.1 },
    volume: -16
  }).toDestination();
  const melody = ["E4","G4","A4","B4","A4","G4","E4","D4","E4","G4","A4","E5","D5","B4","G4","A4"];
  const bassLine = ["C3","C3","F3","F3","G3","G3","C3","C3","A2","A2","F3","F3","G3","G3","C3","C3"];
  let step = 0;
  const seq = new Tone.Loop((time: any) => {
    const i = step % melody.length;
    synth.triggerAttackRelease(melody[i], "8n", time);
    if (i % 2 === 0) bass.triggerAttackRelease(bassLine[i], "4n", time);
    step++;
  }, "8n");
  overworldLoop = { seq, synth, bass, start: () => { step = 0; seq.start(0); Tone.getTransport().bpm.value = 120; Tone.getTransport().start(); }, stop: () => { seq.stop(); } };
  return overworldLoop;
}

function createBattleMusic() {
  if (battleLoop) return battleLoop;
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.2, release: 0.05 },
    volume: -12
  }).toDestination();
  const bass = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.1 },
    volume: -18
  }).toDestination();
  const melody = ["E4","E4","G4","E4","D4","E4","G4","A4","B4","A4","G4","E4","D4","C4","D4","E4"];
  const bassNotes = ["A2","A2","C3","C3","D3","D3","E3","E3","A2","A2","F2","F2","G2","G2","A2","A2"];
  let step = 0;
  const seq = new Tone.Loop((time: any) => {
    const i = step % melody.length;
    lead.triggerAttackRelease(melody[i], "16n", time);
    if (i % 2 === 0) bass.triggerAttackRelease(bassNotes[i], "8n", time);
    step++;
  }, "8n");
  battleLoop = { seq, lead, bass, start: () => { step = 0; seq.start(0); Tone.getTransport().bpm.value = 150; Tone.getTransport().start(); }, stop: () => { seq.stop(); } };
  return battleLoop;
}

function playSfx(type: string) {
  const synth = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 }, volume: -8 }).toDestination();
  const now = Tone.now();
  switch(type) {
    case "step": synth.volume.value = -22; synth.triggerAttackRelease("C5", "32n", now); break;
    case "encounter":
      synth.triggerAttackRelease("E5", 0.08, now);
      synth.triggerAttackRelease("G5", 0.08, now + 0.1);
      synth.triggerAttackRelease("B5", 0.08, now + 0.2);
      synth.triggerAttackRelease("E6", 0.15, now + 0.3);
      break;
    case "correct":
      synth.oscillator.type = "triangle";
      synth.triggerAttackRelease("C5", 0.08, now);
      synth.triggerAttackRelease("E5", 0.08, now + 0.1);
      synth.triggerAttackRelease("G5", 0.15, now + 0.2);
      break;
    case "wrong":
      synth.oscillator.type = "sawtooth"; synth.volume.value = -12;
      synth.triggerAttackRelease("E3", 0.15, now);
      synth.triggerAttackRelease("Eb3", 0.2, now + 0.15);
      break;
    case "capture":
      synth.oscillator.type = "triangle";
      synth.triggerAttackRelease("C5", 0.1, now);
      synth.triggerAttackRelease("E5", 0.1, now + 0.15);
      synth.triggerAttackRelease("G5", 0.1, now + 0.3);
      synth.triggerAttackRelease("C6", 0.3, now + 0.45);
      setTimeout(() => {
        const s2 = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }, volume: -10 }).toDestination();
        s2.triggerAttackRelease("E6", 0.1, Tone.now());
        s2.triggerAttackRelease("G6", 0.2, Tone.now() + 0.12);
      }, 600);
      break;
    case "escape":
      synth.oscillator.type = "sawtooth"; synth.volume.value = -10;
      synth.triggerAttackRelease("G4", 0.15, now);
      synth.triggerAttackRelease("E4", 0.15, now + 0.15);
      synth.triggerAttackRelease("C4", 0.15, now + 0.3);
      synth.triggerAttackRelease("A3", 0.3, now + 0.45);
      break;
    case "select": synth.volume.value = -14; synth.triggerAttackRelease("A5", "32n", now); break;
    case "page":
      synth.oscillator.type = "triangle"; synth.volume.value = -16;
      synth.triggerAttackRelease("E5", 0.06, now);
      synth.triggerAttackRelease("A5", 0.08, now + 0.08);
      break;
  }
  setTimeout(() => synth.dispose(), 2000);
}

// ═══════════════════════════════════════════
// STAN PIXEL ART SPRITES
// ═══════════════════════════════════════════
const PS = 10;
const STAN_SPRITES: Record<string, any> = {
  paper: {
    pal:{W:'#F0F0F0',B:'#111',G:'#888',L:'#CCC',D:'#444'},
    grid:[
      [0,0,0,0,'L','L','L',0,0,0,0,0],
      [0,0,0,'L','L','G','L','L',0,0,0,0],
      [0,0,0,'G','G','G','G','G',0,0,0,0],
      [0,'B','W','W','W','W','W','W','B',0,0,0],
      [0,'B','W','B','W','W','B','W','B',0,0,0],
      [0,'B','W','W','W','W','W','W','B',0,0,0],
      [0,'B','W','D','D','D','W','W','B',0,0,0],
      ['B','B','W','W','W','W','W','W','W','B','B',0],
      ['B',0,'W','W','W','W','W','W','W','W',0,'B'],
      [0,'G','W','W','G','W','G','W','W','G',0,0],
      [0,'G','W','W','W','W','W','W','W','G',0,0],
      ['D','D','W','W','W','W','W','W','D','D',0,0],
      ['D','D','W','W','W','W','W','W','D','D',0,0],
      [0,'B','B','B','B','B','B','B','B','B',0,0],
      [0,0,'W','W',0,0,'W','W',0,0,0,0],
      [0,0,'W','W',0,0,'W','W',0,0,0,0],
      [0,0,'G','G',0,0,'G','G',0,0,0,0],
      [0,'B','G','G',0,0,'G','G','B',0,0,0],
    ]
  },
  cg: {
    pal:{W:'#EFEFEF',B:'#111',R:'#E63946',T:'#1B9AAA',Y:'#F5C518',G:'#888',K:'#222'},
    grid:[
      [0,0,'K','T','T','Y','T','T','K',0,0,0],
      [0,'K','K','T','T','T','T','K','K',0,0,0],
      [0,'W','W','W','W','W','W','W','W',0,0,0],
      [0,'W','Y','W','W','W','W','Y','W',0,0,0],
      [0,'W','W','W','W','W','W','W','W',0,0,0],
      ['R','W','W','W','W','W','W','W','W','R',0,0],
      [0,'T','W','R','R','R','R','W','T',0,0,0],
      [0,'T','W','R','R','R','R','W','T',0,0,0],
      [0,'W','W','R','R','R','R','W','W',0,0,0],
      ['W','W','T','T','T','T','T','T','W','W',0,0],
      ['W',0,'W','W','W','W','W','W',0,'W',0,0],
      [0,0,'W','W','W','W','W','W',0,0,0,0],
      [0,0,'W','W',0,0,'W','W',0,0,0,0],
      [0,0,'W','W',0,0,'W','W',0,0,0,0],
      [0,0,'G','G',0,0,'G','G',0,0,0,0],
      [0,'G','G','G',0,0,'G','G','G',0,0,0],
      [0,'B','G','G',0,0,'G','G','B',0,0,0],
    ]
  },
  toy: {
    pal:{W:'#F0F0F0',B:'#111',R:'#E63946',T:'#1B9AAA',Y:'#F5C518'},
    grid:[
      [0,0,'W',0,0,0,0,0,'W',0,0,0],
      [0,0,'W','W',0,0,0,'W','W',0,0,0],
      [0,'W','W','W','W','W','W','W','W','W',0,0],
      [0,'B','B','Y','B','B','B','Y','B','B',0,0],
      [0,'W','W','R','W','W','W','R','W','W',0,0],
      ['W','W','W','W','W','W','W','W','W','W',0,0],
      [0,'W','W','R','R','R','R','W','W',0,0,0],
      [0,'W','W','R','W','W','R','W','W',0,0,0],
      [0,'W','W','W','W','W','W','W','W',0,0,0],
      [0,0,'B','B','B','B','B','B',0,0,0,0],
      [0,0,'T','T',0,0,'T','T',0,0,0,0],
      [0,0,'T','T',0,0,'T','T',0,0,0,0],
      [0,0,'R','R',0,0,'R','R',0,0,0,0],
      [0,'R','R','R',0,0,'R','R','R',0,0,0],
      [0,'B','R','R',0,0,'R','R','B',0,0,0],
    ]
  },
  sticky: {
    pal:{Y:'#F5C518',B:'#111',D:'#C9A000'},
    grid:[
      [0,0,0,0,0,0,0,0,0,0,'D',0],
      [0,'Y','Y','Y','Y','Y','Y','Y','Y','Y',0,0],
      [0,'Y','Y','Y','Y','Y','Y','Y','Y','Y',0,0],
      [0,'Y','Y','Y','Y','Y','Y','Y','Y','Y',0,0],
      [0,'Y','Y','B','Y','Y','Y','B','Y','Y',0,0],
      [0,'Y','Y','Y','B','Y','B','Y','Y','Y',0,0],
      [0,'Y','Y','Y','Y','Y','Y','Y','Y','Y',0,0],
      [0,'Y','Y','Y','Y','Y','Y','Y','Y','Y',0,0],
      [0,'Y','Y','B','Y','Y','Y','Y','B','Y',0,0],
      [0,'Y','Y','Y','B','B','B','B','Y','Y',0,0],
      [0,'Y','Y','Y','Y','Y','Y','Y','Y','Y',0,0],
      [0,0,0,'Y','Y',0,'Y','Y',0,0,0,0],
      [0,0,0,'Y','Y',0,'Y','Y',0,0,0,0],
      [0,0,0,'D','D',0,'D','D',0,0,0,0],
      [0,0,'D','D','D',0,'D','D','D',0,0,0],
      [0,0,'B','D','D',0,'D','D','B',0,0,0],
    ]
  },
  soft: {
    pal:{R:'#E63946',W:'#F5F0E0',B:'#111',T:'#1B9AAA',N:'#8B5E3C',D:'#C0392B'},
    grid:[
      [0,0,0,0,'D',0,0,'D',0,0,0,0],
      [0,0,'R','R','R','R','R','R','R',0,0,0],
      [0,'R','R','R','R','R','R','R','R','R',0,0],
      [0,'R','R','R','R','R','R','R','R','R',0,0],
      [0,0,'R','R','R','R','R','R','R',0,0,0],
      [0,0,'T','T','T','T','T','T','T',0,0,0],
      [0,0,'W','W','B','W','B','W','W',0,0,0],
      [0,0,'W','W','W','B','W','W','W',0,0,0],
      [0,'N','W','T','W','W','W','T','W','N',0,0],
      [0,'N','W','W','T','W','T','W','W','N',0,0],
      [0,0,'R','R','R','R','R','R','R',0,0,0],
      [0,0,0,'W','W',0,'W','W',0,0,0,0],
      [0,0,0,'W','W',0,'W','W',0,0,0,0],
      [0,0,0,'N','N',0,'N','N',0,0,0,0],
      [0,0,'N','N','N',0,'N','N','N',0,0,0],
      [0,0,'B','N','N',0,'N','N','B',0,0,0],
    ]
  }
};

function StanSprite({ stanId, scale = 1 }: { stanId: string; scale?: number }) {
  const s = STAN_SPRITES[stanId];
  if (!s) return null;
  const sz = PS * scale;
  const w = s.grid[0].length * sz;
  const h = s.grid.length * sz;
  return (
    <canvas ref={el => {
      if (!el) return;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      s.grid.forEach((row: any[], r: number) => row.forEach((k: any, c: number) => {
        if (k && s.pal[k]) {
          ctx.fillStyle = s.pal[k];
          ctx.fillRect(c * sz, r * sz, sz, sz);
        }
      }));
    }} width={w} height={h}
    style={{imageRendering:'pixelated', display:'block'}} />
  );
}

const STANS: Record<string, any> = {
  paper: { id:"paper", name:"Paper Stan", emotion:"Explosive Rage", color:"#E74C3C", bgColor:"#FDEDEC", skill:"PAUSE", skillDesc:"Step back before you swing. The pause is the power.", voice:"Aggressive, blunt, short bursts. Protective. Sounds like he'd fight for you the second after he's done fighting you.", intro:"You again? I don't know if I'm in the mood for a brain battle. Maybe you should just BACK OFF.", defeat:"...fine. You get it. You know I'm a storm about to break. And I know that Rage can be over the top sometimes. But I was born out of an anger that happens when you feel like nobody else is gonna protect us. We better find some allies. Get back out there.", escape:"You're not ready. Come back when you've got guts." },
  toy: { id:"toy", name:"Toy Stan", emotion:"Frustration & Shame", color:"#E67E22", bgColor:"#FEF5E7", skill:"COOL DOWN", skillDesc:"Lower the temperature before you make your move.", voice:"Sarcastic, perfectionist, self-deprecating. Has standards. Disappointed by everything, including himself.", intro:"Oh great. Another visitor who thinks they understand craft. Let me guess — you think everything Aaron makes is 'good enough'?", defeat:"Whoa. You actually... see the details. Most people just see the surface. The truth is, I'm not mad at the work. I'm just scared that if it's not perfect, no one will think Aaron matters. Maybe that's not the worst thing to admit.", escape:"Typical. Surface-level understanding. Come back when you can see what's actually wrong." },
  cg: { id:"cg", name:"CG Stan", emotion:"Overwhelm & Pressure", color:"#8E44AD", bgColor:"#F5EEF8", skill:"BREATHE", skillDesc:"Slow it down. One breath changes everything.", voice:"Fast-talking, anxious, manic then shutdown. Seventeen thoughts at once. Goes quiet when overloaded.", intro:"Hey. You're here. Perfect. Now before somebody tries to interrupt — I've got seventeen strategies to review. Oh wait. We're sparring RIGHT? Let's go!", defeat:"Yes! You did it. Not everybody hangs around when I start spinning. The thing is... I gotta cover everything because if Aaron drops even ONE ball, they all come crashing down. But — BREATHE — maybe I don't have to handle everything all at once.", escape:"Too much! This is too much! I gotta go — sorry — bye —" },
  sticky: { id:"sticky", name:"Sticky Stan", emotion:"Envy & Comparison", color:"#27AE60", bgColor:"#EAFAF1", skill:"RELEASE", skillDesc:"Let the score go. That's where the energy comes from.", voice:"Quiet, bitter, speaks in comparisons. Keeps score. Assumes you forgot about him.", intro:"Oh look. You found me. Bet you found everyone else first though, right? That tracks.", defeat:"You're the first person who asked me anything. Was that because I let you? Usually I have to have the snappy comeback — I spend all my time making sure Aaron measures up to everybody else. I forgot to ask what Aaron actually cares about.", escape:"Whatever. Go hang out with the cooler Stans. I'll be here." },
  soft: { id:"soft", name:"Soft Stan", emotion:"Self-Regard & Resilience", color:"#2980B9", bgColor:"#EBF5FB", skill:"CONNECT", skillDesc:"You can keep going. Reach out — that's the hardest and most powerful move.", voice:"Quiet but not weak. Speaks in short certain sentences. The one who stayed when everyone else left.", intro:"You made it this far. Most people don't. I've been waiting.", defeat:"You stayed. You kept going even when it got hard. That's what I carry — the part of Aaron that knows he can survive it. Not because it stops hurting. Because he's still here. And that's enough to finish the fight.", escape:"Not yet. You'll need to know this before the end. Come back." }
};

// ═══════════════════════════════════════════
// STAN ARC QUESTIONS — locked to Stan tile encounters only
// Q1=film, Q2=game, Q3=bridge, Q4/Q5=deeper
// ═══════════════════════════════════════════
const FILM_URL = "https://www.youtube.com/watch?v=fGHBh76NHuI";
const STAN_ARC: Record<string, any> = {
  cg: {
    redirect: { text:"You missed it. Go back to when Aaron's mom offered to make that call. Watch his face. That's the moment I showed up. Come back when you've seen it.", url: FILM_URL + "&t=92" },
    questions: [
      { q:"In the film, when Aaron's mom wants to call Fireboy's mom, I say \"Do NOT get her involved!\" Which feelings is Aaron having that I'm trying to help with?", o:["Aaron feeling shame about his mom having to step in","Aaron worrying this will make the problem bigger","Aaron stressed about what his mom will say","All of the above"], c:3 },
      { q:"Okay. I'm good. In MY zone — the EmoDojo — Mind Ninjas multiply faster than you can fight them. What's the only move?", o:["Fight one at a time","Use BREATHE to get through","Wait for a pile-on and whirl around madly","Ignore them"], c:1 },
      { q:"Aaron felt shame, worry, and stress all at once in that moment. When YOU feel everything hitting at once, what's the most important move?", o:["Handle each problem one at a time","Stop and breathe BEFORE you react or decide anything","Ask someone for help immediately","Push through until it's over"], c:1 },
    ]
  },
  paper: {
    redirect: { text:"You don't get where I come from yet. Go back to when those messages hit Aaron at his desk. Watch what happens to him. That's me. That's where I was born.", url: FILM_URL + "&t=165" },
    questions: [
      { q:"In the film, I, Paper Stan, the RAGEFUL show up after Aaron gets to his room and is immediately hit with mean messages from Fireboy. What triggers his rage?", o:["Aaron losing at the game","Aaron being called out when he's home and ready to start working","Aaron's mom getting involved","Aaron's phone dying"], c:1 },
      { q:"Mind Ninjas are swarming thoughts you can't stop. But I live in the Rage Storm, where Triggers are different. A trigger is when something OUTSIDE you — a sound, a message, a look — suddenly resurfaces a painful feeling. What hits Aaron like a trigger in that moment?", o:["Losing at his game","Getting Fireboy's messages when he's already hurt from earlier","Hearing his mom's voice","Seeing his own reflection"], c:1 },
      { q:"The skill I needed most — and had to work hardest to learn — is PAUSE: get out before you blow up. When is PAUSE most powerful?", o:["After you've already said something you regret","Right when you feel the rage starting — before it takes over","When everything has calmed down","When someone tells you to calm down"], c:1 },
    ]
  },
  toy: {
    redirect: { text:"You don't know why I jumped off that shelf yet. Go watch that moment. You'll see exactly what shame and rage look like when they hit at the same time. Then come back.", url: FILM_URL + "&t=230" },
    questions: [
      { q:"Remember when I jumped off the shelf after realizing we got called an NPC again? What do you think I'm really feeling at that moment?", o:["Pure Rage at that Stinkbrain Fireboy","Shame. Because he keeps calling us that. And we're trying so hard to be something else.","Frustration that we can't fight back","Happy because now we can just stop"], c:1 },
      { q:"Okay. I'm good. In MY zone — the Toxic Zone — the Critics have thumbs-down on their chests and they never stop. What are they in real life?", o:["Teachers who give bad grades","Everyone's opinions","People who used to be your friends","Randos in a comment section"], c:1 },
      { q:"My biggest skill is COOL DOWN — and I mean that literally. When shame and rage hit at the same time, MY brain goes HOT. What actually works?", o:["Thinking about something happy","Get Cold. Splash cold water on your face, ice, anything physical — it snaps your brain back","Yelling until you feel better","Waiting it out alone"], c:1 },
      { q:"And here's what I had to learn the hard way — the best Cool Down move isn't during the blowup. It's not after either. When do YOU use it?", o:["When someone tells you to calm down","Before you lose it — the second you feel it building","After you've said what you needed to say","When you're already on the floor"], c:1 },
    ]
  },
  sticky: {
    redirect: { text:"You don't know where I come from yet. Go find the part where Aaron sees Fireboy's post. That's the exact second I showed up. Keeping score. Like I always do.", url: FILM_URL + "&t=177" },
    questions: [
      { q:"I showed up when Aaron saw Fireboy's IG post. \"Everything's easy for him.\" What's really happening in that moment?", o:["Aaron is jealous of Fireboy's design skills","Aaron is measuring himself against someone else and coming up short","Aaron is angry his phone is blowing up","Aaron wishes he had more followers"], c:1 },
      { q:"I live in the Toxic Zone too. The Exposure Beams don't attack you. They just... watch. What do they represent?", o:["Security cameras","The feeling that everyone's excited to see you fail","Fans following your work","Spotlight on a stage"], c:1 },
      { q:"My skill is RELEASE. I keep score constantly — who has more, who got further, who won. What does keeping that score actually cost you?", o:["Your reputation","Your focus on what YOU actually want","Your friendships","Your time"], c:1 },
      { q:"The counter-move to Exposure Beams is choosing to be seen by someone safe. What's the difference between that and just being watched?", o:["There isn't one","You're in control of who sees you — and they're on your side","Safe people don't judge","It's quieter"], c:1 },
    ]
  },
  soft: {
    redirect: { text:"You haven't found me yet. Go watch what happens right before Aaron turns it around. That moment — that's where I live. Come back when you've seen it.", url: FILM_URL + "&t=412" },
    questions: [
      { q:"I'm a little different from everybody else. I was made by someone who always sees the best in Aaron. So when Aaron gives up, I know he needs something different. What do I say that helps?", o:["\"You should apologize to Fireboy\"","\"Don't let this stop you\"","\"Your mom is coming\"","\"You can get revenge later\""], c:1 },
      { q:"In the Toxic Zone, Inner Turmoil is the final boss. He's built from every harsh thing Aaron has ever been told about himself. What makes him different from every other enemy?", o:["He has the most HP","He sounds exactly like Aaron's own voice","He can't be defeated alone","He lives in the Toxic Zone"], c:1 },
      { q:"My skill is CONNECT. Aaron's mom is there for him — but he has to let her in. What could Aaron actually do to use his CONNECT skill in that moment?", o:["Post about it online","Go to his mom and tell her what actually happened","Text Fireboy back","Wait until he feels better on his own"], c:1 },
      { q:"CONNECT isn't just about asking for help. It's about letting someone see the real thing. What's the hardest part of that?", o:["Finding the right words","Believing someone will actually show up for you when you're at your worst","Knowing who to call","Picking the right time"], c:1 },
      { q:"I represent all the good voices — the people who believe in you even when you don't. What's the most powerful thing CONNECT does?", o:["It solves the problem faster","It makes you look stronger","It reminds you that you don't have to survive the hard stuff alone","It gets you more followers"], c:2 },
    ]
  },
};

// ═══════════════════════════════════════════
// SURVEY QUESTIONS (RTB Questionnaire)
// ═══════════════════════════════════════════
const SURVEY_QUESTIONS: any[] = [
  { id:"age", q:"How old are you?", type:"text", required:true, placeholder:"Type your age", inputType:"number" },
  { id:"describe", q:"Which one fits you best?", type:"dropdown", required:true, options:["Boy","Girl","Non-binary","Prefer not to say"] },
  { id:"roblox_freq", q:"How much do you play Roblox?", type:"dropdown", required:false, options:["Never","Sometimes","Most weeks","Every day"] },
  { id:"watched_film", q:"Did you watch Release the Beast?", type:"dropdown", required:true, options:["Yes","No"] },
  { id:"played_game", q:"Have you played Rage Fighters on Roblox?", type:"dropdown", required:true, options:["Yes","No"] },
  { id:"familiar_film", q:"Was there a moment in Release the Beast where you thought — wait, that's kind of like me?", type:"scale", required:false, condition: (a: any) => a.watched_film === "Yes", labels:["😶 No, not really","🤏 A little bit","🤔 Kind of","👍 Yeah, I think so","💯 Yeah, definitely"] },
  { id:"familiar_film_desc", q:"What was the moment? (You can start with \"It was when...\")", type:"text", required:false, condition: (a: any) => a.watched_film === "Yes", placeholder:"It was when..." },
  { id:"familiar_game", q:"Was there anything in Rage Fighters that felt like stuff you actually go through?", type:"scale", required:false, condition: (a: any) => a.played_game === "Yes", labels:["😶 No, not really","🤏 A little bit","🤔 Kind of","👍 Yeah, I think so","💯 Yeah, definitely"] },
  { id:"familiar_game_desc", q:"What was it? Was it an enemy, skill, the rage meter, or something else?", type:"text", required:false, condition: (a: any) => a.played_game === "Yes", placeholder:"It was..." },
  { id:"recognize_stressors", q:"Has anything like what happened to Aaron ever happened to you? For example, the pile-on, the losing it, the feeling like you can't talk to anyone about it?", type:"scale", required:false, condition: (a: any) => a.watched_film === "Yes", labels:["😶 Nope","🤏 Maybe a little","🤔 Some of it","👍 A lot of it","💯 Pretty much all of it"] },
  { id:"what_connected", q:"Which part did you relate to most? (You can start with \"It was when...\" or \"I felt...\")", type:"text", required:false, placeholder:"I felt..." },
  { id:"learn_skills", q:"Did the film or game give you anything you could actually use — like something helpful you can do when things get bad?", type:"scale", required:false, labels:["😶 Not really","🤏 Maybe one thing","🤔 A couple things","👍 Yeah, a few","💯 Yeah, definitely"] },
  { id:"what_learned", q:"What was it?", type:"text", required:false, placeholder:"It was..." },
  { id:"use_skills", q:"When things actually get bad — do you think you'd remember to use it?", type:"scale", required:false, labels:["😶 Probably not","🤔 Maybe","🤏 I'd try","👍 Most likely","💯 Yeah, I think so"] },
  { id:"situations", q:"What's a specific situation where you'd try it?", type:"text", required:false, placeholder:"Like when..." },
  { id:"recommend_film", q:"Would you tell a friend to watch Release the Beast?", type:"dropdown", required:false, condition: (a: any) => a.watched_film === "Yes", options:["Definitely not","Probably not","Maybe / It depends","Probably would","Definitely would"] },
  { id:"recommend_film_why", q:"Why? (Be honest — no wrong answer)", type:"text", required:false, condition: (a: any) => a.watched_film === "Yes", placeholder:"Because..." },
  { id:"recommend_game", q:"Would you tell a friend to play Rage Fighters?", type:"dropdown", required:false, condition: (a: any) => a.played_game === "Yes", options:["Definitely not","Probably not","Maybe / It depends","Probably would","Definitely would"] },
  { id:"recommend_game_why", q:"Why? (Be honest — no wrong answer)", type:"text", required:false, condition: (a: any) => a.played_game === "Yes", placeholder:"Because..." },
  { id:"anything_else", q:"Last one. What stuck with you — from the film, the game, or even just right now?", type:"text", required:false, placeholder:"Honestly..." },
];

// ═══════════════════════════════════════════
// LORE BATTLE QUESTIONS
// ═══════════════════════════════════════════
const LORE_QUESTIONS: any[] = [
  {q:"I made Mind Ninjas because of the stuff that pops into your head uninvited. What ARE they?",o:["Bad dreams","Intrusive thoughts","Homework stress","Loud noises"],c:1,d:"Easy",s:["cg","any"]},
  {q:"Mind Ninjas multiply faster than you can swing. What's the ONLY move?",o:["Fight them one at a time","Use BREATHE to slow down","Use PAUSE to get distance","Ignore them completely"],c:1,d:"Easy",s:["cg"]},
  {q:"Mind Ninjas are loudest when you're...",o:["Tired, alone, or already stressed","Having a great day","Eating lunch","Playing with friends"],c:0,d:"Medium",s:["cg"]},
  {q:"The Shadow Samurai looks familiar because he IS you. What does he represent?",o:["A rival player","Your shadow side — dark emotions you're not proud of","Your best friend","A game glitch"],c:1,d:"Easy",s:["cg","any"]},
  {q:"Shadow Samurai drains your energy slowly if you ignore him. What skill cracks his armor?",o:["PAUSE","BREATHE","COOL DOWN","RELEASE"],c:1,d:"Easy",s:["cg"]},
  {q:"I learned you can't beat your shadow side by pretending it doesn't exist. What happens if you try?",o:["It disappears","It gets STRONGER","It becomes your friend","Nothing"],c:1,d:"Medium",s:["cg"]},
  {q:"The Tilt Shogun carries heads on his arm — trophies from everyone who lost control. What does he feed on?",o:["Health potions","Your anger and tilt","Your teammates","Coins"],c:1,d:"Easy",s:["cg","any"]},
  {q:"You CANNOT button-mash the Tilt Shogun. What combo do you need?",o:["BREATHE + RELEASE","PAUSE + COOL DOWN + CONNECT","Just PAUSE","Attack harder"],c:1,d:"Medium",s:["cg"]},
  {q:"The Tilt Shogun teaches the hardest lesson. What is it?",o:["Fight harder to win","Sometimes the bravest move is to stop fighting","Never ask for help","Anger makes you stronger"],c:1,d:"Medium",s:["cg"]},
  {q:"Triggers aren't just thoughts — they're tied to REAL events. What makes them hit harder than Mind Ninjas?",o:["They're bigger","They're connected to real stuff happening TO you","They have more HP","They fly"],c:1,d:"Medium",s:["paper"]},
  {q:"I designed Trigger Swarm to stack. When should you PAUSE?",o:["After the first hit","After hit 3 or 4 — before the snowball builds","Only at the end","Never, just fight through"],c:1,d:"Easy",s:["paper"]},
  {q:"When you blow up over something small, what's really happening?",o:["You're being dramatic","The thing that set you off is the LAST thing, not THE thing","You need sleep","You lost the game"],c:1,d:"Medium",s:["paper"]},
  {q:"Flashpoints telegraph their attacks — you can SEE them coming. How long before detonation?",o:["10 seconds","5 seconds","2 seconds","30 seconds"],c:2,d:"Easy",s:["paper","any"]},
  {q:"A Flashpoint hits different because of YOUR history. What's the real question to ask?",o:["Why am I so upset?","What does this REMIND me of?","Who did this to me?","How do I win?"],c:1,d:"Medium",s:["paper"]},
  {q:"What skill do you use when you see a Flashpoint charging?",o:["COOL DOWN","CONNECT","BREATHE","PAUSE"],c:3,d:"Easy",s:["paper"]},
  {q:"The Meltdown Boss has three phases. In which phase is your ONLY real window to win?",o:["Phase 2 — Inferno","Phase 3 — Burnout","Phase 1 — Ignition","All phases equally"],c:2,d:"Easy",s:["paper","any"]},
  {q:"Phase 2 of the Meltdown: your skills are LOCKED. What's the only move?",o:["Attack harder","Just survive — don't make it worse","Use all skills at once","Quit the fight"],c:1,d:"Medium",s:["paper"]},
  {q:"Phase 3 Burnout: the rage crashes and shame shows up. What skill finishes the fight?",o:["PAUSE","BREATHE","COOL DOWN","CONNECT — you can't finish solo"],c:3,d:"Medium",s:["paper","soft"]},
  {q:"The Critics have thumbs-down on their chests and never stop. What are they IRL?",o:["Teachers","Everyone's opinions and social media voices","Your parents","Game moderators"],c:1,d:"Easy",s:["toy","sticky","any"]},
  {q:"Your brain treats social rejection like actual survival-level danger. What's the forcefield?",o:["Fighting back online","Turning off the phone","Posting more","Getting more followers"],c:1,d:"Medium",s:["toy","sticky"]},
  {q:"One genuine person saying 'you're good' is worth more than...",o:["One hundred likes","A thousand online opinions","A viral post","All of the above"],c:1,d:"Easy",s:["toy","sticky"]},
  {q:"Exposure Beams don't attack directly. They just WATCH. What do they represent?",o:["Security cameras","The feeling that everyone's watching you fail","Flashlights","Laser weapons"],c:1,d:"Easy",s:["toy","sticky","any"]},
  {q:"Exposure Beams can't lock onto you when you're...",o:["Running fast","Invisible","In a group — they scatter in formation","Standing still"],c:2,d:"Medium",s:["toy","sticky"]},
  {q:"The counter-move to Exposure Beams is choosing to be seen by someone safe. That's the difference between...",o:["A spotlight and a stage light","A flashlight and a torch","Day and night","Winning and losing"],c:0,d:"Hard",s:["toy","sticky"]},
  {q:"Inner Turmoil is the final boss. He's built from everything harsh you've ever been told. What is he?",o:["An external enemy","Your inner critic — toxic shame","A computer virus","Another player"],c:1,d:"Easy",s:["soft","toy","any"]},
  {q:"You can turn off your phone to escape The Critics. But Inner Turmoil?",o:["Also turns off","He IS your voice — you can't outrun yourself","Goes away with sleep","Only appears online"],c:1,d:"Medium",s:["soft","toy"]},
  {q:"Phase 2 of Inner Turmoil locks you down. What breaks you free?",o:["PAUSE only","COOL DOWN for physical reset + CONNECT — call your team","Just wait it out","Attack harder"],c:1,d:"Hard",s:["soft"]},
  {q:"The ONLY way to beat Inner Turmoil's voice is...",o:["Being tougher","Self-compassion — you can't out-criticize the critic","Ignoring it","Fighting alone"],c:1,d:"Hard",s:["soft"]},
  {q:"Where should you breathe for it to actually work — your chest or your stomach?",o:["Chest","Stomach — it resets your body's panic response","Doesn't matter","Through your mouth only"],c:1,d:"Easy",s:["cg","any"]},
  {q:"Advanced breathing isn't 'breathe when upset.' It's breathe BEFORE you lose it. When?",o:["Only during fights","Morning, after school, before hard conversations","Only at night","Only when someone tells you to"],c:1,d:"Medium",s:["cg"]},
  {q:"At Air Lord level, BREATHE can take you from 40% health to what?",o:["50%","60%","80%","100%"],c:2,d:"Medium",s:["cg"]},
  {q:"PAUSE gives you a teleport + forcefield. IRL, that's...",o:["Running away forever","Leaving the room before you say something you can't take back","Hiding from everyone","Giving up"],c:1,d:"Easy",s:["paper","any"]},
  {q:"Pause ISN'T avoidance. It's...",o:["Ignoring the problem","Choosing your moment instead of just reacting","Pretending nothing happened","Being scared"],c:1,d:"Medium",s:["paper"]},
  {q:"At Time Fighter level, what's the key to using Pause?",o:["Use it after you're buried","Use it early — before you need to","Only in boss fights","Save it for later"],c:1,d:"Medium",s:["paper"]},
  {q:"When you're angry, your brain is literally...",o:["Cold","Sleeping","HOT — too activated to make good decisions","Empty"],c:2,d:"Easy",s:["toy","any"]},
  {q:"Cool Down is LITERAL. What works?",o:["Thinking happy thoughts","Cold water on your face, ice cube, something cold","Yelling louder","Punching a pillow"],c:1,d:"Easy",s:["toy"]},
  {q:"The best Cool Down players know: leave BEFORE you blow up, not...",o:["During","After","Never","While eating"],c:1,d:"Medium",s:["toy"]},
  {q:"Some things you're holding onto are weighing you down. RELEASE means...",o:["Forgetting everything","Finding a safe way to let the pressure out","Giving up","Running away"],c:1,d:"Easy",s:["sticky","any"]},
  {q:"The scorecard in your head — tracking everything Fireboy has that Aaron doesn't — what does keeping it cost you?",o:["Nothing","Your focus on what YOU actually want","Your reputation","Your friendships"],c:1,d:"Medium",s:["sticky"]},
  {q:"Some bosses can't be beaten in one session. ENDURE means...",o:["Giving up and trying later","Staying in it even when it costs you — because you're still here","Waiting for someone to save you","Pretending you're okay"],c:1,d:"Easy",s:["soft","any"]},
  {q:"What makes Soft Stan the most powerful Stan of all?",o:["He's the biggest","He knows every skill","He carries the belief that Aaron can survive anything — and keep going","He never loses"],c:2,d:"Hard",s:["soft"]},
  {q:"Paper Stan's voice in the Rage Storm is described as...",o:["Quiet and gentle","Deep, intense, drill-sergeant","Formal and measured","Fast and anxious"],c:1,d:"Medium",s:["paper"]},
  {q:"Toy Stan's voice in the Toxic Zone is described as...",o:["Aggressive and blunt","Whisper-quiet","Formal, measured, stoic — like a samurai general","Sarcastic and funny"],c:2,d:"Medium",s:["toy","sticky"]},
  {q:"Which zone does Paper Stan mentor?",o:["Emo Dojo","Toxic Zone","Rage Storm","Fractured Network"],c:2,d:"Easy",s:["paper"]},
  {q:"Which zone does Toy Stan mentor?",o:["Rage Storm","Emo Dojo","Toxic Zone","Fractured Network"],c:2,d:"Easy",s:["toy","sticky"]},
  {q:"Aaron built this game as a way to deal with...",o:["Boredom","The stuff that happens in his head","His homework","His friends"],c:1,d:"Easy",s:["any"]},
  {q:"The notebook pages in the game serve three purposes: lore, gameplay insight, and...",o:["Advertising","Education about real-life skills","Decoration","Collecting points"],c:1,d:"Medium",s:["any"]},
];

// ═══════════════════════════════════════════
// ANSWER BANKING (localStorage + in-memory fallback + collect API)
// ═══════════════════════════════════════════
const _memoryStore: { sessions: any[] } = { sessions: [] };

function loadSessions(): any[] {
  try {
    const raw = localStorage.getItem("rf_sketchbook_sessions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        _memoryStore.sessions = parsed;
        return parsed;
      }
    }
  } catch(e) { /* localStorage unavailable or corrupt */ }
  return _memoryStore.sessions;
}

function saveSessions(sessions: any[]) {
  _memoryStore.sessions = sessions;
  try {
    localStorage.setItem("rf_sketchbook_sessions", JSON.stringify(sessions));
  } catch(e) { /* localStorage unavailable, in-memory only */ }
}

function flattenSession(sessionData: any) {
  const flat: Record<string, any> = { timestamp: sessionData.timestamp || "" };
  if (sessionData.survey) {
    SURVEY_QUESTIONS.forEach(q => {
      flat[q.id] = sessionData.survey[q.id] !== undefined ? sessionData.survey[q.id] : "";
    });
  }
  if (sessionData.battle) {
    flat.battle_score   = sessionData.battle.battle_score   ?? "";
    flat.stans_captured = sessionData.battle.stans_captured ?? "";
    flat.lore_correct   = sessionData.battle.lore_correct   ?? "";
    flat.lore_total     = sessionData.battle.lore_total     ?? "";
  }
  return flat;
}

async function sendToCollect(sessionData: any, collectSecret: string) {
  if (!collectSecret) return;
  try {
    await fetch('/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectSecret}`,
      },
      body: JSON.stringify(flattenSession(sessionData)),
    });
  } catch(e) { /* silently fail — local save still works */ }
}

// ═══════════════════════════════════════════
// AARON'S BEDROOM MAP (30 wide x 22 tall)
// ═══════════════════════════════════════════
const MAP_STR = [
  "####################",
  "#5-....#ttYsstt....#",
  "#.-.###ttstttYsss..#",
  "#.-#tttststtss.s...#",
  "#.--Ytstttts--...4.#",
  "##sstttYtstss-RR####",
  "####tttttttss-RR####",
  "#..#tss3#tt.#p##pp##",
  "#.#sstss#####LTTLp##",
  "#.ssYtY###ppppLppp##",
  "#.sssts##LLppppppL##",
  "#.##tYY###ppLLppppp#",
  "#...#tt..#L.L2ppppp#",
  "#....##.#ppppppppL.#",
  "#........#L-pppLp###",
  "###....###p-#ppL####",
  "#...---#######p#####",
  "#RRR-RRRRR...###...#",
  "#RccccccRRRTRTRTR..#",
  "#RcKccccccccccccR..#",
  "#RcccccKRRKKKKKKR..#",
  "#RccccccRRKKKKKKR..#",
  "#RcKccKcRR-----KR..#",
  "#R..1...---...-KR..#",
  "#RccccccRRKKKKKKR..#",
  "#RccKccKRRKKKKKKR..#",
  "#RRRRRRRRRccccccR..#",
  "#TTTT.TTTRRRRRRRRT.#",
  "#........TTTTT-TTT.#",
  "##T#T#T#T#.T#T-#T#T#",
  "#T#T#T#T#T.#T#-T#T##",
  "#.........-----...##",
  "#.........-.......##",
  "#.........B.......##",
  "###################",
  "####################",
];
const MAP = MAP_STR.map(row => row.split(""));
const MAP_H = MAP.length;
const MAP_W = MAP[0].length;

const OBJECT_STANS: Record<string, string> = { N:"soft", "1":"cg", "2":"paper", "3":"toy", "4":"sticky", "5":"soft" };

const OBJECT_LABELS: Record<string, { icon: string; name: string; hint: string }> = {
  L: { icon:"💻", name:"Aaron's Laptop", hint:"The contest. CG Stan lives here." },
  K: { icon:"📓", name:"The Sketchbook", hint:"Paper Stan burst out of this." },
  T: { icon:"🗿", name:"The Original Toy", hint:"The design that started everything." },
  F: { icon:"📱", name:"The Phone", hint:"Fireboy's IG. Still lit up." },
  N: { icon:"🧸", name:"The Knit Doll", hint:"Mom made this. Buried in the corner." },
};

const TILE_SIZE = 28;
const VIEW_W = 15;
const VIEW_H = 13;
const TILE_COLORS: Record<string, { bg: string; border: string }> = {
  "#": {bg:"#1a1a2e", border:"#2a2a4e"},
  ".": {bg:"#4a8a28", border:"#3a7a18"},
  "-": {bg:"#D4B896", border:"#c4a878"},
  "R": {bg:"#7A1010", border:"#E63946"},
  "B": {bg:"#8B6F47", border:"#FFD700"},
  "c": {bg:"#C49020", border:"#8B6914"},
  "p": {bg:"#E8E8E8", border:"#E63946"},
  "t": {bg:"#3D1080", border:"#F5C518"},
  "s": {bg:"#1E0A50", border:"#FBBF24"},
  "N": {bg:"#060620", border:"#1B4F72"},
  "T": {bg:"#1B4E20", border:"#0d3010"},
  "K": {bg:"#6D1B3C", border:"#F48FB1"},
  "L": {bg:"#E8E8E8", border:"#E63946"},
  "Y": {bg:"#2a1500", border:"#F5C518"},
  "1": {bg:"#0d7a88", border:"#fff"},
  "2": {bg:"#C0202C", border:"#fff"},
  "3": {bg:"#C05A10", border:"#fff"},
  "4": {bg:"#1A8040", border:"#fff"},
  "5": {bg:"#1A5A90", border:"#FFD700"},
  "d": {bg:"#8B6F47", border:"#6d5635"},
};
const WALKABLE = new Set([".", "-", "c", "p", "t", "s", "N", "d", "B", "L", "1", "2", "3", "4", "5"]);

const DECORATIONS: Record<string, any> = {
  "5,10":  { type:"text", content:"MIND NINJA", color:"#E63946", rotation:-8,  opacity:0.22, size:7, bold:true },
  "8,11":  { type:"svg",  shape:"zigzag",       color:"#E63946", rotation:0,   opacity:0.2 },
  "10,12": { type:"text", content:"TOO MANY", color:"#E63946",   rotation:5,   opacity:0.2, size:7, bold:true },
  "6,13":  { type:"svg",  shape:"scribble",     color:"#C0392B", rotation:-10, opacity:0.25 },
  "12,14": { type:"text", content:"!!!",        color:"#E63946", rotation:15,  opacity:0.3, size:12, bold:true },
  "9,15":  { type:"svg",  shape:"spiral",       color:"#8E44AD", rotation:0,   opacity:0.2 },
  "7,12":  { type:"text", content:"intrusive",  color:"#E63946", rotation:-4,  opacity:0.15, size:7, cursive:true },
  "11,11": { type:"svg",  shape:"arrow",        color:"#E63946", rotation:45,  opacity:0.2 },
  "14,13": { type:"text", content:"SWARM",      color:"#C0392B", rotation:8,   opacity:0.2, size:7, bold:true },
  "2,3":   { type:"text", content:"deadline",   color:"#1B9AAA", rotation:-5,  opacity:0.2, size:7, cursive:true },
  "5,3":   { type:"svg",  shape:"controller",   color:"#1B9AAA", rotation:8,   opacity:0.25 },
  "4,6":   { type:"text", content:"17 THINGS",  color:"#8E44AD", rotation:-10, opacity:0.2, size:6, bold:true },
  "12,3":  { type:"text", content:"RAGE",       color:"#E63946", rotation:-12, opacity:0.3, size:9, bold:true },
  "14,5":  { type:"svg",  shape:"sword",        color:"#C0392B", rotation:30,  opacity:0.3 },
  "16,4":  { type:"text", content:"PROTECT",    color:"#E74C3C", rotation:5,   opacity:0.2, size:7, bold:true },
  "24,6":  { type:"text", content:"FIX IT",     color:"#E67E22", rotation:8,   opacity:0.2, size:7, bold:true },
  "26,7":  { type:"svg",  shape:"star",         color:"#F39C12", rotation:15,  opacity:0.25 },
  "22,5":  { type:"text", content:"✗",          color:"#E67E22", rotation:-20, opacity:0.35, size:16 },
  "22,11": { type:"text", content:"WHY HIM",    color:"#27AE60", rotation:5,   opacity:0.2, size:7, bold:true },
  "25,12": { type:"svg",  shape:"eyes",         color:"#27AE60", rotation:0,   opacity:0.2 },
  "23,14": { type:"text", content:"...",        color:"#27AE60", rotation:0,   opacity:0.3, size:12 },
  "2,1":   { type:"text", content:"mom",        color:"#2980B9", rotation:-3,  opacity:0.2, size:8, cursive:true },
  "3,2":   { type:"svg",  shape:"heart",        color:"#2980B9", rotation:10,  opacity:0.2 },
  "1,3":   { type:"text", content:"still here", color:"#2980B9", rotation:-5,  opacity:0.18, size:6, cursive:true },
  "14,18": { type:"text", content:"Aaron",      color:"#555",    rotation:-3,  opacity:0.15, size:8, cursive:true },
  "14,19": { type:"svg",  shape:"arrow",        color:"#888",    rotation:-90, opacity:0.2 },
  "10,17": { type:"text", content:"START HERE", color:"#888",    rotation:0,   opacity:0.15, size:6 },
};

function SketchSVG({ shape, color, size = 20 }: { shape: string; color: string; size?: number }) {
  const s = size;
  switch(shape) {
    case "sword": return (<svg width={s} height={s} viewBox="0 0 20 20"><line x1="10" y1="2" x2="10" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="12" x2="14" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="15" x2="11" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>);
    case "heart": return (<svg width={s} height={s} viewBox="0 0 20 20"><path d="M10 16 C4 10, 2 6, 6 4 C8 3, 10 5, 10 7 C10 5, 12 3, 14 4 C18 6, 16 10, 10 16Z" fill="none" stroke={color} strokeWidth="1.5"/></svg>);
    case "star": return (<svg width={s} height={s} viewBox="0 0 20 20"><polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="none" stroke={color} strokeWidth="1.2"/></svg>);
    case "controller": return (<svg width={s} height={s} viewBox="0 0 20 20"><rect x="3" y="6" width="14" height="9" rx="3" fill="none" stroke={color} strokeWidth="1.2"/><circle cx="7" cy="10" r="1.5" fill={color}/><circle cx="13" cy="10" r="1.5" fill={color}/><line x1="5" y1="8" x2="9" y2="8" stroke={color} strokeWidth="0.8"/></svg>);
    case "spiral": return (<svg width={s} height={s} viewBox="0 0 20 20"><path d="M10 10 C10 8, 12 7, 13 9 C14 11, 12 13, 10 12 C8 11, 7 9, 9 7 C11 5, 14 7, 14 10 C14 13, 11 15, 8 13" fill="none" stroke={color} strokeWidth="1.2"/></svg>);
    case "scribble": return (<svg width={s} height={s} viewBox="0 0 20 20"><path d="M3 10 C5 6, 8 14, 10 10 C12 6, 15 14, 17 10" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>);
    case "arrow": return (<svg width={s} height={s} viewBox="0 0 20 20"><line x1="4" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><polyline points="12,6 16,10 12,14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>);
    case "zigzag": return (<svg width={s} height={s} viewBox="0 0 20 20"><polyline points="2,14 6,6 10,14 14,6 18,14" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>);
    case "eyes": return (<svg width={s} height={s} viewBox="0 0 20 20"><ellipse cx="7" cy="10" rx="3" ry="2" fill="none" stroke={color} strokeWidth="1"/><circle cx="7" cy="10" r="1" fill={color}/><ellipse cx="14" cy="10" rx="3" ry="2" fill="none" stroke={color} strokeWidth="1"/><circle cx="14" cy="10" r="1" fill={color}/></svg>);
    default: return null;
  }
}

// ═══════════════════════════════════════════
// AI CONVERSATION
// ═══════════════════════════════════════════
async function getStanDialogue(stan: any, context: string, history: any[]) {
  const sysPrompt = `You are ${stan.name} from the Ryzo universe — a protective inner voice of 14-year-old Aaron. Your emotional domain is ${stan.emotion}. You are a sensei testing whether this kid is worth your time. Your personality: ${stan.voice}

CRITICAL RULES:
- Stay in character. Never break character.
- Speak like a 14-year-old's inner voice, not a therapist.
- Keep responses to 1-3 sentences MAX.
- You are NOT fighting the player. You are testing them. The questions are a sparring match. If they get it right, you respect them more. If they get it wrong, you dismiss them.
- Be ${stan.id === 'paper' ? 'aggressive and blunt — like a fighter who respects someone who can take a hit' : stan.id === 'toy' ? 'sarcastic and exacting — like a craftsman watching someone butcher the work' : stan.id === 'cg' ? 'manic and fast — overwhelmed but trying to hold it together' : stan.id === 'sticky' ? 'quiet and bitter — like someone who expected to be ignored and almost was' : 'quiet and certain — the one who stayed when everyone else left'}.
- React to the spar context: ${context}
- Never use words like "emotional regulation" or "coping mechanisms."
- Never say "battle" — say "spar" or "test" or "round."`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:150, system: sysPrompt, messages: history.length > 0 ? history : [{role:"user",content:"React to this moment in the spar."}] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || stan.intro;
  } catch(e) { return null; }
}

// ═══════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════
export default function AaronsSketchbook({ collectSecret = '' }: { collectSecret?: string }) {
  const [screen, setScreen] = useState("title");
  const [pos, setPos] = useState({x:9,y:33});
  const [dir, setDir] = useState("down");
  const [hp, setHp] = useState(100);
  const [party, setParty] = useState<any[]>([]);
  const [curStan, setCurStan] = useState<any>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [curQ, setCurQ] = useState<any>(null);
  const [qIdx, setQIdx] = useState(0);
  const [totalQs, setTotalQs] = useState(3);
  const [answered, setAnswered] = useState<number | null>(null);
  const [shuffledQ, setShuffledQ] = useState<any>(null);
  const [dialogue, setDialogue] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [usedQs, setUsedQs] = useState(new Set<number>());
  const [stepCount, setStepCount] = useState(0);
  const [showParty, setShowParty] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const [showRedirect, setShowRedirect] = useState<{text:string;url:string}|null>(null);
  const [failCounts, setFailCounts] = useState<Record<string,number>>({cg:0,paper:0,toy:0,sticky:0,soft:0});
  const [arcMode, setArcMode] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loreCorrectTotal, setLoreCorrectTotal] = useState(0);
  const [loreTotalAsked, setLoreTotalAsked] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const convHistory = useRef<any[]>([]);

  const [surveyIdx, setSurveyIdx] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});
  const [surveyInput, setSurveyInput] = useState("");
  const [surveyComplete, setSurveyComplete] = useState(false);

  const findNextValidIdx = (fromIdx: number, answers: Record<string, any>) => {
    for (let i = fromIdx; i < SURVEY_QUESTIONS.length; i++) {
      const sq = SURVEY_QUESTIONS[i];
      if (!sq.condition || sq.condition(answers)) return i;
    }
    return -1;
  };

  const currentSurveyQ = () => {
    if (surveyIdx < 0 || surveyIdx >= SURVEY_QUESTIONS.length) return null;
    const sq = SURVEY_QUESTIONS[surveyIdx];
    if (sq.condition && !sq.condition(surveyAnswers)) return null;
    return sq;
  };

  const countActiveQuestions = () => {
    return SURVEY_QUESTIONS.filter(q => !q.condition || q.condition(surveyAnswers)).length;
  };

  const countAnswered = () => {
    let count = 0;
    for (let i = 0; i < surveyIdx; i++) {
      const sq = SURVEY_QUESTIONS[i];
      if (!sq.condition || sq.condition(surveyAnswers)) count++;
    }
    return count;
  };

  const numQsForEncounter = (stan: any) => {
    const order = ["cg","paper","toy","sticky","soft"];
    const idx = order.indexOf(stan?.id);
    if (idx <= 1) return 3;
    if (idx <= 3) return 4;
    return 5;
  };

  const getQuestion = (stan: any) => {
    if (arcMode && STAN_ARC[stan.id]) {
      const arc = STAN_ARC[stan.id].questions;
      const q = arc[qIdx] || arc[arc.length - 1];
      const opts = [...q.o];
      const correctText = opts[q.c];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      return { q: q.q, o: opts, c: opts.indexOf(correctText), d: "Medium", s: [stan.id] };
    }
    const avail = LORE_QUESTIONS.filter((q, i) => !usedQs.has(i) && (q.s.includes(stan.id) || q.s.includes("any")));
    if (avail.length === 0) {
      const fallback = LORE_QUESTIONS.filter((_, i) => !usedQs.has(i));
      if (fallback.length === 0) { setUsedQs(new Set()); return LORE_QUESTIONS[Math.floor(Math.random() * LORE_QUESTIONS.length)]; }
      const pick = fallback[Math.floor(Math.random() * fallback.length)];
      setUsedQs(prev => new Set([...prev, LORE_QUESTIONS.indexOf(pick)]));
      return pick;
    }
    const pick = avail[Math.floor(Math.random() * avail.length)];
    setUsedQs(prev => new Set([...prev, LORE_QUESTIONS.indexOf(pick)]));
    return pick;
  };

  const startEncounter = (stan: any, isArc = false) => {
    if (overworldLoop) overworldLoop.stop();
    playSfx("encounter");
    setCurStan(stan);
    setHp(100);
    setQIdx(0);
    setCorrectCount(0);
    setArcMode(isArc);
    const qs = isArc ? (STAN_ARC[stan.id]?.questions.length || 3) : numQsForEncounter(stan);
    setTotalQs(qs);
    setBattleState("intro");
    setDialogue(stan.intro);
    setAnswered(null);
    convHistory.current = [];
    setScreen("battle");
    setTimeout(() => createBattleMusic().start(), 600);
  };

  const startQuestion = () => {
    const q = getQuestion(curStan);
    const indices = [0,1,2,3];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffled = {
      ...q,
      o: indices.map((i: number) => q.o[i]),
      c: indices.indexOf(q.c),
      _orig: q
    };
    setCurQ(shuffled);
    setShuffledQ(shuffled);
    setBattleState("question");
    setAnswered(null);
  };

  const handleAnswer = async (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === curQ.c;
    let newCorrectCount = correctCount;
    setLoreTotalAsked(t => t + 1);
    if (correct) {
      setFlash("correct"); playSfx("correct");
      setScore(s => s + (curQ.d === "Easy" ? 10 : curQ.d === "Medium" ? 20 : 30));
      newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      setLoreCorrectTotal(t => t + 1);
    } else {
      const dmg = curQ.d === "Easy" ? 20 : curQ.d === "Medium" ? 25 : 30;
      setHp(h => Math.max(0, h - dmg));
      setFlash("wrong"); playSfx("wrong");
    }
    setTimeout(() => setFlash(null), 400);
    const nextQIdx = qIdx + 1;
    setQIdx(nextQIdx);
    const newHp = correct ? hp : Math.max(0, hp - (curQ.d === "Easy" ? 20 : curQ.d === "Medium" ? 25 : 30));

    setTimeout(async () => {
      if (newHp <= 0) {
        if (battleLoop) battleLoop.stop();
        setBattleState("result"); setDialogue(curStan.escape); playSfx("escape"); return;
      }
      if (nextQIdx >= totalQs) {
        if (battleLoop) battleLoop.stop();
        setBattleState("result");
        if (newCorrectCount === totalQs) {
          setDialogue(curStan.defeat); setParty(p => [...p, curStan]); playSfx("capture");
        } else {
          playSfx("escape");
          setDialogue(curStan.name === "Soft Stan" ? "...you tried. But you don't really know me yet. Come find me again." : curStan.name === "Paper Stan" ? "Close. But close isn't enough. You gotta KNOW me to catch me. Try again." : curStan.name === "Toy Stan" ? "Almost. But 'almost' is the story of Aaron's life, isn't it? Come back when you've done your homework." : curStan.name === "CG Stan" ? "So close! But not quite! You missed some stuff! Come back! Try again!" : "You noticed some things. But not everything. Look closer next time.");
        }
        return;
      }
      setBattleState("between");
      // Film redirect if Q1 missed in arc mode
      if (!correct && arcMode && qIdx === 0 && STAN_ARC[curStan.id]) {
        const newFails = {...failCounts, [curStan.id]: (failCounts[curStan.id]||0) + 1};
        setFailCounts(newFails);
        if (newFails[curStan.id] >= 1) {
          setTimeout(() => setShowRedirect(STAN_ARC[curStan.id].redirect), 1400);
        }
      }
      const ctx = correct ? `Player got that right (${newCorrectCount}/${nextQIdx} so far, ${totalQs - nextQIdx} rounds left). They need a perfect score to earn your respect. As a sensei sizing them up — they might actually have something. React in character, grudgingly.` : `Player got that WRONG (${newCorrectCount}/${nextQIdx}). They needed a perfect score. As a sensei who doesn't waste time on people who aren't ready — dismiss them or call them out. React in character.`;
      setAiLoading(true);
      convHistory.current.push({role:"user",content:ctx});
      const aiResp = await getStanDialogue(curStan, ctx, convHistory.current);
      if (aiResp) { convHistory.current.push({role:"assistant",content:aiResp}); setDialogue(aiResp); }
      else { setDialogue(correct ? "...not bad. Keep it up." : "Ha. You already blew it."); }
      setAiLoading(false);
    }, 1200);
  };

  const move = useCallback((dx: number, dy: number) => {
    if (screen !== "overworld") return;
    const newDir = dy < 0 ? "up" : dy > 0 ? "down" : dx < 0 ? "left" : "right";
    setDir(newDir);
    const nx = pos.x + dx, ny = pos.y + dy;
    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
    if (!WALKABLE.has(MAP[ny][nx])) return;
    setPos({x: nx, y: ny}); setStepCount(s => s + 1);
    if (stepCount % 2 === 0) playSfx("step");

    const tile = MAP[ny][nx];

    // Stan position tiles (1-5, N) — arc encounter
    const stanId = OBJECT_STANS[tile];
    if (stanId) {
      const alreadyEarned = party.find((p: any) => p.id === stanId);
      if (!alreadyEarned) { setTimeout(() => startEncounter(STANS[stanId], true), 200); }
      return;
    }

    // Zone tiles (c/p/t/s) — 18% random encounter
    const ZONE_STANS: Record<string, string> = { c:"cg", p:"paper", t:"toy", s:"sticky" };
    const zoneStanId = ZONE_STANS[tile];
    if (zoneStanId && Math.random() < 0.18) {
      const stan = STANS[zoneStanId];
      if (!party.find((p: any) => p.id === stan.id)) setTimeout(() => startEncounter(stan), 200);
    }
  }, [screen, pos, party, stepCount, arcMode, failCounts]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (screen === "overworld" && !showParty && !showQuit) {
        switch(e.key) {
          case "ArrowUp": case "w": move(0, -1); break;
          case "ArrowDown": case "s": move(0, 1); break;
          case "ArrowLeft": case "a": move(-1, 0); break;
          case "ArrowRight": case "d": move(1, 0); break;
          case "p": setShowParty(true); break;
          case "q": setShowQuit(true); break;
        }
      }
      if (showParty && (e.key === "Escape" || e.key === "p")) setShowParty(false);
      if (showQuit && e.key === "Escape") setShowQuit(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [screen, move, showParty, showQuit]);

  useEffect(() => {
    if (party.length === 5 && screen === "overworld") {
      if (overworldLoop) overworldLoop.stop();
      playSfx("capture");
      const sessionData = {
        timestamp: new Date().toISOString(),
        survey: surveyAnswers,
        battle: { battle_score: score, stans_captured: party.length, lore_correct: loreCorrectTotal, lore_total: loreTotalAsked }
      };
      const sessions = loadSessions();
      sessions.push(sessionData);
      saveSessions(sessions);
      sendToCollect(sessionData, collectSecret);
      setTimeout(() => setScreen("win"), 500);
    }
  }, [party, screen]);

  const handleSurveyNext = () => {
    const q = currentSurveyQ();
    if (!q) return;
    let val = surveyInput;
    if (q.required && (!val || val === "")) return;

    const newAnswers = { ...surveyAnswers, [q.id]: val };
    setSurveyAnswers(newAnswers);
    setSurveyInput("");

    const nextIdx = findNextValidIdx(surveyIdx + 1, newAnswers);
    if (nextIdx === -1) {
      setSurveyComplete(true);
      if (journalLoop) journalLoop.stop();
      playSfx("capture");
    } else {
      setSurveyIdx(nextIdx);
      playSfx("page");
    }
  };

  const handleSurveySkip = () => {
    const q = currentSurveyQ();
    if (!q || q.required) return;
    const newAnswers = { ...surveyAnswers, [q.id]: "(skipped)" };
    setSurveyAnswers(newAnswers);
    setSurveyInput("");
    const nextIdx = findNextValidIdx(surveyIdx + 1, newAnswers);
    if (nextIdx === -1) {
      setSurveyComplete(true);
      if (journalLoop) journalLoop.stop();
      playSfx("capture");
    } else {
      setSurveyIdx(nextIdx);
      playSfx("page");
    }
  };

  // ═══════════ TITLE SCREEN ═══════════
  if (screen === "title") {
    return (
      <div style={{width:"100%",maxWidth:500,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#111",padding:"20px 40px",boxSizing:"border-box",position:"relative",overflow:"visible"}}>
        <div style={{width:"100%",maxWidth:340,position:"relative",marginBottom:8}}>
          <div style={{position:"absolute",top:-18,right:-14,transform:"rotate(12deg)",zIndex:10,filter:"drop-shadow(2px 2px 0 #111)"}}>
            <StanSprite stanId="paper" scale={0.55} />
          </div>
          <div style={{position:"absolute",top:30,right:-20,transform:"rotate(-8deg)",zIndex:10,filter:"drop-shadow(2px 2px 0 #111)"}}>
            <StanSprite stanId="cg" scale={0.5} />
          </div>
          <div style={{position:"absolute",bottom:60,right:-18,transform:"rotate(6deg)",zIndex:10,filter:"drop-shadow(2px 2px 0 #111)"}}>
            <StanSprite stanId="toy" scale={0.48} />
          </div>
          <div style={{position:"absolute",bottom:10,left:-16,transform:"rotate(-10deg)",zIndex:10,filter:"drop-shadow(2px 2px 0 #111)"}}>
            <StanSprite stanId="sticky" scale={0.5} />
          </div>
          <div style={{position:"absolute",top:-14,left:-12,transform:"rotate(8deg)",zIndex:10,filter:"drop-shadow(2px 2px 0 #111)"}}>
            <StanSprite stanId="soft" scale={0.52} />
          </div>
          <div style={{background:"#1a1a1a",borderRadius:4,padding:28,boxShadow:"6px 6px 0 #000, -2px 0 0 #333",border:"1px solid #333"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:18,background:"repeating-linear-gradient(180deg,#222 0px,#222 8px,#1a1a1a 8px,#1a1a1a 16px)",borderRight:"1px solid #333",borderRadius:"4px 0 0 4px"}} />
            <div style={{marginLeft:18}}>
              <div style={{background:"#F2ECD8",borderRadius:3,padding:"10px 14px",marginBottom:16,boxShadow:"inset 0 1px 3px rgba(0,0,0,0.2)"}}>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:11,color:"#E63946",letterSpacing:4,marginBottom:2}}>RYZO STUDIOS</div>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:38,color:"#1a1a2e",lineHeight:1,letterSpacing:2}}>AARON'S</div>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:38,color:"#1a1a2e",lineHeight:1,letterSpacing:2}}>SKETCHBOOK</div>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:12,color:"#888",marginTop:4}}>A Knowledge Battle RPG</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,background:"#E63946",color:"#fff",padding:"2px 8px",borderRadius:3,transform:"rotate(-2deg)",display:"inline-block"}}>PAUSE</span>
                <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,background:"#1B9AAA",color:"#fff",padding:"2px 8px",borderRadius:3,transform:"rotate(1deg)",display:"inline-block"}}>BREATHE</span>
                <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,background:"#F5C518",color:"#1a1a2e",padding:"2px 8px",borderRadius:3,transform:"rotate(-1deg)",display:"inline-block"}}>COOL DOWN</span>
                <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,background:"#27AE60",color:"#fff",padding:"2px 8px",borderRadius:3,transform:"rotate(2deg)",display:"inline-block"}}>CONNECT</span>
              </div>
              <button onClick={async () => { await ensureAudio(); createJournalMusic().start(); setSurveyIdx(0); setSurveyAnswers({}); setSurveyInput(""); setSurveyComplete(false); setScreen("survey"); playSfx("select"); }}
                style={{width:"100%",padding:"12px",fontFamily:"'Bangers',cursive",fontSize:24,letterSpacing:3,background:"#E63946",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",boxShadow:"3px 3px 0 #8B1A1A",marginBottom:8,transition:"all 0.15s"}}>
                ▶ START GAME
              </button>
            </div>
          </div>
        </div>
        <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#555",marginTop:14,textAlign:"center",lineHeight:1.6}}>
          Arrow keys or WASD to move<br/>Walk up to glowing objects to find Stans • Earn all 5 to win!
        </div>
      </div>
    );
  }

  // ═══════════ SURVEY SCREEN ═══════════
  if (screen === "survey") {
    if (surveyComplete) {
      return (
        <div style={{width:"100%",maxWidth:500,margin:"0 auto",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,#e8e8e8 27px,#e8e8e8 28px)",padding:20,boxSizing:"border-box"}}>
          <div style={{background:"#fff",border:"4px solid #E63946",borderRadius:4,padding:0,maxWidth:340,width:"100%",boxShadow:"6px 6px 0 #111",animation:"popIn 0.4s ease-out",overflow:"hidden"}}>
            <div style={{background:"#111",padding:"12px 20px"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:26,color:"#F5C518",letterSpacing:3,textAlign:"center"}}>JOURNAL COMPLETE</div>
            </div>
            <div style={{background:"#F5C518",padding:"14px 20px"}}>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:18,color:"#111",lineHeight:1.5,textAlign:"center"}}>
                Thanks for being real with me. Now let's see what you actually know about the stuff in my head. Time to explore.
              </div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:15,color:"#333",textAlign:"right",marginTop:6}}>— Aaron</div>
            </div>
            <div style={{padding:"16px 20px",background:"#fff"}}>
              <button onClick={() => { if (journalLoop) journalLoop.stop(); createOverworldMusic().start(); setScreen("overworld"); playSfx("select"); }}
                style={{width:"100%",padding:"14px",fontFamily:"'Bangers',cursive",fontSize:22,letterSpacing:3,background:"#E63946",color:"#fff",border:"none",borderRadius:0,cursor:"pointer",boxShadow:"4px 4px 0 #111"}}>
                ENTER THE OVERWORLD ▶
              </button>
            </div>
          </div>
        </div>
      );
    }

    const q = currentSurveyQ();
    const totalActive = countActiveQuestions();
    const answered_ = countAnswered();
    const progress = totalActive > 0 ? ((answered_) / totalActive) * 100 : 0;

    return (
      <div style={{width:"100%",maxWidth:500,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",background:"#fff",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,#e8e8e8 27px,#e8e8e8 28px)",boxSizing:"border-box"}}>
        <div style={{background:"#111",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"4px solid #E63946"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:22,color:"#F5C518",letterSpacing:3}}>AARON'S JOURNAL</div>
          <div style={{fontFamily:"'Indie Flower',cursive",fontSize:15,color:"#aaa"}}>{answered_ + 1} / {totalActive}</div>
        </div>
        <div style={{height:6,background:"#333"}}>
          <div style={{height:"100%",background:"#E63946",width:`${progress}%`,transition:"width 0.3s"}} />
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:16,overflow:"auto"}}>
          {q && (
            <div key={q.id} style={{animation:"journalFade 0.35s ease-out"}}>
              {surveyIdx === 0 && (
                <div style={{background:"#F5C518",borderLeft:"5px solid #111",padding:"10px 14px",marginBottom:16}}>
                  <div style={{fontFamily:"'Indie Flower',cursive",fontSize:16,color:"#111",lineHeight:1.5}}>
                    Before we head into the game, I want to know about you. Not the surface stuff — the real stuff. Be honest. No wrong answers here.
                  </div>
                  <div style={{fontFamily:"'Indie Flower',cursive",fontSize:14,color:"#333",marginTop:4,textAlign:"right"}}>— Aaron</div>
                </div>
              )}
              <div style={{background:"#fff",border:"3px solid #E63946",padding:16,marginBottom:12,boxShadow:"4px 4px 0 #111",position:"relative"}}>
                <div style={{position:"absolute",top:-14,left:14,background:"#111",padding:"1px 10px",fontFamily:"'Bangers',cursive",fontSize:14,color:"#F5C518",letterSpacing:2}}>Q{answered_+1}</div>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:19,color:"#111",lineHeight:1.4,marginBottom:12,marginTop:6}}>
                  {q.q}
                  {q.required && <span style={{color:"#E63946",marginLeft:4}}>*</span>}
                </div>
                {q.type === "text" && (
                  q.inputType === "number" ? (
                    <input type="number" min="5" max="99" value={surveyInput} onChange={(e: any) => setSurveyInput(e.target.value)} placeholder={q.placeholder || "Your answer"}
                      style={{width:"100%",padding:"10px 12px",border:"2px solid #111",fontFamily:"'Indie Flower',cursive",fontSize:17,outline:"none",background:"#fff",color:"#111"}}
                      onKeyDown={(e: any) => { if (e.key === "Enter" && surveyInput) handleSurveyNext(); }} />
                  ) : (
                    <textarea value={surveyInput} onChange={(e: any) => setSurveyInput(e.target.value)} placeholder={q.placeholder || "Your answer"} rows={3}
                      style={{width:"100%",padding:"10px 12px",border:"2px solid #111",fontFamily:"'Indie Flower',cursive",fontSize:17,outline:"none",resize:"none",background:"#fff",color:"#111",lineHeight:1.5}} />
                  )
                )}
                {q.type === "dropdown" && (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {q.options.map((opt: string) => (
                      <button key={opt} onClick={() => setSurveyInput(opt)}
                        style={{padding:"10px 14px",fontFamily:"'Indie Flower',cursive",fontSize:18,background:surveyInput===opt?"#111":"#fff",color:surveyInput===opt?"#F5C518":"#111",border:surveyInput===opt?"2px solid #111":"2px solid #ccc",cursor:"pointer",textAlign:"left",transition:"all 0.1s",boxShadow:surveyInput===opt?"3px 3px 0 #E63946":"none"}}>
                        {surveyInput===opt?"✓ ":""}{opt}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === "scale" && (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {q.labels.map((label: string, i: number) => (
                      <button key={i} onClick={() => setSurveyInput(label)}
                        style={{padding:"10px 14px",fontFamily:"'Indie Flower',cursive",fontSize:17,background:surveyInput===label?"#111":"#fff",color:surveyInput===label?"#F5C518":"#111",border:surveyInput===label?"2px solid #111":"2px solid #ccc",cursor:"pointer",textAlign:"left",transition:"all 0.1s",boxShadow:surveyInput===label?"3px 3px 0 #E63946":"none"}}>
                        {surveyInput===label?"✓ ":""}{label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:4}}>
                {!q.required && (
                  <button onClick={handleSurveySkip}
                    style={{padding:"8px 18px",fontFamily:"'Indie Flower',cursive",fontSize:16,background:"transparent",color:"#aaa",border:"2px solid #ddd",cursor:"pointer"}}>
                    skip →
                  </button>
                )}
                <button onClick={handleSurveyNext} disabled={q.required && !surveyInput}
                  style={{padding:"10px 32px",fontFamily:"'Bangers',cursive",fontSize:22,letterSpacing:2,background:(q.required&&!surveyInput)?"#ccc":"#E63946",color:"#fff",border:"none",cursor:(q.required&&!surveyInput)?"not-allowed":"pointer",boxShadow:(q.required&&!surveyInput)?"none":"4px 4px 0 #111",opacity:(q.required&&!surveyInput)?0.5:1}}>
                  NEXT ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════ WIN SCREEN ═══════════
  if (screen === "win") {
    return (
      <div style={{width:"100%",maxWidth:500,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,#e8e8e8 27px,#e8e8e8 28px)",padding:20,boxSizing:"border-box"}}>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#E63946",letterSpacing:4,marginBottom:4}}>★ ALL STANS IN YOUR CORNER ★</div>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:32,color:"#111",letterSpacing:2,marginBottom:20,textAlign:"center"}}>YOUR CREW IS COMPLETE</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:20}}>
          {Object.values(STANS).map((s: any) => (
            <div key={s.id} style={{padding:10,background:"#fff",border:`3px solid ${s.color}`,borderRadius:4,textAlign:"center",boxShadow:`3px 3px 0 ${s.color}44`}}>
              <StanSprite stanId={s.id} scale={0.9} />
              <div style={{fontFamily:"'Bangers',cursive",fontSize:13,color:s.color,letterSpacing:1,marginTop:4}}>{s.name}</div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#888"}}>{s.skill}</div>
            </div>
          ))}
        </div>
        <div style={{fontFamily:"'Indie Flower',cursive",fontSize:16,color:"#333",textAlign:"center",maxWidth:320,lineHeight:1.6,marginBottom:16,fontStyle:"italic"}}>
          Every Stan showed up to protect Aaron. Rage. Overwhelm. Shame. Envy. And the quiet one who knew he could keep going. They're not enemies. They're the crew.
        </div>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:22,color:"#E63946",letterSpacing:2,marginBottom:2}}>Score: {score}</div>
        <div style={{fontFamily:"'Indie Flower',cursive",fontSize:14,color:"#888",marginBottom:20}}>Lore mastery: {loreCorrectTotal}/{loreTotalAsked}</div>
        <button onClick={() => { if (overworldLoop) overworldLoop.stop(); if (battleLoop) battleLoop.stop(); playSfx("select"); setScreen("title"); setParty([]); setUsedQs(new Set()); setPos({x:14,y:19}); setScore(0); setCorrectCount(0); setLoreCorrectTotal(0); setLoreTotalAsked(0); }}
          style={{padding:"10px 24px",fontFamily:"'Bangers',cursive",fontSize:20,letterSpacing:2,background:"#E63946",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",boxShadow:"3px 3px 0 #8B1A1A"}}>
          PLAY AGAIN
        </button>
      </div>
    );
  }

  // ═══════════ BATTLE SCREEN ═══════════
  if (screen === "battle" && curStan) {
    const hpPct = hp / 100;
    const hpColor = hpPct > 0.5 ? "#27AE60" : hpPct > 0.25 ? "#F39C12" : "#E63946";
    return (
      <div style={{width:"100%",maxWidth:500,margin:"0 auto",minHeight:"100vh",background:"#fff",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,#e8e8e8 27px,#e8e8e8 28px)",display:"flex",flexDirection:"column"}} ref={gameRef} tabIndex={0}>
        {flash && <div style={{position:"fixed",inset:0,background:flash==="correct"?"rgba(39,174,96,0.25)":"rgba(231,76,60,0.25)",zIndex:99,pointerEvents:"none"}} />}
        <div style={{background:"#111",padding:"6px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#F5C518",letterSpacing:2}}>{curStan.name}</div>
          <div style={{fontFamily:"'Indie Flower',cursive",fontSize:12,color:"#aaa"}}>Q {qIdx+1}/{totalQs} • Score: {score}</div>
        </div>
        <div style={{background:"#fff",borderBottom:"4px solid #111",padding:"12px 16px",display:"flex",alignItems:"flex-end",justifyContent:"space-between",minHeight:180,position:"relative"}}>
          <div style={{position:"absolute",top:8,left:0,right:0,textAlign:"center",fontFamily:"'Bangers',cursive",fontSize:36,color:curStan.color,letterSpacing:4,opacity:0.12,pointerEvents:"none",userSelect:"none"}}>
            {curStan.name.toUpperCase()}
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:"#4A90D9",border:"3px solid #111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:6,boxShadow:"3px 3px 0 rgba(0,0,0,0.2)"}}>🧑</div>
            <div style={{background:"#fff",border:"2px solid #111",borderRadius:4,padding:"4px 8px",minWidth:110}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#111",letterSpacing:1}}>Aaron <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#888",fontWeight:"normal"}}>Lv.{party.length+1}</span></div>
              <div style={{background:"#ddd",height:8,borderRadius:4,overflow:"hidden",marginTop:3,border:"1px solid #bbb"}}>
                <div style={{width:`${hpPct*100}%`,height:"100%",background:hpColor,transition:"width 0.4s",borderRadius:4}} />
              </div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#666",marginTop:1}}>{hp}/100 HP</div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:correctCount===qIdx&&qIdx>0?"#27AE60":"#E67E22",fontWeight:"bold"}}>{correctCount}/{qIdx} correct</div>
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{marginBottom:6,display:"flex",justifyContent:"center"}}>
              <StanSprite stanId={curStan.id} scale={1.4} />
            </div>
            <div style={{background:"#fff",border:`3px solid ${curStan.color}`,borderRadius:4,padding:"4px 8px",minWidth:110}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:13,color:curStan.color,letterSpacing:1}}>{curStan.name}</div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:10,color:"#888"}}>{curStan.emotion}</div>
            </div>
          </div>
        </div>
        <div style={{flex:1,background:"#fff",borderTop:"none",padding:12}}>
          {battleState === "intro" && (
            <div>
              <div style={{background:"#f5f5f0",border:"2px solid #111",borderRadius:4,padding:12,marginBottom:10,position:"relative"}}>
                <div style={{position:"absolute",top:-10,left:12,background:curStan.color,padding:"1px 10px",fontFamily:"'Bangers',cursive",fontSize:13,color:"#fff",letterSpacing:1,borderRadius:2}}>{curStan.name}</div>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:17,color:"#111",lineHeight:1.5,marginTop:4}}>{dialogue}</div>
              </div>
              <button onClick={() => { startQuestion(); playSfx("select"); }}
                style={{width:"100%",padding:"12px",fontFamily:"'Bangers',cursive",fontSize:22,letterSpacing:3,background:curStan.color,color:"#fff",border:"none",borderRadius:4,cursor:"pointer",boxShadow:`3px 3px 0 ${curStan.color}88`}}>
                SPAR!
              </button>
            </div>
          )}
          {battleState === "question" && curQ && (
            <div>
              <div style={{background:"#f5f5f0",border:"2px solid #111",borderRadius:4,padding:10,marginBottom:8}}>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:17,color:"#111",lineHeight:1.4}}>{curQ.q}</div>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#aaa",marginTop:4}}>
                  {curQ.d === "Easy" ? "⬜ Easy" : curQ.d === "Medium" ? "🟨 Medium" : "🟥 Hard"}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {curQ.o.map((opt: string, i: number) => {
                  let bg = "#f5f5f0", borderC = "#e0e0d8", textC = "#111";
                  if (answered !== null) {
                    if (i === curQ.c) { bg = "#d5f5d5"; borderC = "#27AE60"; textC = "#1a6b3a"; }
                    else if (i === answered) { bg = "#fdd5d5"; borderC = "#E63946"; textC = "#8B1A1A"; }
                  }
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={answered !== null}
                      style={{padding:"9px 7px",fontFamily:"'Indie Flower',cursive",fontSize:15,fontWeight:answered!==null&&i===curQ.c?"bold":"normal",background:bg,border:`2px solid ${borderC}`,borderRadius:4,cursor:answered===null?"pointer":"default",textAlign:"left",color:textC,transition:"all 0.15s",lineHeight:1.3}}>
                      <span style={{fontFamily:"'Bangers',cursive",marginRight:4}}>{["A","B","C","D"][i]})</span>{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {battleState === "between" && (
            <div>
              <div style={{background:"#f5f5f0",border:"2px solid #111",borderRadius:4,padding:12,marginBottom:10,position:"relative"}}>
                <div style={{position:"absolute",top:-10,left:12,background:curStan.color,padding:"1px 10px",fontFamily:"'Bangers',cursive",fontSize:13,color:"#fff",letterSpacing:1,borderRadius:2}}>{curStan.name}</div>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:17,color:"#111",lineHeight:1.5,marginTop:4}}>{aiLoading ? "..." : dialogue}</div>
              </div>
              {!aiLoading && (
                <button onClick={startQuestion}
                  style={{width:"100%",padding:"10px",fontFamily:"'Bangers',cursive",fontSize:20,letterSpacing:2,background:"#111",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",boxShadow:"3px 3px 0 #000"}}>
                  NEXT QUESTION ▶
                </button>
              )}
            </div>
          )}
          {battleState === "result" && (() => {
            const captured = party.includes(curStan);
            const knockedOut = hp <= 0;
            return (
              <div>
                <div style={{background:captured?"#f0fff4":knockedOut?"#fff0f0":"#fffbf0",border:`3px solid ${captured?curStan.color:knockedOut?"#E63946":"#E67E22"}`,borderRadius:4,padding:12,marginBottom:10}}>
                  {captured && <div style={{fontFamily:"'Bangers',cursive",fontSize:18,color:curStan.color,letterSpacing:2,marginBottom:6}}>★ {curStan.name} IS IN YOUR CORNER ★</div>}
                  {knockedOut && <div style={{fontFamily:"'Bangers',cursive",fontSize:16,color:"#E63946",letterSpacing:1,marginBottom:6}}>YOU BLACKED OUT — {curStan.name} WALKS</div>}
                  {!captured && !knockedOut && <div style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#E67E22",letterSpacing:1,marginBottom:6}}>DISMISSED — need a clean sweep to earn {curStan.name}</div>}
                  <div style={{fontFamily:"'Indie Flower',cursive",fontSize:16,color:"#111",lineHeight:1.5,fontStyle:"italic"}}>{dialogue}</div>
                  {captured && (
                    <div style={{marginTop:10,padding:8,background:"rgba(255,255,255,0.8)",borderRadius:4,border:`2px solid ${curStan.color}`}}>
                      <div style={{fontFamily:"'Bangers',cursive",fontSize:15,color:curStan.color,letterSpacing:1}}>SKILL UNLOCKED: {curStan.skill}</div>
                      <div style={{fontFamily:"'Indie Flower',cursive",fontSize:14,color:"#555"}}>{curStan.skillDesc}</div>
                    </div>
                  )}
                </div>
                <button onClick={() => { setScreen("overworld"); createOverworldMusic().start(); playSfx("select"); }}
                  style={{width:"100%",padding:"12px",fontFamily:"'Bangers',cursive",fontSize:20,letterSpacing:2,background:"#111",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",boxShadow:"3px 3px 0 #000"}}>
                  CONTINUE ▶
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // ═══════════ OVERWORLD ═══════════
  const camX = Math.max(0, Math.min(pos.x - Math.floor(VIEW_W/2), MAP_W - VIEW_W));
  const camY = Math.max(0, Math.min(pos.y - Math.floor(VIEW_H/2), MAP_H - VIEW_H));

  return (
    <div style={{width:"100%",maxWidth:500,margin:"0 auto",minHeight:"100vh",background:"#111",display:"flex",flexDirection:"column"}} ref={gameRef} tabIndex={0}>
      <div style={{background:"#111",padding:"6px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${curStan?.color||"#333"}`}}>
        <div style={{fontFamily:"'Bangers',cursive",fontSize:16,color:"#F5C518",letterSpacing:2}}>{party.length}/5 IN YOUR CORNER</div>
        <div style={{fontFamily:"'Indie Flower',cursive",fontSize:13,color:"#aaa"}}>Score: {score}</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={() => setShowParty(true)} style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#1B9AAA",background:"transparent",border:"none",cursor:"pointer",letterSpacing:1}}>PARTY</button>
          <button onClick={() => setShowQuit(true)} style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#E63946",background:"transparent",border:"none",cursor:"pointer",letterSpacing:1}}>QUIT</button>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"#fff",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,#e8e8e8 27px,#e8e8e8 28px)"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${VIEW_W}, ${TILE_SIZE}px)`,gridTemplateRows:`repeat(${VIEW_H}, ${TILE_SIZE}px)`,border:"3px solid #111",imageRendering:"pixelated"}}>
          {Array.from({length: VIEW_H}, (_, vy) =>
            Array.from({length: VIEW_W}, (_, vx) => {
              const mx = camX + vx, my = camY + vy;
              const tile = MAP[my]?.[mx] || "#";
              const tc = TILE_COLORS[tile] || TILE_COLORS["#"];
              const isPlayer = mx === pos.x && my === pos.y;
              return (
                <div key={`${vx}-${vy}`} style={{width:TILE_SIZE,height:TILE_SIZE,background:tc.bg,border:`1px solid ${tc.border}`,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,overflow:"hidden",boxSizing:"border-box",
                  boxShadow: OBJECT_STANS[tile] ? `inset 0 0 8px ${tc.bg}` : "none",
                  outline: OBJECT_STANS[tile] && !party.find((p: any)=>p.id===OBJECT_STANS[tile]) ? `2px solid ${tc.border}` : "none"
                }}>
                  {tile === "#" && <div style={{width:"100%",height:"100%",background:"repeating-linear-gradient(135deg,#1a1a2e 0px,#1a1a2e 6px,#222 6px,#222 12px)"}} />}
                  {tile === "P" && (<>
                    <div style={{position:"absolute",inset:0,background:"#f0ece0"}} />
                    {(vx+vy)%3===0 && <div style={{position:"absolute",top:2,left:3,fontSize:7,color:"#E63946",opacity:0.4,transform:`rotate(${(vx*13+vy*7)%30-15}deg)`,fontFamily:"'Indie Flower',cursive"}}>✗</div>}
                    {(vx+vy)%4===0 && <div style={{position:"absolute",bottom:2,right:3,fontSize:6,color:"#888",opacity:0.5,transform:`rotate(${(vx*7+vy*11)%20-10}deg)`}}>📄</div>}
                    {(vx+vy)%5===0 && <div style={{position:"absolute",top:1,right:2,fontSize:7,color:"#E63946",fontWeight:"bold",opacity:0.35}}>!</div>}
                  </>)}
                  {OBJECT_STANS[tile] && (() => {
                    const earned = party.find((p: any)=>p.id===OBJECT_STANS[tile]);
                    const obj = OBJECT_LABELS[tile];
                    return earned
                      ? <div style={{fontSize:12,opacity:0.35}}>{obj.icon}</div>
                      : <div style={{fontSize:14,animation:"grassPulse 1.5s ease-in-out infinite",animationDelay:`${(vx*0.3)%1.5}s`}}>{obj.icon}</div>;
                  })()}
                  {tile === "d" && <div style={{width:"100%",height:"100%",background:"#8B6F47",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🚪</div>}
                  {DECORATIONS[`${mx},${my}`] && (() => {
                    const d = DECORATIONS[`${mx},${my}`];
                    const transform = `rotate(${d.rotation || 0}deg)`;
                    if (d.type === "text") return (<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,pointerEvents:"none",transform,opacity:d.opacity||0.2}}><span style={{fontSize:d.size||8,color:d.color,fontWeight:d.bold?"bold":"normal",fontStyle:d.cursive?"italic":"normal",fontFamily:d.cursive?"'Indie Flower',cursive":"'Bangers',cursive"}}>{d.content}</span></div>);
                    if (d.type === "svg") return (<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,pointerEvents:"none",transform,opacity:d.opacity||0.2}}><SketchSVG shape={d.shape} color={d.color} size={d.size||20} /></div>);
                    return null;
                  })()}
                  {isPlayer && (<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}><div style={{width:22,height:22,borderRadius:"50%",background:"#4A90D9",border:"2px solid #111",boxShadow:"0 0 6px rgba(74,144,217,0.8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{dir === "up" ? "△" : dir === "down" ? "▽" : dir === "left" ? "◁" : "▷"}</div></div>)}
                </div>
              );
            })
          ).flat()}
        </div>
      </div>
      <div style={{background:"#111",padding:10,display:"flex",justifyContent:"center",borderTop:"2px solid #333"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, 48px)",gridTemplateRows:"repeat(3, 48px)",gap:3}}>
          <div />
          <button onClick={() => move(0,-1)} style={{background:"#222",border:"2px solid #444",borderRadius:6,color:"#aaa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>▲</button>
          <div />
          <button onClick={() => move(-1,0)} style={{background:"#222",border:"2px solid #444",borderRadius:6,color:"#aaa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>◀</button>
          <div style={{background:"#1a1a1a",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#333",fontFamily:"'Bangers',cursive"}}>+</div>
          <button onClick={() => move(1,0)} style={{background:"#222",border:"2px solid #444",borderRadius:6,color:"#aaa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>▶</button>
          <div />
          <button onClick={() => move(0,1)} style={{background:"#222",border:"2px solid #444",borderRadius:6,color:"#aaa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>▼</button>
          <div />
        </div>
      </div>
      <div style={{background:"#111",padding:"5px 12px",textAlign:"center"}}>
        <span style={{fontFamily:"'Indie Flower',cursive",fontSize:12,color:"#F5C518"}}>Walk up to glowing objects to find Stans — earn their respect to get them in your corner</span>
      </div>

      {showParty && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={() => setShowParty(false)}>
          <div style={{background:"#fff",border:"4px solid #F5C518",borderRadius:0,padding:0,maxWidth:400,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:"6px 6px 0 #111"}} onClick={(e: any) => e.stopPropagation()}>
            <div style={{background:"#111",padding:"12px 20px",borderBottom:"4px solid #E63946"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:22,color:"#F5C518",letterSpacing:3,textAlign:"center"}}>YOUR CORNER ({party.length}/5)</div>
            </div>
            <div style={{padding:16}}>
              {party.length === 0 && <div style={{fontFamily:"'Indie Flower',cursive",fontSize:16,color:"#888",textAlign:"center",padding:20}}>No Stans caught yet. Explore the map!</div>}
              {party.map((s: any) => (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:10,marginBottom:8,background:"#fff",border:`3px solid ${s.color}`,boxShadow:"3px 3px 0 #111"}}>
                  <StanSprite stanId={s.id} scale={0.8} />
                  <div>
                    <div style={{fontFamily:"'Bangers',cursive",fontSize:18,color:s.color,letterSpacing:1}}>{s.name}</div>
                    <div style={{fontFamily:"'Indie Flower',cursive",fontSize:13,color:"#666"}}>{s.emotion}</div>
                    <div style={{fontFamily:"'Indie Flower',cursive",fontSize:13,color:"#333"}}>Skill: {s.skill}</div>
                  </div>
                </div>
              ))}
              {[...Object.values(STANS).filter((s: any) => !party.find((p: any) => p.id === s.id))].map((s: any) => (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:10,marginBottom:8,background:"#f5f5f5",border:"2px solid #ccc",opacity:0.6}}>
                  <div style={{width:40,height:40,background:"#ddd",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bangers',cursive",fontSize:18,color:"#999"}}>?</div>
                  <div><div style={{fontFamily:"'Bangers',cursive",fontSize:16,color:"#999",letterSpacing:1}}>???</div><div style={{fontFamily:"'Indie Flower',cursive",fontSize:13,color:"#bbb"}}>Not yet discovered</div></div>
                </div>
              ))}
              <button onClick={() => setShowParty(false)} style={{width:"100%",marginTop:12,padding:"12px",fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:2,background:"#111",color:"#F5C518",border:"none",cursor:"pointer",boxShadow:"3px 3px 0 #E63946"}}>CLOSE [P]</button>
            </div>
          </div>
        </div>
      )}

      {showRedirect && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#1a1a2e",border:"3px solid #E63946",borderRadius:12,padding:24,maxWidth:360,width:"100%",textAlign:"center"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:13,color:"#F5C518",letterSpacing:3,marginBottom:12}}>THE FILM SHOWS YOU WHAT IT FEELS LIKE</div>
            <div style={{fontFamily:"'Indie Flower',cursive",fontSize:15,color:"#fff",lineHeight:1.6,marginBottom:6,fontStyle:"italic"}}>"{showRedirect.text}"</div>
            <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#888",marginBottom:20}}>The game teaches you what to do about it. You need both.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <a href={showRedirect.url} target="_blank" rel="noopener noreferrer"
                style={{display:"block",padding:"12px",fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:2,background:"#E63946",color:"#fff",borderRadius:6,textDecoration:"none",boxShadow:"3px 3px 0 #8B1A1A"}}>
                WATCH THAT MOMENT →
              </a>
              <button onClick={() => setShowRedirect(null)}
                style={{padding:"10px",fontFamily:"'Indie Flower',cursive",fontSize:14,background:"#333",color:"#aaa",border:"1px solid #555",borderRadius:6,cursor:"pointer"}}>
                Keep Trying
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuit && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={() => setShowQuit(false)}>
          <div style={{background:"#fff",border:"4px solid #E63946",padding:0,maxWidth:340,width:"100%",boxShadow:"6px 6px 0 #111"}} onClick={(e: any) => e.stopPropagation()}>
            <div style={{background:"#E63946",padding:"12px 20px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:26,color:"#fff",letterSpacing:3}}>QUIT GAME?</div>
            </div>
            <div style={{padding:"16px 20px",textAlign:"center"}}>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:17,color:"#111",marginBottom:4}}>You've got {party.length}/5 in your corner</div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:17,color:"#111",marginBottom:16}}>Score: {score}</div>
              <div style={{background:"#F5C518",padding:"8px 12px",marginBottom:20}}>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:14,color:"#111",lineHeight:1.5}}>Your survey answers and partial battle data will be saved.</div>
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button onClick={() => setShowQuit(false)} style={{padding:"10px 16px",fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:1,background:"#fff",color:"#111",border:"3px solid #111",cursor:"pointer"}}>KEEP PLAYING</button>
                <button onClick={() => {
                  const sessionData = {timestamp:new Date().toISOString(),survey:surveyAnswers,battle:{battle_score:score,stans_captured:party.length,lore_correct:loreCorrectTotal,lore_total:loreTotalAsked}};
                  const sessions = loadSessions(); sessions.push(sessionData); saveSessions(sessions);
                  sendToCollect(sessionData, collectSecret);
                  if (overworldLoop) overworldLoop.stop(); if (battleLoop) battleLoop.stop(); playSfx("select"); setShowQuit(false); setScreen("title"); setParty([]); setUsedQs(new Set()); setPos({x:14,y:19}); setScore(0); setCorrectCount(0); setLoreCorrectTotal(0); setLoreTotalAsked(0);
                }} style={{padding:"10px 16px",fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:1,background:"#E63946",color:"#fff",border:"none",cursor:"pointer",boxShadow:"3px 3px 0 #111"}}>QUIT & SAVE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
