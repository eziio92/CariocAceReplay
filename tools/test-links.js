#!/usr/bin/env node
/* Teste le codec des liens courts (#h=2.) de tools/replay-source.html : node tools/test-links.js
   Cas limites, relecture identique sur 3 000 mains aléatoires, entrées hostiles, aller-retour base 62. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'replay-source.html'), 'utf8');
const cut = (a, b) => src.slice(src.indexOf(a), src.indexOf(b));
vm.runInThisContext(cut('/*CORE-START*/', '/*CORE-END*/') + cut('const NOTE_LINE', 'function b64enc') +
  cut('/* ---- Lien court (v2)', 'const pageBase') + ';globalThis.X={parseHand,stripNotes,p2Pack,p2Unpack,p2Proj,replay,b62enc,b62dec};');
const { parseHand, stripNotes, p2Pack, p2Unpack, p2Proj, replay, b62enc, b62dec } = X;
let fails = 0; const bad = m => { fails++; console.log('ÉCHEC', m); };
const same = (H, text, title) => {
  const r = p2Pack(text, title); if (!r) return null;
  const u = p2Unpack(r.code), G = parseHand(u.h);
  if (u.t !== title || p2Proj(G) !== p2Proj(H)) return false;
  for (let n = 0; n <= H.events.length; n++) if (JSON.stringify(replay(H, n)) !== JSON.stringify(replay(G, n))) return false;
  return true;
};
const cases = {
  headsup: "Hero: SB, Ah Kd\nStack: 12bb\nPreflop: Hero raise all-in, BB call\nFlop: 2c 7d 9h\nTurn: Ks\nRiver: 3h\nRésultat: Hero gagne",
  threebet: "Hero: BTN, Qs Qd\nStack: 100\nBB 80bb : Ah Kh\nPreflop: UTG fold, HJ raise 2.2, CO fold, Hero 3bet 7.5, SB fold, BB fold, HJ call\nFlop: Js 8h 3c\nHJ check, Hero bet 33%, HJ raise 18, Hero call\nTurn: 2d\nHJ bet 50%, Hero fold\nNote: privée\nTags: bluff catch",
  ante: "Hero: CO 9-max ante 0.5, 7h 7c\nUTG+1 40bb\nCO 55bb\nHero 55bb\nPreflop: UTG fold, UTG+1 limp, Hero raise 4.5, BTN fold, SB fold, BB fold, UTG+1 call\nFlop: 7s 7d 2c\nUTG+1 check, Hero bet 2.25, UTG+1 call\nTurn: Ac\nUTG+1 check, Hero bet 6.75, UTG+1 raise 21.5, Hero allin",
  unicode: "Hero: BTN, A♠ K♦\nStack: 25bb\nPreflop: Hero raise 2, BB call\nFlop: Q♠ 7♥ 2♦\nBB check, Hero check\nRésultat: showdown – Hero perd contre une quinte flush ♥",
  appli: "Daily · 6 nov. 2026 · main n°3\n9-max · ante 1 bb\nHero BB 32 bb : K♥️ J♦️\nSB 32 bb\n\nPreflop (pot 2.5 bb) · SRP :\n  Hero (BB) raise to 2.5, SB call 1.5\nFlop J♦️ J♥️ 4♣️ (pot 6 bb, SPR 4.9) :\n  SB check, Hero (BB) bet 29.5 (492% pot) · all-in, SB call 29.5 · all-in\nTurn 9♠️ (pot 65 bb, SPR 0) :\n  SB check, Hero (BB) check\nRiver A♠️ (pot 65 bb, SPR 0)\n\nRésultat : Perdue",
};
for (const [k, raw] of Object.entries(cases)) {
  const text = stripNotes(raw), r = same(parseHand(text), text, 'Titre é à');
  if (r !== true) bad('cas ' + k + ' : ' + r);
}
if (p2Pack(stripNotes("Hero: MP3, As Ad\nStack: 30\nPreflop: Hero raise 2, BB call\nFlop: 2s 3c 4d\nBB check, Hero bet 2"), 'x') !== null) bad('position MP3 : doit retomber sur l\'ancien lien');
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296, pick = a => a[Math.floor(rnd() * a.length)];
const POS = ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'], KINDS = ['fold', 'check', 'call', 'bet', 'raise', 'allin', 'bet 33%', 'raise 62.5', 'bet 12.25', 'raise 7', 'shove', 'check-raise 9', '3bet 8'];
const deck = () => { const d = []; for (const r of '23456789TJQKA') for (const s of 'shdc') d.push(r + s); for (let i = 51; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; };
let packed = 0;
for (let it = 0; it < 3000; it++) {
  const d = deck(), L = ['Hero: ' + pick(POS) + ', ' + d[0] + ' ' + d[1]];
  if (rnd() < .5) L.push('Stack: ' + pick(['12', '25.5', '40', '100']) + 'bb');
  if (rnd() < .4) L.push(pick(POS) + ' ' + pick(['30', '45.5', '80']) + 'bb' + (rnd() < .5 ? ' : ' + d[2] + ' ' + d[3] : ''));
  if (rnd() < .3) L.push('ante ' + pick(['0.5', '1']));
  if (rnd() < .3) L.push(pick(['6', '8', '9']) + '-max');
  const acts = n => Array.from({ length: n }, () => (rnd() < .3 ? 'Hero' : pick(POS)) + ' ' + pick(KINDS)).join(', ');
  L.push('Preflop: ' + acts(2 + Math.floor(rnd() * 5)));
  const nb = Math.floor(rnd() * 4);
  if (nb > 0) { L.push('Flop: ' + d[4] + ' ' + d[5] + ' ' + d[6]); if (rnd() < .8) L.push(acts(1 + Math.floor(rnd() * 4))); }
  if (nb > 1) { L.push('Turn: ' + d[7]); if (rnd() < .8) L.push(acts(1 + Math.floor(rnd() * 3))); }
  if (nb > 2) { L.push('River: ' + d[8]); if (rnd() < .8) L.push(acts(1 + Math.floor(rnd() * 3))); }
  if (rnd() < .5) L.push('Résultat: ' + pick(['Gagnée', 'Split', 'showdown, Hero perd', 'Hero gagne avec une couleur']));
  const text = L.join('\n'); let H; try { H = parseHand(text); } catch (e) { continue; }
  const r = same(H, text, 'T' + it); if (r === false) { bad('main aléatoire ' + it + '\n' + text); break; } if (r) packed++;
}
if (packed < 2500) bad('trop peu de mains rangées en lien court : ' + packed);
for (let i = 0; i < 2000; i++) {
  let s = ''; for (let k = 1 + Math.floor(rnd() * 120); k > 0; k--) s += pick('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
  try { p2Unpack(s); } catch (e) {}
}
for (let i = 0; i < 2000; i++) { const b = Array.from({ length: Math.floor(rnd() * 80) }, () => Math.floor(rnd() * 256)); if (JSON.stringify(b62dec(b62enc(b))) !== JSON.stringify(b)) { bad('base 62'); break; } }
console.log(fails ? fails + ' échec(s)' : 'OK : cas limites, ' + packed + ' mains aléatoires relues à l\'identique, entrées hostiles, base 62');
process.exit(fails ? 1 : 0);
