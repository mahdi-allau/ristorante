// Carta dei vini, copiata da iquattroangeli.it/carta-vini/ (sezioni "I rossi", "I vini del territorio", "I bianchi").
// Nella demo è un elenco fisso; in produzione può diventare gestibile dal pannello come il menu.
// Prezzi: [calice, bottiglia] — null = non disponibile in quel formato.
export interface Wine { name: string; detail: string; glass: number | null; bottle: number }
export interface WineSection { id: string; title: { it: string; en: string; fr: string; ar: string; de: string; es: string }; wines: Wine[] }

export const WINE_LIST: WineSection[] = [
  {
    id: 'rossi', title: { it: 'I rossi', en: 'Reds', fr: 'Les rouges', ar: 'النبيذ الأحمر', de: 'Die Rotweine', es: 'Los tintos' }, wines: [
      { name: 'Syrah', detail: 'Vignatorta Amastuola-Massafra', glass: null, bottle: 23 },
      { name: 'Lagrein', detail: 'DOC · Terre di San Mauro', glass: null, bottle: 26 },
      { name: 'Sangiovese Superiore di Romagna', detail: 'Cantina Casticiano', glass: 5, bottle: 23 },
      { name: 'Cabernet Sauvignon', detail: 'Colli Berici · "Casa de Fra"', glass: 5, bottle: 23 },
      { name: 'Valpolicella', detail: 'DOC · San Valery', glass: 5, bottle: 21 },
      { name: 'Nero di Lambrusco', detail: 'Cantine Ceci Torrile · Protello', glass: 5, bottle: 21 },
    ],
  },
  {
    id: 'territorio', title: { it: 'I vini del territorio', en: 'Local wines', fr: 'Les vins du terroir', ar: 'نبيذ المنطقة', de: 'Die Weine der Region', es: 'Los vinos de la zona' }, wines: [
      { name: 'Fortana', detail: 'Vini delle Sabbie · Corte Madonnina · Bosco Eliceo', glass: 5, bottle: 19 },
      { name: 'Merlot', detail: 'Vini delle Sabbie · Corte Madonnina · Bosco Eliceo', glass: null, bottle: 19 },
      { name: 'Bianco frizzante', detail: 'Vini delle Sabbie · Corte Madonnina · Bosco Eliceo', glass: null, bottle: 19 },
    ],
  },
  {
    id: 'bianchi', title: { it: 'I bianchi', en: 'Whites & sparkling', fr: 'Les blancs et les bulles', ar: 'النبيذ الأبيض والفوّار', de: 'Weiß- und Schaumweine', es: 'Blancos y espumosos' }, wines: [
      { name: 'Prosecco Valdobbiadene', detail: 'Miol Extra Dry · Bortolomiol · Veneto', glass: 5.5, bottle: 23 },
      { name: 'Franciacorta DOCG', detail: 'Satèn · Barone di Erbusto', glass: null, bottle: 35 },
      { name: 'Foss Marai', detail: 'Valdobbiadene · Extra Dry', glass: 6, bottle: 26 },
      { name: "Moscato d'Asti", detail: 'Alte Rocche Bianche', glass: 5, bottle: 23 },
      { name: 'Lugana', detail: 'DOC · "Cà Saletti"', glass: null, bottle: 23 },
      { name: 'Ribolla Gialla', detail: 'Antonutti', glass: 5, bottle: 23 },
      { name: 'Falanghina', detail: 'IGT "Lila" · Tenuta Cavalier Pepe', glass: 5, bottle: 21 },
      { name: 'Chardonnay', detail: 'Terrazze della Luna', glass: null, bottle: 21 },
      { name: 'Müller Thurgau', detail: 'Trentino · Rocca Savina', glass: null, bottle: 21 },
      { name: 'Gewürztraminer', detail: 'Alto Adige · Pendici del Baldo', glass: 5.5, bottle: 26 },
    ],
  },
];
