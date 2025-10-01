// Trainingsvormen en uitleg voor de workout creator
// Kan worden geïmporteerd in de UI

export const TRAINING_TYPES = [
  {
    value: 'EMOM',
    label: 'EMOM (Every Minute on the Minute)',
    description: 'Begin elke minuut met een oefening of set. Resterende tijd = rust. Doel: Tempo vasthouden, capaciteit vergroten.'
  },
  {
    value: 'AMRAP',
    label: 'AMRAP (As Many Rounds/Reps As Possible)',
    description: 'Werk binnen een vaste tijd zoveel mogelijk rondes of reps af. Doel: Conditie en uithoudingsvermogen verbeteren.'
  },
  {
    value: 'FOR_TIME',
    label: 'FOR TIME',
    description: 'Voltooi een vastgesteld aantal rondes of reps zo snel mogelijk. Doel: Snelheid en efficiëntie maximaliseren.'
  },
  {
    value: 'TABATA',
    label: 'TABATA',
    description: '20 sec werk / 10 sec rust x 8 (totaal 4 min). Doel: Explosieve kracht, anaerobe capaciteit.'
  },
  {
    value: 'LADDER_PYRAMIDE',
    label: 'LADDER / PYRAMIDE',
    description: 'Op- of aflopende herhalingen (bijv. 1–10–1). Doel: Progressieve belasting en kracht-uithoudingsvermogen.'
  },
  {
    value: 'CIRCUIT_TRAINING',
    label: 'CIRCUIT TRAINING',
    description: 'Serie oefeningen achter elkaar met minimale rust. Kan op tijd (bijv. 40 sec per station) of op aantal reps. Doel: Volledig lichaam trainen, hartslag hoog houden.'
  },
  {
    value: 'CHIPPER',
    label: 'CHIPPER',
    description: 'Grote set oefeningen en reps “afwerken” tot alles klaar is. Doel: Pacing en doorzettingsvermogen ontwikkelen.'
  },
  {
    value: 'INTERVAL_HIIT',
    label: 'INTERVAL / HIIT',
    description: 'Afwisselend hoge en lage intensiteit (bijv. 30 sec sprint / 30 sec rust). Doel: VO₂ max, explosiviteit en conditie verbeteren.'
  },
  {
    value: 'PARTNER_TEAM',
    label: 'PARTNER / TEAM WORKOUT',
    description: 'Samenwerken: om beurten of samen reps verzamelen. Doel: Motivatie, competitie, teamwork.'
  },
  {
    value: 'COMPLEX_FLOW',
    label: 'COMPLEX / FLOW',
    description: 'Reeks oefeningen zonder de gewichten neer te leggen. Vaak met barbell, kettlebell of dumbbell. Doel: Gripkracht, kracht-uithoudingsvermogen, techniek.'
  },
  {
    value: 'HYBRID',
    label: 'HYBRID',
    description: 'Combinatie van kracht- en conditionele elementen. Vaak met rennen als transitie tussen oefeningen (bijv. farmer carries → run → wall balls). Doel: Nabootsen van events zoals obstacle runs, functional fitness races en andere duur-/krachtwedstrijden.'
  }
];
