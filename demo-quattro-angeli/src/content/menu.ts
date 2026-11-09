// Menu iniziale: copiato dal menu pubblicato su iquattroangeli.it (pagine Menu, Gluten free, Dolci e menu inglese).
// Una volta in uso, il menu si modifica dal pannello /admin.
//
// NOTE per il titolare (TODO-CLIENTE):
//  - Allergeni: il sito attuale non li riporta. Vanno compilati piatto per piatto (obbligo Reg. UE 1169/2011).
//  - Correzioni al testo originale: "stracciatella si cufala" → "stracciatella di bufala".
//  - Prezzo dei "Cappellacci di zucca" senza glutine: 13 € sulla pagina italiana, 12 € su quella inglese → confermare.
//  - Traduzioni inglesi: usate quelle del sito attuale; dove mancavano (piatti senza glutine, dolci, maialino) sono nuove e da rivedere.
import { DISH_DESC_TR, TR_LOCALES } from './menu-tr';
import type { Dish } from './types';

export type { AllergenKey, Course, Dish } from './types';

type Opts = { gf?: boolean; group?: 'tradizione' | 'oltre' };
const d = (
  id: string, course: Dish['course'], price: number,
  it: [string, string], en: [string, string], o: Opts = {},
): Dish => ({
  id, course, price, allergens: [], vegetarian: false, glutenFree: !!o.gf, ...(o.group && { group: o.group }),
  available: true, name: { it: it[0], en: en[0] }, desc: { it: it[1], en: en[1] },
});

