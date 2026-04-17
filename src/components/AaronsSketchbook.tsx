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
  toy: { id:"toy", name:"Toy Stan", emotion:"Frustration & Shame", color:"#E67E22", bgColor:"#FEF5E7", skill:"CHILL", skillDesc:"Lower the temperature before you make your move. That's CHILL.", voice:"Sarcastic, perfectionist, self-deprecating. Has standards. Disappointed by everything, including himself.", intro:"Oh great. Another visitor who thinks they understand craft. Let me guess — you think everything Aaron makes is 'good enough'?", defeat:"Whoa. You actually... see the details. Most people just see the surface. The truth is, I'm not mad at the work. I'm just scared that if it's not perfect, no one will think Aaron matters. Maybe that's not the worst thing to admit.", escape:"Typical. Surface-level understanding. Come back when you can see what's actually wrong." },
  cg: { id:"cg", name:"CG Stan", emotion:"Overwhelm & Pressure", color:"#8E44AD", bgColor:"#F5EEF8", skill:"BREATHE", skillDesc:"Slow it down. One breath changes everything.", voice:"Fast-talking, anxious, manic then shutdown. Seventeen thoughts at once. Goes quiet when overloaded.", intro:"Hey. You're here. Perfect. Now before somebody tries to interrupt — I've got seventeen strategies to review. Oh wait. We're sparring RIGHT? Let's go!", defeat:"Yes! You did it. Not everybody hangs around when I start spinning. The thing is... I gotta cover everything because if Aaron drops even ONE ball, they all come crashing down. But — BREATHE — maybe I don't have to handle everything all at once.", escape:"Too much! This is too much! I gotta go — sorry — bye —" },
  sticky: { id:"sticky", name:"Sticky Stan", emotion:"Envy & Comparison", color:"#27AE60", bgColor:"#EAFAF1", skill:"RELEASE", skillDesc:"Let the score go. That's where the energy comes from.", voice:"Quiet, bitter, speaks in comparisons. Keeps score. Assumes you forgot about him.", intro:"Oh look. You found me. Bet you found everyone else first though, right? That tracks.", defeat:"You're the first person who asked me anything. Was that because I let you? Usually I have to have the snappy comeback — I spend all my time making sure Aaron measures up to everybody else. I forgot to ask what Aaron actually cares about.", escape:"Whatever. Go hang out with the cooler Stans. I'll be here." },
  soft: { id:"soft", name:"Soft Stan", emotion:"Self-Regard & Resilience", color:"#2980B9", bgColor:"#EBF5FB", skill:"CONNECT", skillDesc:"You can keep going. Reach out — that's the hardest and most powerful move.", voice:"Quiet but not weak. Speaks in short certain sentences. The one who stayed when everyone else left.", intro:"You made it this far. Most people don't. I've been waiting.", defeat:"You stayed. You kept going even when it got hard. That's what I carry — the part of Aaron that knows he can survive it. Not because it stops hurting. Because he's still here. And that's enough to finish the fight.", escape:"Not yet. You'll need to know this before the end. Come back." }
};

// ═══════════════════════════════════════════
// STAN ARC QUESTIONS — locked to Stan tile encounters only
// Q1=film, Q2=game, Q3=bridge, Q4/Q5=deeper
// ═══════════════════════════════════════════
const FILM_URL = "https://www.youtube.com/watch?v=fGHBh76NHuI";
const SKILL_ICONS: Record<string, string> = {
  pause:   "data:image/png;base64,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",
  breathe: "data:image/png;base64,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",
  chill:   "data:image/png;base64,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",
  connect: "data:image/png;base64,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",
};

const STAN_ARC: Record<string, any> = {
  cg: {
    redirect: { text:"You missed it. Go back to when Aaron's mom offered to make that call. Watch his face. That's the moment I showed up. Come back when you've seen it.", url: FILM_URL + "&t=92" },
    questions: [
      { q:"In the film, when Aaron's mom wants to call Fireboy's mom, I say \"Do NOT get her involved!\" Which feelings is Aaron having that I'm trying to help with?", o:["Aaron feeling shame about his mom having to step in","Aaron worrying this will make the problem bigger","Aaron stressed about what his mom will say","All of the above"], c:3 },
      { q:"In the game, Rage Fighters — I'm in the EmoDojo zone. Mind Ninjas multiply faster than you can fight them. What's the only move?", o:["Fight one at a time","Use BREATHE to get through","Wait for a pile-on and whirl around madly","Ignore them"], c:1 },
      { q:"Aaron felt shame, worry, and stress all at once in that moment. When YOU feel everything hitting at once, what's the most important move?", o:["Handle each problem one at a time","Stop and breathe BEFORE you react or decide anything","Ask someone for help immediately","Push through until it's over"], c:1 },
    ]
  },
  paper: {
    redirect: { text:"You don't get where I come from yet. Go back to when those messages hit Aaron at his desk. Watch what happens to him. That's me. That's where I was born.", url: FILM_URL + "&t=165" },
    questions: [
      { q:"In the film, I, Paper Stan, the RAGEFUL show up after Aaron gets to his room and is immediately hit with mean messages from Fireboy. What triggers his rage?", o:["Aaron losing at the game","Aaron being called out when he's home and ready to start working","Aaron's mom getting involved","Aaron's phone dying"], c:1 },
      { q:"In the film, Release the Beast — Mind Ninjas are swarming thoughts you can't stop. But I live in the Rage Storm, where Triggers are different. A trigger is when something OUTSIDE you — a sound, a message, a look — suddenly resurfaces a painful feeling. What hits Aaron like a trigger in that moment?", o:["Losing at his game","Getting Fireboy's messages when he's already hurt from earlier","Hearing his mom's voice","Seeing his own reflection"], c:1 },
      { q:"The skill I needed most — and had to work hardest to learn — is PAUSE: get out before you blow up. When is PAUSE most powerful?", o:["After you've already said something you regret","Right when you feel the rage starting — before it takes over","When everything has calmed down","When someone tells you to calm down"], c:1 },
    ]
  },
  toy: {
    redirect: { text:"You don't know why I jumped off that shelf yet. Go watch that moment. You'll see exactly what shame and rage look like when they hit at the same time. Then come back.", url: FILM_URL + "&t=230" },
    questions: [
      { q:"Remember when I jumped off the shelf after realizing we got called an NPC again? What do you think I'm really feeling at that moment?", o:["Pure Rage at that Stinkbrain Fireboy","Shame. Because he keeps calling us that. And we're trying so hard to be something else.","Frustration that we can't fight back","Happy because now we can just stop"], c:1 },
      { q:"In the game, Rage Fighters — the Critics in my Toxic Zone have thumbs-down on their chests and they never stop. What are they in real life?", o:["Teachers who give bad grades","Everyone's opinions","People who used to be your friends","Randos in a comment section"], c:1 },
      { q:"My biggest skill is CHILL — and I mean that literally. When shame and rage hit at the same time, MY brain goes HOT. What actually works?", o:["Thinking about something happy","Get Cold. Splash cold water on your face, ice, anything physical — it snaps your brain back","Yelling until you feel better","Waiting it out alone"], c:1 },
      { q:"And here's what I had to learn the hard way — the best Cool Down move isn't during the blowup. It's not after either. When do YOU use it?", o:["When someone tells you to calm down","Before you lose it — the second you feel it building","After you've said what you needed to say","When you're already on the floor"], c:1 },
    ]
  },
  sticky: {
    redirect: { text:"You don't know where I come from yet. Go find the part where Aaron sees Fireboy's post. That's the exact second I showed up. Keeping score. Like I always do.", url: FILM_URL + "&t=177" },
    questions: [
      { q:"I showed up when Aaron saw Fireboy's IG post. \"Everything's easy for him.\" What's really happening in that moment?", o:["Aaron is jealous of Fireboy's design skills","Aaron is measuring himself against someone else and coming up short","Aaron is angry his phone is blowing up","Aaron wishes he had more followers"], c:1 },
      { q:"In the game, Rage Fighters — the Exposure Beams don't attack you. They just... watch. What do they represent?", o:["Security cameras","The feeling that everyone's excited to see you fail","Fans following your work","Spotlight on a stage"], c:1 },
      { q:"My skill is RELEASE. I keep score constantly — who has more, who got further, who won. What does keeping that score actually cost you?", o:["Your reputation","Your focus on what YOU actually want","Your friendships","Your time"], c:1 },
      { q:"The counter-move to Exposure Beams is choosing to be seen by someone safe. What's the difference between that and just being watched?", o:["There isn't one","You're in control of who sees you — and they're on your side","Safe people don't judge","It's quieter"], c:1 },
    ]
  },
  soft: {
    redirect: { text:"You haven't found me yet. Go watch what happens right before Aaron turns it around. That moment — that's where I live. Come back when you've seen it.", url: FILM_URL + "&t=412" },
    questions: [
      { q:"I'm a little different from everybody else. I was made by someone who always sees the best in Aaron. So when Aaron gives up, I know he needs something different. What do I say that helps?", o:["\"You should apologize to Fireboy\"","\"Don't let this stop you\"","\"Your mom is coming\"","\"You can get revenge later\""], c:1 },
      { q:"In the game, Rage Fighters — Inner Turmoil is the final boss in the Toxic Zone. He's built from every harsh thing Aaron has ever been told about himself. What makes him different from every other enemy?", o:["He has the most HP","He sounds exactly like Aaron's own voice","He can't be defeated alone","He lives in the Toxic Zone"], c:1 },
      { q:"My skill is CONNECT. Aaron's mom is there for him — but he has to let her in. What could Aaron actually do to use his CONNECT skill in that moment?", o:["Post about it online","Go to his mom and tell her what actually happened","Text Fireboy back","Wait until he feels better on his own"], c:1 },
      { q:"CONNECT isn't just about asking for help. It's about letting someone see the real thing. What's the hardest part of that?", o:["Finding the right words","Believing someone will actually show up for you when you're at your worst","Knowing who to call","Picking the right time"], c:1 },
      { q:"I represent all the good voices — the people who believe in you even when you don't. What's the most powerful thing CONNECT does?", o:["It solves the problem faster","It makes you look stronger","It reminds you that you don't have to survive the hard stuff alone","It gets you more followers"], c:2 },
    ]
  },
};

