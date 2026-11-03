// Collegamenti pubblici controllati il 03/11/2026. Nessun video viene copiato.
const tutorials = [
  ['rT7DgCr-3pg', 'How To: Barbell Bench Press'],
  ['8iPEnn-ltC8', 'How To: Dumbbell Incline Chest Press'],
  ['8Um35Es-ROE', 'How To: Cable Fly (High-To-Low)', 'Variante: croci ai cavi dall’alto verso il basso.'],
  ['wxhNoKZlfY8', 'How To: Push-Up'],
  ['CAwf7n6Luuc', 'How To: Lat Pulldown'],
  ['6TSP1TRMUzs', 'How To: Dumbbell Bent-Over Row'],
  ['7o2oolbmzeI', 'How To: Seated Cable Low-Row'],
  ['VHt8ulfWtzY', 'How To: Beginner Pull-Up'],
  ['1oed-UmAxFs', 'How To: Barbell Squat'],
  ['oujca3_Shgw', 'How To: Leg Press (Cybex)'],
  ['D7KaRcUTQeE', 'How To: Dumbbell Stepping Lunge'],
  ['ELOCsoDSmrg', 'How To: Seated Leg Curl (Cybex)', 'Variante: leg curl da seduto.'],
  ['YyvSfVjQeL0', 'How To: Leg Extension (Cybex)'],
  ['JCXUYuzwNrM', 'How To: Romanian Deadlift (Barbell)'],
  ['YMmgqO8Jo-k', 'How To: Standing Calf (BM)', 'Variante: calf raise in piedi alla macchina.'],
  ['qEwKCR5JCog', 'How To: Dumbbell Shoulder Press'],
  ['3VcKaXpzqRo', 'How To: Dumbbell Side Lateral Raise'],
  ['rep-qVOkqgk', 'How To: Face Pull'],
  ['sAq_ocpRh_I', 'How To: Alternating Dumbbell Curl'],
  ['AsAVbj7puKo', 'How To: Outside Grip Cable EZ-Curls', 'Variante: curl al cavo con barra EZ.'],
  ['vB5OHsJ3EME', 'How To: Rope Push-Down'],
  ['YbX7Wd8jQ-Q', 'How To: Dumbbell Seated Overhead Tricep Extension'],
  ['NnVhqMQRvmM', 'How to do an abdominal crunch', '', 'PureGym'],
  ['pSHjTRCQxIw', 'How To: Plank'],
  ['z3l-nIMIbPk', 'How to use a Treadmill', 'Uso del tapis roulant; regola la velocità sul tuo passo.', 'Planet Fitness'],
  ['NwwDBARCGgo', 'How To Use The Stationary Bike', '', 'PureGym']
];
export const exerciseVideos = Object.fromEntries(tutorials.map(([id, title, note, author], i) => [`ex-${i}`, { id, title, author: author || 'ScottHermanFitness', note: note || 'Tutorial di esecuzione. Audio in inglese.' }]));
const pplTimes = { 'incline-barbell':528,'alternating-press':560,'dips':604,'barbell-row':671,'incline-curl':703,'ez-curl':746,'barbell-lunge':815,'hip-thrust':897,'seated-calf':911,'lying-curl':943,'close-bench':1006,'standing-press':1025,'pec-deck':1047,'rack-pull':1130,'hammer':1184,'reverse-pulldown':1213,'adductor':1376,'press-calf':1361 };
for(const [key,start] of Object.entries(pplTimes)) exerciseVideos[`ppl19-${key}`]={id:'p-8WBLBrG4k',start,author:'Chris Bumstead',title:'PPL 2019 · Spiegazione originale',note:'Chris spiega questo esercizio e la prescrizione del programma; non è un tutorial pratico isolato.'};
const referenceTimes = {
  'cbum-lat-supina': 25, 'cbum-tbar': 136, 'cbum-row-prona': 136,
  'cbum-high-row': 136, 'cbum-ez-reverse': 472, 'cbum-hammer': 472,
  'cbum-preacher': 472, 'cbum-rear-delt': 628
};
const sessionTimes={
 'chest-incline':['ynbS3UZT2O8',17],'chest-flat':['ynbS3UZT2O8',185],'chest-jm':['ynbS3UZT2O8',462],'chest-dip':['ynbS3UZT2O8',462],'chest-french':['ynbS3UZT2O8',462],'chest-onearm':['ynbS3UZT2O8',773],'chest-facepull':['ynbS3UZT2O8',773],
 'legs-curl':['lIXIwgv3l6o',202],'legs-extension':['lIXIwgv3l6o',202],'legs-front':['lIXIwgv3l6o',306],'legs-ghr':['lIXIwgv3l6o',540],'legs-press':['lIXIwgv3l6o',600],'legs-calf':['lIXIwgv3l6o',811]
};
for(const [key,[id,start]] of Object.entries(sessionTimes))exerciseVideos[`cbum-${key}`]={id,start,author:'Chris Bumstead',title:key.startsWith('chest')?'This Chest Workout Won Me 6 Olympias':'Classic Bodybuilding Leg Day',note:'Il collegamento apre il blocco del video originale in cui viene mostrato o spiegato questo esercizio.'};
for (const [key, start] of Object.entries(referenceTimes)) exerciseVideos[key] = {
  id: 'ZQPVYJc1cpM', start, author: 'Chris Bumstead', title: 'This Back Workout Won Me 6 Olympias',
  note: start === 136 || start === 472 ? 'Il video si apre sul blocco tri-set: i tre esercizi sono mostrati in sequenza.' : 'Il video si apre sul blocco di questo esercizio nella sessione originale.'
};

export function youtubeUrl(value) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string' || value.length > 500) throw new Error('Inserisci un link video YouTube valido.');
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Inserisci un link video YouTube valido.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Usa un link HTTPS di YouTube.');
  const host = url.hostname.toLowerCase();
  let id;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})\/?$/.exec(url.pathname)?.[1];
  }
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id ?? '')) throw new Error('Serve il link di un singolo video YouTube.');
  const result = new URL('https://www.youtube.com/watch'); result.searchParams.set('v', id);
  const start = url.searchParams.get('t') ?? url.searchParams.get('start');
  if (start && /^(?:\d+h)?(?:\d+m)?\d+s?$/.test(start) && start.length < 15) result.searchParams.set('t', start);
  return result.href;
}

export function exerciseVideo(exercise) {
  if (exercise.videoUrl) {
    try { return { url: youtubeUrl(exercise.videoUrl), author: 'Link personale', title: 'Il tuo video di riferimento', note: 'Video scelto da te per questo esercizio.' }; }
    catch { /* Anche un archivio vecchio deve produrre solo collegamenti validi. */ }
  }
  const video = exerciseVideos[exercise.id];
  if (!video) return null;
  return { ...video, url: `https://www.youtube.com/watch?v=${video.id}${video.start ? `&t=${video.start}s` : ''}` };
}
export const exerciseVideoSearch = exercise => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} ${exercise.equipment} esecuzione corretta`)}`;