const BASE_DISHES: Dish[] = [
  /* ---------- Antipasti ---------- */
  d('formaggi', 'antipasti', 12, ['Degustazione di formaggi', 'con composte di frutta e agrodolce'], ['Cheese platter', 'with fruit and sweet-and-savory compotes']),
  d('tagliere-emiliano', 'antipasti', 14, ['Tagliere Emiliano', 'con pinzini fatti in casa'], ['Emilian cold-cuts board', 'with homemade deep-fried bread squares']),
  d('culatello', 'antipasti', 13, ['Fiocchetto di Culatello', 'con squaquerone DOP, fichi caramellati e pinzini fatti in casa'], ['Culatello ham', 'with squaquerone DOP soft cheese, caramelized figs and homemade deep-fried bread squares']),
  d('gran-tagliere', 'antipasti', 25, ["Gran tagliere dell'Oste", 'Salumi, formaggi e pinzini'], ['Great board of the "Oste"', 'Cold-cuts, cheeses and homemade deep-fried bread squares']),
  d('polpo-patate', 'antipasti', 16, ['Polpo e patate tiepidi', 'al profumo di menta e salsa aioli'], ['Warm octopus and potatoes', 'mint scented with aioli sauce']),
  d('flan-cardoncelli', 'antipasti', 10, ['Flan di funghi cardoncelli', 'con fonduta di caprino'], ['Cardoncelli mushroom flan', 'with goat cheese cream']),
  d('tartare', 'antipasti', 15, ['Tartare di filetto di manzo', 'con grattugiata di uovo marinato, polvere di cappero, petali di cipolla e senape al miele'], ['Beef tartare', 'with grated marinated egg, caper powder, onion petals and honey mustard']),
  d('baccala', 'antipasti', 14, ['Baccalà mantecato', 'con tartufo nero, pane di segale e burro aromatizzato'], ['Creamy cod', 'with black truffle, rye bread and flavored butter']),
  d('insalatina-mela', 'antipasti', 14, ['Insalatina di mela verde', "con noci, melograno, indivia con petto d'anatra e Grana Padano"], ['Green apple salad', 'with walnuts, pomegranate, endive, duck breast and Grana Padano']),

  /* ---------- Primi della tradizione ---------- */
  d('tagliatelle-ragu', 'primi', 10, ['Tagliatelle al ragù ferrarese', ''], ['Tagliatelle with Ferrarese ragù', ''], { group: 'tradizione' }),
  d('cappelletti-brodo', 'primi', 13, ['Cappelletti ferraresi', 'in brodo di cappone nostrano'], ['Cappelletti ferraresi', 'filled with pork and parmesan, in capon broth'], { group: 'tradizione' }),
  d('pappardella', 'primi', 13, ['Pappardella integrale prosciutto e piselli', '"a modo nostro" con scagliette di Grana Padano 36 mesi'], ['Whole wheat pappardelle with ham and peas', '"our way", with 36-month aged Grana Padano shavings'], { group: 'tradizione' }),
  d('cappellacci-ragu', 'primi', 13, ['Cappellacci di zucca', 'al ragù o burro e salvia'], ['Pumpkin cappellacci', 'with ragù or sage and butter'], { group: 'tradizione' }),
  d('tagliatelle-bianco', 'primi', 13, ['Tagliatelle al ragù bianco', "di petto d'anatra al coltello con zeste all'arancia"], ['Tagliatelle with white ragù', 'knife-chopped duck breast with orange zest'], { group: 'tradizione' }),

  /* ---------- La tradizione… e oltre! ---------- */
  d('cappellacci-vellutata', 'primi', 13, ['Cappellacci di zucca', 'con vellutata al parmigiano, guanciale croccante e gocce di aceto balsamico'], ['Pumpkin cappellacci', 'with parmesan cream, crispy guanciale and drops of balsamic vinegar'], { group: 'oltre' }),
  d('pasticcio', 'primi', 14, ['Pasticcio ferrarese', 'chiuso in pasta semi-dolce con tartufo nero'], ['Ferrarese pasticcio', 'semi-sweet pastry crust filled with short pasta, béchamel, pork and black truffle'], { group: 'oltre' }),
  d('cappelletti-cacio', 'primi', 14, ['Cappelletti cacio e pepe', ''], ['Cappelletti cacio e pepe', 'pork and parmesan filled pasta with creamy sheep cheese and pepper'], { group: 'oltre' }),
  d('lasagnetta', 'primi', 13, ['Lasagnetta', 'con besciamella allo zafferano e asparagi'], ['Lasagnetta', 'with saffron béchamel and asparagus'], { group: 'oltre' }),
  d('passatelli', 'primi', 15, ['Passatelli', 'con fiori di zucca croccanti e bottarga di muggine'], ['Passatelli', 'with crispy zucchini flowers and mullet roe'], { group: 'oltre' }),
  d('spaghettino', 'primi', 16.5, ['Spaghettino alla chitarra', 'in crema di pomodori gialli, stracciatella di bufala, crudo di gambero rosso e granella di pistacchi'], ['Spaghettino alla chitarra', 'with yellow tomato sauce, buffalo stracciatella, raw red prawns and chopped pistachio'], { group: 'oltre' }),

  /* ---------- Secondi ---------- */
  d('arrosto-oste', 'secondi', 14, ["Arrosto dell'Oste", 'faraona arrosto farcita con salsiccia'], ["Arrosto dell'Oste", 'roast guinea fowl stuffed with sausage']),
  d('caesar', 'secondi', 14, ['Caesar salad', 'con petto di pollo alla griglia, scaglie di grana e croutons di pane'], ['Caesar salad', 'with grilled chicken breast, Grana shavings and bread croutons']),
  d('maialino', 'secondi', 17, ['Filetto di maialino bardato', 'al lardo di colonnata'], ['Pork fillet', 'wrapped in Colonnata lard']),
  d('agnello', 'secondi', 18, ['Costolette di agnello scottadito', 'con millefoglie di patate al rosmarino'], ['Seared lamb chops', 'with potato and rosemary millefeuille']),
  d('filetto', 'secondi', 23, ['Filetto di manzo alla griglia', 'con sale dolce di Cervia'], ['Grilled beef fillet', 'with Cervia sweet salt']),
  d('tagliata', 'secondi', 26, ['Tagliata di filetto di manzo', 'con salsa chimichurri e scaglie di formaggio di fossa'], ['Sliced beef fillet', 'with chimichurri sauce and flakes of Fossa cheese']),
  d('salmone', 'secondi', 18, ['Trancio di salmone alla piastra', 'con insalatina di finocchi e arance con polvere di olive nere'], ['Grilled salmon', 'with fennel and orange salad and black olive powder']),
  d('salama', 'secondi', 15, ['Salama da sugo', 'con purè di patate'], ['Salama da sugo', 'typical local salami cooked in red wine, with mashed potatoes']),

  /* ---------- Contorni ---------- */
  d('patate', 'contorni', 5, ['Patate al forno', ''], ['Oven-baked potatoes', '']),
  d('insalata-mista', 'contorni', 5, ['Insalata mista', ''], ['Mixed salad', '']),
  d('verdure-griglia', 'contorni', 6, ['Verdure alla griglia', ''], ['Grilled vegetables', '']),
  d('scarola', 'contorni', 6, ['Scarola ripassata', ''], ['Sautéed escarole', '']),

  /* ---------- Dolci ---------- */
  d('cheesecake', 'dolci', 5, ['Cheesecake con coulis di lamponi', ''], ['Cheesecake with raspberry coulis', '']),
  d('panna-cotta', 'dolci', 5, ['Panna cotta', 'con crumble al cioccolato e caramello salato'], ['Panna cotta', 'with chocolate crumble and salted caramel']),
  d('zuppa-inglese', 'dolci', 5, ['Zuppa inglese', ''], ['Zuppa inglese', 'traditional custard and sponge dessert']),
  d('tenerina', 'dolci', 5, ['Tenerina tradizionale', 'con crema chantilly'], ['Traditional tenerina', 'moist chocolate cake with chantilly cream']),
  d('millefoglie', 'dolci', 5, ['Millefoglie su crema al mascarpone', 'fragole fresche e gocce di cioccolato'], ['Millefeuille on mascarpone cream', 'fresh strawberries and chocolate chips']),
  d('semifreddo-pistacchio', 'dolci', 6, ['Semifreddo al pistacchio', 'con ganache alla gianduia e meringa'], ['Pistachio semifreddo', 'with gianduja ganache and meringue']),
  d('sbrisolona', 'dolci', 6, ['Sbrisolona con gelato fior di latte', 'fichi caramellati e scaglie di mandorle'], ['Sbrisolona with fior di latte ice cream', 'caramelized figs and almond flakes']),

  /* ---------- Senza glutine (serviti sigillati, linea AIM) ---------- */
  d('gf-sformatino', 'antipasti', 10, ['Sformatino di zucca', 'con crema al parmigiano'], ['Pumpkin flan', 'with parmesan cream'], { gf: true }),
  d('gf-cestino', 'antipasti', 9, ['Cestino di pasta brisè ripieno', 'di verdure saltate in padella'], ['Pastry basket', 'filled with sautéed vegetables'], { gf: true }),
  d('gf-flan-patate', 'antipasti', 10, ['Flan di patate e prosciutto', 'con cuore di formaggio morbido'], ['Ham and potato flan', 'with melted cheese heart'], { gf: true }),
  d('gf-insalata-mare', 'antipasti', 11, ['Insalata di mare', ''], ['Seafood salad', ''], { gf: true }),
  d('gf-lasagne', 'primi', 13, ['Lasagne al forno', ''], ['Baked lasagna', ''], { gf: true }),
  d('gf-cappellacci-ragu', 'primi', 13, ['Cappellacci di zucca', 'al ragù o burro e salvia'], ['Pumpkin cappellacci', 'with ragù or sage and butter'], { gf: true }),
  d('gf-cappellacci-vellutata', 'primi', 13, ['Cappellacci di zucca', 'con vellutata al parmigiano, guanciale croccante e gocce di aceto balsamico'], ['Pumpkin cappellacci', 'with parmesan cream, crispy guanciale and drops of balsamic vinegar'], { gf: true }),
  d('gf-ravioli', 'primi', 12, ['Ravioli di ricotta e spinaci', 'con gorgonzola e noci'], ['Ricotta and spinach ravioli', 'with walnuts and gorgonzola'], { gf: true }),
  d('gf-tortelli', 'primi', 13, ['Tortelli di pesce', 'con pomodorini e melanzane'], ['Fish tortelli', 'with cherry tomatoes and eggplant'], { gf: true }),
  d('gf-gnocchi', 'primi', 13, ['Gnocchi verdi', 'con salmone e zucchine'], ['Green gnocchi', 'with salmon and zucchini'], { gf: true }),
  d('gf-salmone', 'secondi', 15, ['Trancio di salmone', 'alla piastra'], ['Grilled salmon slice', ''], { gf: true }),
  d('gf-pollo', 'secondi', 13, ['Straccetti di pollo al limone', ''], ['Lemon chicken strips', ''], { gf: true }),
  d('gf-faraona', 'secondi', 14, ['Arrosto di faraona farcito', ''], ['Roast stuffed guinea fowl', ''], { gf: true }),
  d('gf-polpo', 'secondi', 14, ['Polpo e patate in padella', ''], ['Pan-fried octopus and potatoes', ''], { gf: true }),
  d('gf-patate', 'contorni', 5, ['Patate al forno', ''], ['Oven-baked potatoes', ''], { gf: true }),
  d('gf-verdure', 'contorni', 5, ['Verdure cotte', ''], ['Cooked vegetables', ''], { gf: true }),
  d('gf-cheesecake-frutti', 'dolci', 6, ['Cheesecake con frutti di bosco', ''], ['Cheesecake with berries', ''], { gf: true }),
  d('gf-cheesecake-pistacchio', 'dolci', 6, ['Cheesecake al pistacchio', ''], ['Pistachio cheesecake', ''], { gf: true }),
  d('gf-tenerina', 'dolci', 5, ['Tenerina', ''], ['Tenerina', 'moist chocolate cake'], { gf: true }),
  d('gf-semifreddo-cioccolati', 'dolci', 6, ['Semifreddo ai tre cioccolati', ''], ['Three chocolate semifreddo', ''], { gf: true }),
  d('gf-semifreddo-nocciola', 'dolci', 6, ['Semifreddo alla nocciola', ''], ['Hazelnut semifreddo', ''], { gf: true }),
  d('gf-dolce-salame', 'dolci', 5, ['Dolce salame', ''], ['Dolce salame', 'chocolate and cookies salami'], { gf: true }),
  d('gf-tiramisu', 'dolci', 5, ['Tiramisù', ''], ['Tiramisù', ''], { gf: true }),
];

/** Menu iniziale con le descrizioni anche in francese, arabo, tedesco e spagnolo. */
export const DEFAULT_DISHES: Dish[] = BASE_DISHES.map((dish) => {
  const tr = DISH_DESC_TR[dish.id];
  if (!tr) return dish;
  return { ...dish, desc: { ...dish.desc, ...Object.fromEntries(TR_LOCALES.map((l, i) => [l, tr[i]])) } };
});