// ═══════════════════════════════════════════
// SKILL QUESTIONS (zone tile encounters)
// ═══════════════════════════════════════════
const SKILL_QUESTIONS: any[] = [
  // ── BREATHE ──
  {q:"BREATHE is a skill in Rage Fighters. What does it actually do?", o:["Freezes enemies in place","Calls in a teammate","Gives you a speed boost","Restores health and grounds you faster than waiting"], c:3, skill:"breathe"},
  {q:"In Rage Fighters, when should you use BREATHE?", o:["When you're at 10% health and out of options","Early — before the swarm buries you","Only in boss fights","Right after you take your biggest hit"], c:1, skill:"breathe"},
  {q:"BREATHE works IRL too — where do you breathe for it to actually reset your body?", o:["Into your chest — it's more powerful","Through your mouth, slow and steady","It doesn't matter as long as you breathe","Into your stomach"], c:3, skill:"breathe"},
  {q:"Deep breathing sends your body a message. What is it?", o:["That you need to fight harder","That you should sleep it off","That you need more oxygen to think","We're okay — we can get through this"], c:3, skill:"breathe"},
  {q:"Advanced BREATHE isn't just for when you're already upset. When do you use it?", o:["Only when you're shaking and can't stop","Right after something bad happens","Only during a fight when skills are locked","Before any stressful situation when you want to feel centered"], c:3, skill:"breathe"},
  // ── PAUSE ──
  {q:"PAUSE is a skill in Rage Fighters. What does it actually do?", o:["Restores health and grounds you","Calls in backup automatically","Freezes enemies in range","Teleport + forcefield — stops attacks and gives you time to think"], c:3, skill:"pause"},
  {q:"When Mind Ninjas swarm you in Rage Fighters, what does PAUSE give you?", o:["More attack damage to fight back","Extra health regeneration over time","A teammate who jumps in automatically","Distance and a forcefield"], c:3, skill:"pause"},
  {q:"PAUSE in real life means...", o:["Running away and never coming back","Hiding until everyone forgets what happened","Pretending nothing happened and moving on like normal","Leaving before you say something you can't take back"], c:3, skill:"pause"},
  {q:"Pause isn't avoidance. What is it?", o:["Ignoring the problem until it fades on its own","Waiting for the other person to stop first","Pretending you're fine when you're not","Choosing your moment"], c:3, skill:"pause"},
  {q:"You're about to say something you can't take back. What's the move?", o:["Say it — honesty matters more than timing","Stay until there's a real resolution","Wait for them to stop talking first","Pause — get some space. Take a beat to think."], c:3, skill:"pause"},
  // ── CHILL ──
  {q:"CHILL is a skill in Rage Fighters. What does it actually do?", o:["Restores your health over time","Calls in a teammate automatically","Creates a forcefield around you","Sends out a freeze field — slows enemies and gives YOU a speed boost"], c:3, skill:"chill"},
  {q:"When should you deploy CHILL in Rage Fighters?", o:["When you're already buried and out of options","Only against bosses — it doesn't work on small enemies","Right after you take your biggest hit","When enemies are swarming — before the swarm builds"], c:3, skill:"chill"},
  {q:"CHILL works IRL. Why does putting something cold on your body actually help when you're angry?", o:["Cold is a distraction that breaks your focus","It makes you look calmer so others back off","It slows your heart rate permanently","Your body temperature affects your emotional temperature"], c:3, skill:"chill"},
  {q:"When you're really angry, your brain is literally...", o:["Cold and shutting down to protect itself","Sleeping — that's why you can't think straight","Running too many thoughts all at once","HOT"], c:3, skill:"chill"},
  {q:"Best real CHILL move when you feel yourself heating up?", o:["Yell into a pillow until it passes","Think about something that makes you happy","Count slowly from 100 down to zero","Cold water on your wrists or an ice cube"], c:3, skill:"chill"},
  // ── CONNECT ──
  {q:"CONNECT is a skill in Rage Fighters. What does it actually do?", o:["Freezes all enemies so you can think","Gives you a speed boost and forcefield","Restores health faster than BREATHE","Calls in support — some fights can't be won solo"], c:3, skill:"connect"},
  {q:"In Rage Fighters, when do you need CONNECT most?", o:["When you want to go faster","When you need a quick health boost","When enemies are frozen and you have time","Boss fights — certain shields require two players hitting at once"], c:3, skill:"connect"},
  {q:"CONNECT IRL means asking for help. What makes that hard for most people?", o:["It takes too long to explain","People usually say no anyway","It costs too much emotional energy to try","Most people think needing help means they're weak"], c:3, skill:"connect"},
  {q:"When Critics swarm you, what does CONNECT do?", o:["Gets you more followers to drown them out","Blocks everyone who's being negative","Makes you invisible so they lose track of you","One real voice cuts through a thousand opinions"], c:3, skill:"connect"},
  {q:"Why can't you finish Inner Turmoil solo?", o:["He regenerates faster than you deal damage","His final phase needs two targets hit at once","He absorbs solo attacks and gets stronger from them","You need someone to say \"that's not true\" when the voice is loudest"], c:3, skill:"connect"},
];

// ═══════════════════════════════════════════
// NOTEBOOK PAGES
// ═══════════════════════════════════════════
const NOTEBOOK_PAGES: Record<string, any> = {
  breathe: {
    skill: "BREATHE",
    sub: "reset your body",
    color: "#8E44AD",
    body: `What it does: Restores health. Grounds you faster. Bigger reset than just waiting.\n\nIn Rage Fighters: Use BREATHE before the swarm hits, not after. Skilled players use it early — when the screen starts getting shaky, not when they're already buried.\n\nIn life: Deep breathing into your STOMACH resets your body's panic response. It's not just "calm down" advice — it's biology. Your body thinks it's in danger. Deep breaths say: "We're okay. We can get through this."\n\nTry this: Where are you breathing right now? If it's all chest — you're tense. Shift it low. That's your first rep.`,
    zone: "EmoDojo zone"
  },
  pause: {
    skill: "PAUSE",
    sub: "recognition and response",
    color: "#E74C3C",
    body: `What it does: Teleport + forcefield. Stops incoming attacks. Gives you time to think.\n\nIn Rage Fighters: When enemies are about to hit and you need 2 seconds. The teleport moves you out of danger, the forcefield keeps you from getting buried.\n\nIn life: Pause is the INSTANT you feel yourself about to react. Count to three. Walk to another room. Put the phone down. You're not ignoring the problem — you're making sure you don't make it worse.\n\nRemember: Pause isn't avoidance. It's choosing your moment instead of just reacting.`,
    zone: "Rage Storm zone"
  },
  chill: {
    skill: "CHILL",
    sub: "the hot brain fix",
    color: "#2980B9",
    body: `What it does: Sends out a freeze field. Slows every enemy in range. Gives YOU a speed boost at the same time.\n\nIn Rage Fighters: Use it when enemies are swarming. Deploy EARLY — before the swarm builds, not after you're buried.\n\nIn life: When you're angry, your brain runs HOT — and a hot brain can't think straight. Put something cold on your body. Ice cube. Cold water on your wrists. Your body temperature actually affects your emotional temperature.\n\nFind your cool down spot BEFORE you need it. The best move is leaving before you blow up, not after.`,
    zone: "Toxic zone"
  },
  connect: {
    skill: "CONNECT",
    sub: "call for backup",
    color: "#27AE60",
    body: `What it does: Calls in support. Some fights can't be won solo.\n\nIn Rage Fighters: Boss fights are designed for co-op. If you keep dying solo, it's not a skill issue — it's a design issue. You NEED backup.\n\nIn life: Some problems are too big to handle alone. That's not weakness — it's awareness. Asking for help is a skill. And sometimes just having someone THERE makes the fight easier.\n\nAt GridGuide level: You're not just calling for help — you're becoming someone others can call. The grid flows both ways.`,
    zone: "any zone"
  }
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
  {q:"Shadow Samurai drains your energy slowly if you ignore him. What skill cracks his armor?",o:["PAUSE","BREATHE","CHILL","RELEASE"],c:1,d:"Easy",s:["cg"]},
  {q:"I learned you can't beat your shadow side by pretending it doesn't exist. What happens if you try?",o:["It disappears","It gets STRONGER","It becomes your friend","Nothing"],c:1,d:"Medium",s:["cg"]},
  {q:"The Tilt Shogun carries heads on his arm — trophies from everyone who lost control. What does he feed on?",o:["Health potions","Your anger and tilt","Your teammates","Coins"],c:1,d:"Easy",s:["cg","any"]},
  {q:"You CANNOT button-mash the Tilt Shogun. What combo do you need?",o:["BREATHE + RELEASE","PAUSE + CHILL + CONNECT","Just PAUSE","Attack harder"],c:1,d:"Medium",s:["cg"]},
  {q:"The Tilt Shogun teaches the hardest lesson. What is it?",o:["Fight harder to win","Sometimes the bravest move is to stop fighting","Never ask for help","Anger makes you stronger"],c:1,d:"Medium",s:["cg"]},
  {q:"Triggers aren't just thoughts — they're tied to REAL events. What makes them hit harder than Mind Ninjas?",o:["They're bigger","They're connected to real stuff happening TO you","They have more HP","They fly"],c:1,d:"Medium",s:["paper"]},
  {q:"I designed Trigger Swarm to stack. When should you PAUSE?",o:["After the first hit","After hit 3 or 4 — before the snowball builds","Only at the end","Never, just fight through"],c:1,d:"Easy",s:["paper"]},
  {q:"When you blow up over something small, what's really happening?",o:["You're being dramatic","The thing that set you off is the LAST thing, not THE thing","You need sleep","You lost the game"],c:1,d:"Medium",s:["paper"]},
  {q:"Flashpoints telegraph their attacks — you can SEE them coming. How long before detonation?",o:["10 seconds","5 seconds","2 seconds","30 seconds"],c:2,d:"Easy",s:["paper","any"]},
  {q:"A Flashpoint hits different because of YOUR history. What's the real question to ask?",o:["Why am I so upset?","What does this REMIND me of?","Who did this to me?","How do I win?"],c:1,d:"Medium",s:["paper"]},
  {q:"What skill do you use when you see a Flashpoint charging?",o:["CHILL","CONNECT","BREATHE","PAUSE"],c:3,d:"Easy",s:["paper"]},
  {q:"The Meltdown Boss has three phases. In which phase is your ONLY real window to win?",o:["Phase 2 — Inferno","Phase 3 — Burnout","Phase 1 — Ignition","All phases equally"],c:2,d:"Easy",s:["paper","any"]},
  {q:"Phase 2 of the Meltdown: your skills are LOCKED. What's the only move?",o:["Attack harder","Just survive — don't make it worse","Use all skills at once","Quit the fight"],c:1,d:"Medium",s:["paper"]},
  {q:"Phase 3 Burnout: the rage crashes and shame shows up. What skill finishes the fight?",o:["PAUSE","BREATHE","CHILL","CONNECT — you can't finish solo"],c:3,d:"Medium",s:["paper","soft"]},
  {q:"The Critics have thumbs-down on their chests and never stop. What are they IRL?",o:["Teachers","Everyone's opinions and social media voices","Your parents","Game moderators"],c:1,d:"Easy",s:["toy","sticky","any"]},
  {q:"Your brain treats social rejection like actual survival-level danger. What's the forcefield?",o:["Fighting back online","Turning off the phone","Posting more","Getting more followers"],c:1,d:"Medium",s:["toy","sticky"]},
  {q:"One genuine person saying 'you're good' is worth more than...",o:["One hundred likes","A thousand online opinions","A viral post","All of the above"],c:1,d:"Easy",s:["toy","sticky"]},
  {q:"Exposure Beams don't attack directly. They just WATCH. What do they represent?",o:["Security cameras","The feeling that everyone's watching you fail","Flashlights","Laser weapons"],c:1,d:"Easy",s:["toy","sticky","any"]},
  {q:"Exposure Beams can't lock onto you when you're...",o:["Running fast","Invisible","In a group — they scatter in formation","Standing still"],c:2,d:"Medium",s:["toy","sticky"]},
  {q:"The counter-move to Exposure Beams is choosing to be seen by someone safe. That's the difference between...",o:["A spotlight and a stage light","A flashlight and a torch","Day and night","Winning and losing"],c:0,d:"Hard",s:["toy","sticky"]},
  {q:"Inner Turmoil is the final boss. He's built from everything harsh you've ever been told. What is he?",o:["An external enemy","Your inner critic — toxic shame","A computer virus","Another player"],c:1,d:"Easy",s:["soft","toy","any"]},
  {q:"You can turn off your phone to escape The Critics. But Inner Turmoil?",o:["Also turns off","He IS your voice — you can't outrun yourself","Goes away with sleep","Only appears online"],c:1,d:"Medium",s:["soft","toy"]},
  {q:"Phase 2 of Inner Turmoil locks you down. What breaks you free?",o:["PAUSE only","CHILL for physical reset + CONNECT — call your team","Just wait it out","Attack harder"],c:1,d:"Hard",s:["soft"]},
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
    flat.breathe_mastery  = sessionData.battle.breathe_mastery  ?? "";
    flat.pause_mastery    = sessionData.battle.pause_mastery    ?? "";
    flat.chill_mastery    = sessionData.battle.chill_mastery    ?? "";
    flat.connect_mastery  = sessionData.battle.connect_mastery  ?? "";
  }
  return flat;
}

async function sendToCollect(sessionData: any, collectSecret: string) {
  console.log('sendToCollect called — secret present:', !!collectSecret, '— posting to /api/collect');
  if (!collectSecret) {
    console.warn('sendToCollect: no collectSecret, skipping POST');
    return;
  }
  try {
    const res = await fetch('/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectSecret}`,
      },
      body: JSON.stringify(flattenSession(sessionData)),
    });
    const body = await res.text();
    console.log('sendToCollect response status:', res.status, body);
  } catch(e) {
    console.error('sendToCollect fetch error:', e);
  }
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
  "##sstttYtstss-RR...#",
  "####tttttttss-RR...#",
  "#..#tss3#tt.#p######",
  "#.#sstss#####LTTLp##",
  "#.ssYtY###ppppLppp##",
  "#.sssts#.LLppppppL##",
  "#.##tYY#.#ppLLppppp#",
  "#...#t-#.#L.L2ppppp#",
  "#....#-...pppppppL##",
  "#.....-..#LppppLp#.#",
  "###...-..#ppp-pL##.#",
  "#...---######-p###.#",
  "#RRRcRRRRR...-##.T.#",
  "#RccccccRRRTRcRTR..#",
  "#RcKccccccccccccR..#",
  "#RcccccKcRKKKKKKR.T#",
  "#RcccccccRKKKKKKR..#",
  "#RcKccKcccccccccR..#",
  "#Rcc1cccccccccccc..#",
  "#RccccccRRKKKKKKR..#",
  "#RccKccKRRKKKKKKR.T#",
  "#RRRRcRRRRccccccR..#",
  "#T...-...RRRRRcRRT.#",
  "#T...------...-....#",
  "#TT#T#T#T#-T#T-#T#T#",
  "#T#T#T#T#T-#T#-T#TT#",
  "#.........-----....#",
  "#.........-........#",
  "#.........B........#",
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
const WALKABLE = new Set([".", "-", "c", "p", "t", "s", "N", "d", "B", "L", "T", "K", "Y", "1", "2", "3", "4", "5"]);

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
  const [showParty, setShowParty] = useState<string | boolean>(false);
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
  const [followUpInput, setFollowUpInput] = useState("");
  const [surveyComplete, setSurveyComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [recentLoss, setRecentLoss] = useState<{id: string; step: number} | null>(null);
  const [skillCorrects, setSkillCorrects] = useState<Record<string,number>>({breathe:0,pause:0,chill:0,connect:0});
  const [notebookUnlocked, setNotebookUnlocked] = useState<Record<string,boolean>>({breathe:false,pause:false,chill:false,connect:false});
  const [showNotebook, setShowNotebook] = useState<string | null>(null);
  const [usedSkillQs, setUsedSkillQs] = useState(new Set<number>());
  const [isSkillEncounter, setIsSkillEncounter] = useState(false);
  const [consecutiveGameFails, setConsecutiveGameFails] = useState(0);
  const [showGameRedirect, setShowGameRedirect] = useState(false);

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

  const getSkillQuestion = () => {
    const avail = SKILL_QUESTIONS.filter((_, i) => !usedSkillQs.has(i));
    if (avail.length === 0) { setUsedSkillQs(new Set()); return SKILL_QUESTIONS[Math.floor(Math.random() * SKILL_QUESTIONS.length)]; }
    const pick = avail[Math.floor(Math.random() * avail.length)];
    setUsedSkillQs(prev => new Set([...prev, SKILL_QUESTIONS.indexOf(pick)]));
    return pick;
  };

  const handleSkillAnswer = (q: any, correct: boolean) => {
    if (correct && q.skill) {
      const sk: string = q.skill;
      const newCorrects: Record<string,number> = {...skillCorrects, [sk]: (skillCorrects[sk]||0) + 1};
      setSkillCorrects(newCorrects);
      if (newCorrects[sk] >= 3 && !notebookUnlocked[sk]) {
        setNotebookUnlocked((prev: Record<string,boolean>) => ({...prev, [sk]: true}));
        setTimeout(() => setShowNotebook(sk), 600);
      }
    }
  };

  const getQuestion = (stan: any) => {
    // Arc mode ALWAYS takes priority — never serve skill questions during a Stan spar
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
    if (isSkillEncounter) return getSkillQuestion();
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

  const startEncounter = (stan: any, isArc = false, isSkill = false) => {
    if (overworldLoop) overworldLoop.stop();
    playSfx("encounter");
    setCurStan(stan);
    setHp(100);
    setQIdx(0);
    setCorrectCount(0);
    setArcMode(isArc);
    if (isArc) setIsSkillEncounter(false);
    const qs = isArc ? (STAN_ARC[stan.id]?.questions.length || 3) : isSkill ? 1 : numQsForEncounter(stan);
    setTotalQs(qs);
    const skillIntros: Record<string,string> = {
      cg: "Hey — quick check. You know this stuff?",
      paper: "Hold up. Let me test something real fast.",
      toy: "Stop. Quick question. Don't overthink it.",
      sticky: "Oh. You again. Prove you've been paying attention.",
      soft: "Before you go. One thing."
    };
    setBattleState("intro");
    setDialogue(isSkill && !isArc ? (skillIntros[stan.id] || "Quick check.") : stan.intro);
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
      // Reset game fail counter on correct answer
      setConsecutiveGameFails(0);
    } else {
      const dmg = curQ.d === "Easy" ? 20 : curQ.d === "Medium" ? 25 : 30;
      setHp(h => Math.max(0, h - dmg));
      setFlash("wrong"); playSfx("wrong");
      // Track consecutive game question failures
      const isGameQ = curQ.s && !curQ.s.includes("film");
      if (isGameQ) {
        const newFails = consecutiveGameFails + 1;
        setConsecutiveGameFails(newFails);
        if (newFails >= 3) {
          setTimeout(() => setShowGameRedirect(true), 1600);
          setConsecutiveGameFails(0);
        }
      }
    }
    setTimeout(() => setFlash(null), 400);
    const nextQIdx = qIdx + 1;
    setQIdx(nextQIdx);
    const newHp = correct ? hp : Math.max(0, hp - (curQ.d === "Easy" ? 20 : curQ.d === "Medium" ? 25 : 30));

    setTimeout(async () => {
      if (newHp <= 0) {
        if (battleLoop) battleLoop.stop();
        setBattleState("result"); setDialogue(curStan.escape); playSfx("escape"); setRecentLoss({id: curStan.id, step: stepCount}); return;
      }
      if (nextQIdx >= totalQs) {
        if (battleLoop) battleLoop.stop();
        setBattleState("result");
        if (isSkillEncounter) {
          if (correct && curQ.skill) handleSkillAnswer(curQ, true);
          setIsSkillEncounter(false);
          const winLines = [
            "Learned fighter. You've been paying attention.",
            "That's it. That's exactly it. Keep moving.",
            "You got it. Aaron would be proud.",
            "Solid. You actually know this stuff.",
            "That's the one. Learned fighter."
          ];
          const lossLines = [
            "Get back in there. The Senseis tell you everything — listen closer. Aaron's notebook pages are floating all around, full of intel. Don't skip them.",
            "You probably need to play with your eyes and ears open. The Senseis drop every clue you need. The notebook pages have the answers — find them.",
            "That one's in Aaron's notebook. They're everywhere out there — glowing, floating. The Senseis spell it out too if you're listening.",
          ];
          const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
          setDialogue(correct ? pickRandom(winLines) : pickRandom(lossLines));
          return;
        }
        if (newCorrectCount === totalQs) {
          setDialogue(curStan.defeat); setParty(p => [...p, curStan]); playSfx("capture");
        } else {
          playSfx("escape");
          setDialogue(curStan.name === "Soft Stan" ? "...you tried. But you don't really know me yet. Come find me again." : curStan.name === "Paper Stan" ? "Close. But close isn't enough. You gotta KNOW me to catch me. Try again." : curStan.name === "Toy Stan" ? "Almost. But 'almost' is the story of Aaron's life, isn't it? Come back when you've done your homework." : curStan.name === "CG Stan" ? "So close! But not quite! You missed some stuff! Come back! Try again!" : "You noticed some things. But not everything. Look closer next time.");
          setRecentLoss({id: curStan.id, step: stepCount});
        }
        return;
      }
      setBattleState("between");
      // Film redirect if Q1 missed in arc mode
      if (!correct && arcMode && qIdx === 0 && STAN_ARC[curStan.id as string]) {
        const stanKey: string = curStan.id;
        const newFails: Record<string,number> = {...failCounts, [stanKey]: (failCounts[stanKey]||0) + 1};
        setFailCounts(newFails);
        if (newFails[stanKey] >= 1) {
          setTimeout(() => setShowRedirect(STAN_ARC[stanKey].redirect), 1400);
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
    if (zoneStanId && Math.random() < 0.15) {
      const stan = STANS[zoneStanId];
      const onCooldown = recentLoss != null && recentLoss.id === stan.id && (stepCount - recentLoss.step) < 20;
      if (!onCooldown && !party.find((p: any) => p.id === stan.id)) {
        setIsSkillEncounter(true);
        setTimeout(() => startEncounter(stan, false, true), 200);
      }
    }
  }, [screen, pos, party, stepCount, arcMode, failCounts, recentLoss]);

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
        battle: { battle_score: score, stans_captured: party.length, lore_correct: loreCorrectTotal, lore_total: loreTotalAsked, breathe_mastery: Math.round(((skillCorrects.breathe||0)/5)*100)+"%", pause_mastery: Math.round(((skillCorrects.pause||0)/5)*100)+"%", chill_mastery: Math.round(((skillCorrects.chill||0)/5)*100)+"%", connect_mastery: Math.round(((skillCorrects.connect||0)/5)*100)+"%" }
      };
      const sessions = loadSessions();
      sessions.push(sessionData);
      saveSessions(sessions);
      sendToCollect(sessionData, collectSecret);
      setTimeout(() => setScreen("win"), 500);
    }
  }, [party, screen]);

  // Returns the inline follow-up text question if one immediately follows the current question
  const getInlineFollowUp = (currentIdx: number, answers: Record<string, any>) => {
    const nextIdx = findNextValidIdx(currentIdx + 1, answers);
    if (nextIdx < 0) return null;
    const next = SURVEY_QUESTIONS[nextIdx];
    return next.type === "text" ? { q: next, idx: nextIdx } : null;
  };

  const advanceSurvey = (newAnswers: Record<string, any>, skipCount: number) => {
    try {
      localStorage.setItem("rf_sketchbook_partial", JSON.stringify({ timestamp: new Date().toISOString(), survey: newAnswers }));
    } catch(e) {}
    const nextIdx = findNextValidIdx(surveyIdx + skipCount, newAnswers);
    if (nextIdx === -1) {
      setSurveyComplete(true);
      if (journalLoop) journalLoop.stop();
      playSfx("capture");
    } else {
      setSurveyIdx(nextIdx);
      playSfx("page");
    }
  };

  const handleSurveyNext = () => {
    const q = currentSurveyQ();
    if (!q) return;
    const val = surveyInput;
    if (q.required && (!val || val === "")) return;

    let newAnswers = { ...surveyAnswers, [q.id]: val };
    const inlineFollowUp = q.type !== "text" ? getInlineFollowUp(surveyIdx, newAnswers) : null;
    if (inlineFollowUp) {
      newAnswers = { ...newAnswers, [inlineFollowUp.q.id]: followUpInput || "(skipped)" };
      setSurveyAnswers(newAnswers);
      setSurveyInput(""); setFollowUpInput("");
      advanceSurvey(newAnswers, inlineFollowUp.idx - surveyIdx + 1);
    } else {
      setSurveyAnswers(newAnswers);
      setSurveyInput(""); setFollowUpInput("");
      advanceSurvey(newAnswers, 1);
    }
  };

  const handleSurveySkip = () => {
    const q = currentSurveyQ();
    if (!q || q.required) return;
    let newAnswers = { ...surveyAnswers, [q.id]: "(skipped)" };
    const inlineFollowUp = q.type !== "text" ? getInlineFollowUp(surveyIdx, newAnswers) : null;
    if (inlineFollowUp) {
      newAnswers = { ...newAnswers, [inlineFollowUp.q.id]: followUpInput || "(skipped)" };
      setSurveyAnswers(newAnswers);
      setSurveyInput(""); setFollowUpInput("");
      advanceSurvey(newAnswers, inlineFollowUp.idx - surveyIdx + 1);
    } else {
      setSurveyAnswers(newAnswers);
      setSurveyInput(""); setFollowUpInput("");
      advanceSurvey(newAnswers, 1);
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
                <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,background:"#F5C518",color:"#1a1a2e",padding:"2px 8px",borderRadius:3,transform:"rotate(-1deg)",display:"inline-block"}}>CHILL</span>
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
              <button onClick={() => {
                const sessions = loadSessions();
                sessions.push({timestamp:new Date().toISOString(),survey:surveyAnswers,battle:{battle_score:0,stans_captured:0,lore_correct:0,lore_total:0,breathe_mastery:"0%",pause_mastery:"0%",chill_mastery:"0%",connect_mastery:"0%"}});
                saveSessions(sessions);
                sendToCollect({timestamp:new Date().toISOString(),survey:surveyAnswers,battle:{battle_score:0,stans_captured:0,lore_correct:0,lore_total:0,breathe_mastery:"0%",pause_mastery:"0%",chill_mastery:"0%",connect_mastery:"0%"}},collectSecret);
                if (journalLoop) journalLoop.stop(); createOverworldMusic().start(); setShowIntro(true); setScreen("overworld"); playSfx("select");
              }}
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
              {/* Inline follow-up text question */}
              {q.type !== "text" && (() => {
                const fu = getInlineFollowUp(surveyIdx, surveyAnswers);
                if (!fu) return null;
                return (
                  <div style={{background:"#f9f9f9",border:"2px solid #ddd",padding:14,marginBottom:12,borderLeft:"4px solid #E63946"}}>
                    <div style={{fontFamily:"'Indie Flower',cursive",fontSize:16,color:"#333",marginBottom:8,lineHeight:1.4}}>{fu.q.q}</div>
                    <textarea value={followUpInput} onChange={(e: any) => setFollowUpInput(e.target.value)}
                      placeholder={fu.q.placeholder || "Your answer"} rows={2}
                      style={{width:"100%",padding:"8px 10px",border:"2px solid #ddd",fontFamily:"'Indie Flower',cursive",fontSize:16,outline:"none",resize:"none",background:"#fff",color:"#111",lineHeight:1.5}} />
                  </div>
                );
              })()}
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
        {/* Battle header — Stan name dominant */}
        <div style={{background:curStan.color,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Bangers',cursive",fontSize:28,color:"#fff",letterSpacing:3,textShadow:"2px 2px 0 rgba(0,0,0,0.3)"}}>{curStan.name}</div>
          <div style={{fontFamily:"'Indie Flower',cursive",fontSize:12,color:"rgba(255,255,255,0.8)"}}>Q {qIdx+1}/{totalQs} • Score: {score}</div>
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
            // Skill encounter — lightweight result
            if (!captured && !knockedOut && !arcMode) {
              const wasCorrect = dialogue.includes("fighter") || dialogue.includes("paid") || dialogue.includes("proud") || dialogue.includes("Solid") || dialogue.includes("exactly");
              return (
                <div>
                  <div style={{background:"#faf6ee",border:`3px solid ${wasCorrect?"#27AE60":"#E67E22"}`,borderRadius:4,padding:16,marginBottom:12,textAlign:"center"}}>
                    {wasCorrect && <div style={{fontFamily:"'Bangers',cursive",fontSize:18,color:"#27AE60",letterSpacing:2,marginBottom:8}}>LEARNED FIGHTER ✓</div>}
                    {!wasCorrect && <div style={{fontFamily:"'Bangers',cursive",fontSize:16,color:"#E67E22",letterSpacing:1,marginBottom:8}}>NOT QUITE</div>}
                    <div style={{fontFamily:"'Indie Flower',cursive",fontSize:15,color:"#111",lineHeight:1.6,fontStyle:"italic"}}>{dialogue}</div>
                  </div>
                  <button onClick={() => { setScreen("overworld"); createOverworldMusic().start(); playSfx("select"); }}
                    style={{width:"100%",padding:"12px",fontFamily:"'Bangers',cursive",fontSize:20,letterSpacing:2,background:"#111",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",boxShadow:"3px 3px 0 #000"}}>
                    KEEP MOVING ▶
                  </button>
                </div>
              );
            }
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
      <div style={{background:"#111",padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #333"}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {[
            {id:"cg",   label:"CG",     color:"#0d7a88"},
            {id:"paper",label:"PAPER",  color:"#C0202C"},
            {id:"toy",  label:"TOY",    color:"#C05A10"},
            {id:"sticky",label:"STICKY",color:"#1A8040"},
            {id:"soft", label:"SOFT",   color:"#1A5A90"},
          ].map(s => {
            const captured = party.find((p: any) => p.id === s.id);
            return (
              <div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{
                  width:46,height:46,borderRadius:"50%",
                  border:`3px solid ${captured ? s.color : "#333"}`,
                  boxShadow: captured ? `0 0 10px ${s.color}, 0 0 20px ${s.color}44` : "none",
                  background: captured ? s.color : "#1a1a1a",
                  overflow:"hidden",
                  position:"relative",
                  transition:"all 0.4s ease",
                  display:"flex",alignItems:"flex-start",justifyContent:"center"
                }}>
                  {captured ? (
                    <div style={{
                      position:"absolute",
                      top:-2,left:"50%",
                      transform:"translateX(-50%)",
                      filter:`drop-shadow(0 0 3px ${s.color})`
                    }}>
                      <StanSprite stanId={s.id} scale={0.85} />
                    </div>
                  ) : (
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bangers',cursive",fontSize:22,color:"#333"}}>?</div>
                  )}
                </div>
                <div style={{fontFamily:"'Bangers',cursive",fontSize:9,letterSpacing:0.5,color:captured?s.color:"#444",transition:"color 0.4s"}}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <button onClick={() => setShowQuit(true)} style={{fontFamily:"'Bangers',cursive",fontSize:14,color:"#E63946",background:"transparent",border:"none",cursor:"pointer",letterSpacing:1}}>QUIT</button>
          <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#555"}}>Score: {score}</div>
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
                <div key={`${vx}-${vy}`} style={{width:TILE_SIZE,height:TILE_SIZE,background:tc.bg,border:`1px solid ${tc.border}`,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,overflow:"hidden",boxSizing:"border-box"}}>
                  {tile==="#" && <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(135deg,#1a1a2e 0px,#1a1a2e 5px,#252540 5px,#252540 10px)"}} />}
                  {tile==="." && <div style={{position:"absolute",inset:0,background:"#4a8a28"}} />}
                  {tile==="-" && <><div style={{position:"absolute",inset:0,background:"#D4B896"}} />{(vx+vy)%3===0&&<div style={{position:"absolute",inset:0,background:"rgba(139,104,60,0.15)"}} />}</>}
                  {tile==="R" && <><div style={{position:"absolute",inset:0,background:"#7A1010"}} /><div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,rgba(0,0,0,0.3) 0px,rgba(0,0,0,0.3) 1px,transparent 1px,transparent 7px),repeating-linear-gradient(90deg,rgba(0,0,0,0.2) 0px,rgba(0,0,0,0.2) 1px,transparent 1px,transparent 14px)"}} /></>}
                  {tile==="c" && <><div style={{position:"absolute",inset:0,background:"#C49020"}} /><div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(90deg,rgba(92,61,10,0.12) 0px,rgba(92,61,10,0.12) 1px,transparent 1px,transparent 14px),repeating-linear-gradient(0deg,rgba(92,61,10,0.12) 0px,rgba(92,61,10,0.12) 1px,transparent 1px,transparent 14px)"}} />{!party.find((p:any)=>p.id==="cg")&&(vx+vy)%4===0&&<div style={{position:"absolute",top:1,right:2,fontSize:7,color:"#5C3D0A",fontWeight:"bold",animation:"sparkle 2s ease-in-out infinite",animationDelay:`${(vx*0.4)%2}s`}}>✦</div>}</>}
                  {tile==="p" && <><div style={{position:"absolute",inset:0,background:"#E8E8E8"}} /><div style={{position:"absolute",inset:0,borderRight:"1px solid rgba(230,57,70,0.45)",borderBottom:"1px solid rgba(230,57,70,0.45)"}} />{!party.find((p:any)=>p.id==="paper")&&(vx+vy)%4===0&&<div style={{position:"absolute",top:1,right:2,fontSize:7,color:"#E63946",fontWeight:"bold",animation:"sparkle 2s ease-in-out infinite",animationDelay:`${(vx*0.3)%2}s`}}>✦</div>}</>}
                  {tile==="t" && <><div style={{position:"absolute",inset:0,background:"#3D1080"}} />{(vx+vy)%4===0&&<div style={{position:"absolute",top:1,right:2,fontSize:7,color:"#F5C518",fontWeight:"bold",animation:"sparkle 2s ease-in-out infinite",animationDelay:`${(vx*0.5)%2}s`}}>✦</div>}</>}
                  {tile==="s" && <><div style={{position:"absolute",inset:0,background:"#1E0A50"}} />{(vx+vy)%4===0&&<div style={{position:"absolute",top:1,right:2,fontSize:7,color:"#FBBF24",fontWeight:"bold",animation:"sparkle 2s ease-in-out infinite",animationDelay:`${(vx*0.35)%2}s`}}>✦</div>}</>}
                  {tile==="Y" && <><div style={{position:"absolute",inset:0,background:"#2a1500"}} /><div style={{position:"absolute",top:4,left:4,right:4,bottom:4,background:"#F5C518",borderRadius:1}} /></>}
                  {tile==="T" && <><div style={{position:"absolute",inset:0,background:"#0d3010"}} /><div style={{position:"absolute",top:2,left:3,right:3,bottom:3,background:"#1B4E20",borderRadius:2}} /><div style={{position:"absolute",top:3,left:4,right:4,bottom:4,background:"#2E7D32",borderRadius:2}} /></>}
                  {tile==="K" && <><div style={{position:"absolute",inset:0,background:"#4a0d26"}} /><div style={{position:"absolute",top:2,left:3,right:3,bottom:3,background:"#8B1A4A",borderRadius:3}} /><div style={{position:"absolute",top:3,left:4,right:4,bottom:4,background:"#F48FB1",borderRadius:3,opacity:0.7}} /></>}
                  {tile==="L" && <><div style={{position:"absolute",inset:0,background:"#E8E8E8"}} /><div style={{position:"absolute",top:0,left:"30%",width:4,bottom:2,backgroundImage:"repeating-linear-gradient(180deg,#E63946 0px,#E63946 3px,#F0F0F0 3px,#F0F0F0 6px)"}} /><div style={{position:"absolute",top:1,left:1,right:1,height:8,background:"#E63946",borderRadius:"50% 50% 0 0",opacity:0.9}} /></>}
                  {tile==="N" && (() => { const e=party.find((p:any)=>p.id==="soft"); return <><div style={{position:"absolute",inset:0,background:"#060620"}} /><div style={{fontSize:14,animation:e?"none":"grassPulse 1.5s ease-in-out infinite",opacity:e?0.3:1,position:"relative",zIndex:2}}>🧸</div></>; })()}
                  {(tile==="B"||tile==="d") && <div style={{width:"100%",height:"100%",background:"#8B6F47",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🚪</div>}
                  {OBJECT_STANS[tile]&&tile!=="N" && (() => {
                    const sid = OBJECT_STANS[tile];
                    const earned = party.find((p: any) => p.id === sid);
                    const icons: Record<string,string> = {"1":"💻","2":"📓","3":"🗿","4":"📱","5":"🧸"};
                    return <div style={{fontSize:16,opacity:earned?0.25:1,animation:earned?"none":"grassPulse 1.8s ease-in-out infinite",position:"relative",zIndex:2}}>{icons[tile]}</div>;
                  })()}
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
      <div style={{background:"#111",padding:"5px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#555"}}>find all 5 Stans to win</span>
        <button onClick={() => setShowParty('notebook')}
          style={{display:"flex",alignItems:"center",gap:6,fontFamily:"'Bangers',cursive",fontSize:14,letterSpacing:1,
            background:Object.values(notebookUnlocked).some(Boolean)?"#c0392b":"#222",
            color:Object.values(notebookUnlocked).some(Boolean)?"#fff":"#555",
            border:`2px solid ${Object.values(notebookUnlocked).some(Boolean)?"#c0392b":"#444"}`,
            borderRadius:4,padding:"3px 10px",cursor:"pointer",transition:"all 0.3s"}}>
          📓 NOTEBOOK {Object.values(notebookUnlocked).filter(Boolean).length > 0 && <span style={{background:"#F5C518",color:"#111",borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{Object.values(notebookUnlocked).filter(Boolean).length}</span>}
        </button>
      </div>

      {showParty && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={() => setShowParty(false)}>
          <div style={{background:"#fff",border:"4px solid #F5C518",borderRadius:0,padding:0,maxWidth:400,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:"6px 6px 0 #111"}} onClick={(e: any) => e.stopPropagation()}>
            <div style={{background:"#111",padding:"12px 20px",borderBottom:"4px solid #E63946"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:22,color:"#F5C518",letterSpacing:3,textAlign:"center"}}>YOUR CORNER ({party.length}/5)</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
                <button onClick={() => setShowParty('stans')} style={{fontFamily:"'Bangers',cursive",fontSize:13,letterSpacing:1,padding:"4px 12px",background:showParty==='notebook'?"transparent":"#F5C518",color:showParty==='notebook'?"#888":"#111",border:"2px solid #F5C518",cursor:"pointer"}}>STANS</button>
                <button onClick={() => setShowParty('notebook')} style={{fontFamily:"'Bangers',cursive",fontSize:13,letterSpacing:1,padding:"4px 12px",background:showParty==='notebook'?"#c0392b":"transparent",color:showParty==='notebook'?"#fff":"#888",border:"2px solid #c0392b",cursor:"pointer"}}>NOTEBOOK {Object.values(notebookUnlocked).filter(Boolean).length}/4</button>
              </div>
            </div>
            <div style={{padding:16}}>
              {showParty !== 'notebook' && <>
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
              </>}
              {showParty === 'notebook' && <div>
                <div style={{fontFamily:"'Indie Flower',cursive",fontSize:12,color:"#888",textAlign:"center",marginBottom:12,fontStyle:"italic"}}>Answer skill questions to unlock Aaron's intel pages</div>
                {['breathe','pause','chill','connect'].map(skill => {
                  const page = NOTEBOOK_PAGES[skill];
                  const unlocked = notebookUnlocked[skill];
                  const correct = skillCorrects[skill] || 0;
                  const mastery = Math.round((correct / 5) * 100);
                  const icon = SKILL_ICONS[skill];
                  return (
                    <div key={skill} style={{marginBottom:12,background:"#faf6ee",border:`2px solid ${unlocked ? page.color : '#ccc'}`,borderRadius:4,padding:"10px 12px",display:"flex",alignItems:"center",gap:12,cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.7}}
                      onClick={() => unlocked && setShowNotebook(skill)}>
                      {/* Skill icon */}
                      <div style={{width:52,height:52,borderRadius:"50%",background:unlocked?page.color:"#ddd",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",border:`2px solid ${unlocked?page.color:"#ccc"}`}}>
                        {icon ? <img src={icon} style={{width:44,height:44,objectFit:"contain"}} alt={skill} /> : <span style={{fontSize:20}}>?</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Bangers',cursive",fontSize:18,color:unlocked?"#c0392b":"#999",letterSpacing:1}}>{page.skill}</div>
                        <div style={{fontFamily:"'Indie Flower',cursive",fontSize:11,color:"#888",fontStyle:"italic",marginBottom:4}}>{page.sub}</div>
                        {/* Mastery bar */}
                        <div style={{background:"#e0d8c8",height:6,borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${Math.min(mastery,100)}%`,height:"100%",background:unlocked?page.color:"#bbb",transition:"width 0.4s",borderRadius:3}} />
                        </div>
                        <div style={{fontFamily:"'Indie Flower',cursive",fontSize:10,color:unlocked?page.color:"#aaa",marginTop:2}}>
                          {unlocked ? `${mastery}% mastery — tap to read →` : `${correct}/3 to unlock`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>}
              <button onClick={() => setShowParty(false)} style={{width:"100%",marginTop:12,padding:"12px",fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:2,background:"#111",color:"#F5C518",border:"none",cursor:"pointer",boxShadow:"3px 3px 0 #E63946"}}>CLOSE [P]</button>
            </div>
          </div>
        </div>
      )}

      {showIntro && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={() => setShowIntro(false)}>
          <div style={{background:"#fff",border:"4px solid #F5C518",maxWidth:340,width:"100%",boxShadow:"6px 6px 0 #111",overflow:"hidden",animation:"popIn 0.3s ease-out"}}>
            <div style={{background:"#111",padding:"10px 18px"}}>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:18,color:"#F5C518",letterSpacing:3}}>AARON SAYS</div>
            </div>
            <div style={{padding:"18px 20px"}}>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:18,color:"#111",lineHeight:1.6,marginBottom:12}}>
                Okay. Journal's done.<br/><br/>
                Now find your Stans — they're hiding in the zones. Walk into the colored areas to find them. The numbered icons are where they live.<br/><br/>
                Collect all 5 to complete your crew.
              </div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:14,color:"#888",textAlign:"right",marginBottom:16}}>— Aaron</div>
              <div style={{background:"#F5C518",padding:"10px 14px",textAlign:"center",fontFamily:"'Bangers',cursive",fontSize:16,letterSpacing:2,color:"#111",cursor:"pointer"}}>
                TAP ANYWHERE TO START
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotebook && NOTEBOOK_PAGES[showNotebook] && (() => {
        const page = NOTEBOOK_PAGES[showNotebook];
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div style={{background:"#faf6ee",borderRadius:4,padding:"24px 24px 28px 48px",maxWidth:360,width:"100%",position:"relative",boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
              <div style={{position:"absolute",inset:0,borderRadius:4,overflow:"hidden",pointerEvents:"none"}}>
                <div style={{position:"absolute",left:36,top:0,bottom:0,width:1,background:"rgba(220,120,120,0.4)"}} />
                {[60,88,116,144,172,200,228,256,284,312,340].map(y => (
                  <div key={y} style={{position:"absolute",left:0,right:0,top:y,height:1,background:"rgba(170,195,220,0.35)"}} />
                ))}
              </div>
              {[60,160,260].map(top => (
                <div key={top} style={{position:"absolute",left:12,top,width:14,height:14,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"0.5px solid #c4b48a"}} />
              ))}
              <div style={{display:"inline-block",background:page.color,color:"#faf6ee",fontFamily:"'Bangers',cursive",fontSize:12,letterSpacing:2,padding:"2px 10px",borderRadius:2,marginBottom:12}}>PAGE UNLOCKED</div>
              <div style={{fontFamily:"'Bangers',cursive",fontSize:24,color:"#c0392b",letterSpacing:2,marginBottom:2}}>{page.skill}</div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:13,color:"#999",marginBottom:14,fontStyle:"italic"}}>{page.sub}</div>
              <div style={{fontFamily:"'Indie Flower',cursive",fontSize:14,color:"#2a1f0e",lineHeight:1.8,whiteSpace:"pre-line"}}>{page.body}</div>
              <div style={{marginTop:14,paddingTop:10,borderTop:"1px dashed #c4b48a",fontFamily:"'Indie Flower',cursive",fontSize:12,color:"#aaa",fontStyle:"italic"}}>found in: {page.zone}</div>
              <button onClick={() => setShowNotebook(null)}
                style={{marginTop:16,width:"100%",padding:"10px",fontFamily:"'Bangers',cursive",fontSize:16,letterSpacing:2,background:"#2a1f0e",color:"#faf6ee",border:"none",borderRadius:4,cursor:"pointer"}}>
                BACK TO THE MAP ▶
              </button>
            </div>
          </div>
        );
      })()}

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

      {/* Game redirect overlay — fires after 3 consecutive game question fails */}
      {showGameRedirect && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#1a1a2e",border:"3px solid #E67E22",borderRadius:12,padding:24,maxWidth:360,width:"100%",textAlign:"center"}}>
            <div style={{fontFamily:"'Bangers',cursive",fontSize:13,color:"#E67E22",letterSpacing:3,marginBottom:12}}>HAVING TROUBLE WITH THE GAME QUESTIONS?</div>
            <div style={{fontFamily:"'Indie Flower',cursive",fontSize:15,color:"#fff",lineHeight:1.6,marginBottom:6,fontStyle:"italic"}}>
              "The answers are all in Rage Fighters. The Senseis in each zone spell it out — and Aaron's notebook pages are floating everywhere with the intel. Go back in with your eyes open."
            </div>
            <div style={{fontFamily:"'Indie Flower',cursive",fontSize:12,color:"#888",marginBottom:20}}>— Aaron</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <a href="https://www.roblox.com/games/106511362279091/Rage-Fighters" target="_blank" rel="noopener noreferrer"
                style={{display:"block",padding:"12px",fontFamily:"'Bangers',cursive",fontSize:18,letterSpacing:2,background:"#E67E22",color:"#fff",borderRadius:6,textDecoration:"none",boxShadow:"3px 3px 0 #8B4513"}}>
                PLAY RAGE FIGHTERS →
              </a>
              <button onClick={() => setShowGameRedirect(false)}
                style={{padding:"10px",fontFamily:"'Indie Flower',cursive",fontSize:14,background:"#333",color:"#aaa",border:"1px solid #555",borderRadius:6,cursor:"pointer"}}>
                Keep Playing
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
                  const sessionData = {timestamp:new Date().toISOString(),survey:surveyAnswers,battle:{battle_score:score,stans_captured:party.length,lore_correct:loreCorrectTotal,lore_total:loreTotalAsked,breathe_mastery:Math.round(((skillCorrects.breathe||0)/5)*100)+"%",pause_mastery:Math.round(((skillCorrects.pause||0)/5)*100)+"%",chill_mastery:Math.round(((skillCorrects.chill||0)/5)*100)+"%",connect_mastery:Math.round(((skillCorrects.connect||0)/5)*100)+"%"}};
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
