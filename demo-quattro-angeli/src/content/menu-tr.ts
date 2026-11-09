// Descrizioni dei piatti in francese, arabo, tedesco e spagnolo. I nomi restano quelli italiani (sono i nomi dei piatti).
// Ordine di ogni voce: [fr, ar, de, es]. Dove manca una voce, il sito mostra la descrizione inglese.
type Tr = [string, string, string, string];

const base: Record<string, Tr> = {
  formaggi: ['avec des compotes de fruits et de l’aigre-doux', 'مع مربّيات الفاكهة والصلصة الحلوة الحامضة', 'mit Fruchtkompotten und Süßsauer-Sauce', 'con compotas de fruta y agridulce'],
  'tagliere-emiliano': ['avec des pinzini faits maison', 'مع البينتزيني محلية الصنع', 'mit hausgemachten Pinzini', 'con pinzini caseros'],
  culatello: ['avec squaquerone DOP, figues caramélisées et pinzini faits maison', 'مع جبن سكواكيرّوني المحمي وتين مكرمل وبينتزيني محلية الصنع', 'mit Squaquerone DOP, karamellisierten Feigen und hausgemachten Pinzini', 'con squaquerone DOP, higos caramelizados y pinzini caseros'],
  'gran-tagliere': ['Charcuteries, fromages et pinzini', 'لحوم مقدّدة وأجبان وبينتزيني', 'Aufschnitt, Käse und Pinzini', 'Embutidos, quesos y pinzini'],
  'polpo-patate': ['parfumé à la menthe, sauce aïoli', 'بنكهة النعناع وصلصة الأيولي', 'mit Minzduft und Aioli-Sauce', 'con aroma de menta y salsa alioli'],
  'flan-cardoncelli': ['avec une fondue de fromage de chèvre', 'مع فوندو جبن الماعز', 'mit Ziegenkäsefondue', 'con fondue de queso de cabra'],
  tartare: ['avec œuf mariné râpé, poudre de câpres, pétales d’oignon et moutarde au miel', 'مع بيض متبّل مبشور ومسحوق الكبار وبتلات البصل وخردل بالعسل', 'mit geriebenem marinierten Ei, Kapernpulver, Zwiebelblättern und Honigsenf', 'con huevo marinado rallado, polvo de alcaparras, pétalos de cebolla y mostaza a la miel'],
  baccala: ['avec truffe noire, pain de seigle et beurre aromatisé', 'مع الكمأ الأسود وخبز الجاودار وزبدة منكّهة', 'mit schwarzem Trüffel, Roggenbrot und Aromabutter', 'con trufa negra, pan de centeno y mantequilla aromatizada'],
  'insalatina-mela': ['avec noix, grenade, endive, magret de canard et Grana Padano', 'مع الجوز والرمان والهندباء وصدر البط وجبن غرانا بادانو', 'mit Walnüssen, Granatapfel, Endivie, Entenbrust und Grana Padano', 'con nueces, granada, endivia, pechuga de pato y Grana Padano'],
  'cappelletti-brodo': ['dans un bouillon de chapon de la maison', 'في مرق الديك المخصي المحلي', 'in hausgemachter Kapaunbrühe', 'en caldo de capón de la casa'],
  pappardella: ['« à notre façon », avec copeaux de Grana Padano 36 mois', '«على طريقتنا» مع رقائق جبن غرانا بادانو معتّق 36 شهرًا', '„auf unsere Art“, mit Spänen von 36 Monate gereiftem Grana Padano', '«a nuestra manera», con virutas de Grana Padano de 36 meses'],
  'cappellacci-ragu': ['au ragù ou au beurre et à la sauge', 'بصلصة الراغو أو بالزبدة والمريمية', 'mit Ragù oder Butter und Salbei', 'al ragú o con mantequilla y salvia'],
  'tagliatelle-bianco': ['de magret de canard haché au couteau, zeste d’orange', 'من صدر البط المفروم بالسكين مع قشر البرتقال', 'aus mit dem Messer gehackter Entenbrust mit Orangenzesten', 'de pechuga de pato picada a cuchillo con ralladura de naranja'],
  'cappellacci-vellutata': ['avec velouté de parmesan, guanciale croustillant et gouttes de vinaigre balsamique', 'مع كريمة الجبن البارميزان ولحم الخد المقرمش وقطرات من الخل البلسمي', 'mit Parmesancreme, knusprigem Guanciale und Tropfen von Balsamico', 'con crema de parmesano, guanciale crujiente y gotas de vinagre balsámico'],
  pasticcio: ['en croûte de pâte demi-sucrée, à la truffe noire', 'محاط بعجينة شبه حلوة مع الكمأ الأسود', 'in halbsüßem Teig mit schwarzem Trüffel', 'cerrado en masa semidulce con trufa negra'],
  lasagnetta: ['avec béchamel au safran et asperges', 'مع بشاميل بالزعفران والهليون', 'mit Safran-Béchamel und Spargel', 'con bechamel de azafrán y espárragos'],
  passatelli: ['avec fleurs de courgette croustillantes et poutargue de mulet', 'مع أزهار الكوسا المقرمشة وبطارخ البوري', 'mit knusprigen Zucchiniblüten und Meeräschen-Bottarga', 'con flores de calabacín crujientes y bottarga de mújol'],
  spaghettino: ['dans une crème de tomates jaunes, stracciatella de bufflonne, crevette rouge crue et éclats de pistache', 'في كريمة الطماطم الصفراء مع ستراتشاتيلا الجاموس والجمبري الأحمر النيء وفتات الفستق', 'in Creme aus gelben Tomaten, Büffel-Stracciatella, rohen roten Garnelen und Pistaziensplittern', 'en crema de tomates amarillos, stracciatella de búfala, gamba roja cruda y granillo de pistacho'],
  'arrosto-oste': ['pintade rôtie farcie à la saucisse', 'دجاج غينيا مشوي محشو بالنقانق', 'gebratenes Perlhuhn, mit Wurst gefüllt', 'pintada asada rellena de salchicha'],
  caesar: ['avec poitrine de poulet grillée, copeaux de grana et croûtons', 'مع صدر دجاج مشوي ورقائق الجبن وقطع الخبز المحمّص', 'mit gegrillter Hähnchenbrust, Grana-Spänen und Croûtons', 'con pechuga de pollo a la parrilla, virutas de grana y picatostes'],
  maialino: ['au lard de Colonnata', 'ملفوف بشحم كولونّاتا', 'im Colonnata-Speckmantel', 'con lardo de Colonnata'],
  agnello: ['avec millefeuille de pommes de terre au romarin', 'مع ميلفوي البطاطس بإكليل الجبل', 'mit Kartoffel-Rosmarin-Millefeuille', 'con milhojas de patata al romero'],
  filetto: ['avec sel doux de Cervia', 'مع ملح تشيرفيا الحلو', 'mit süßem Salz aus Cervia', 'con sal dulce de Cervia'],
  tagliata: ['avec sauce chimichurri et copeaux de fromage de fosse', 'مع صلصة التشيميتشوري ورقائق جبن «فوسّا»', 'mit Chimichurri-Sauce und Spänen von Fossa-Käse', 'con salsa chimichurri y virutas de queso de fosa'],
  salmone: ['avec salade de fenouil et d’orange, poudre d’olives noires', 'مع سلطة الشمر والبرتقال ومسحوق الزيتون الأسود', 'mit Fenchel-Orangen-Salat und Pulver aus schwarzen Oliven', 'con ensalada de hinojo y naranja y polvo de aceitunas negras'],
  salama: ['avec purée de pommes de terre', 'مع هريس البطاطس', 'mit Kartoffelpüree', 'con puré de patatas'],
  'panna-cotta': ['avec crumble au chocolat et caramel salé', 'مع كرامبل الشوكولاتة والكراميل المملّح', 'mit Schokoladen-Crumble und gesalzenem Karamell', 'con crumble de chocolate y caramelo salado'],
  tenerina: ['avec crème chantilly', 'مع كريمة شانتيلي', 'mit Chantilly-Creme', 'con crema chantilly'],
  millefoglie: ['fraises fraîches et pépites de chocolat', 'مع الفراولة الطازجة ورقائق الشوكولاتة', 'frische Erdbeeren und Schokoladenstückchen', 'fresas frescas y pepitas de chocolate'],
  'semifreddo-pistacchio': ['avec ganache gianduja et meringue', 'مع غاناش الجيانديوتا والمرينغ', 'mit Gianduja-Ganache und Baiser', 'con ganache de gianduja y merengue'],
  sbrisolona: ['figues caramélisées et éclats d’amandes', 'تين مكرمل ورقائق اللوز', 'karamellisierte Feigen und Mandelsplitter', 'higos caramelizados y láminas de almendra'],
  'gf-sformatino': ['avec crème de parmesan', 'مع كريمة البارميزان', 'mit Parmesancreme', 'con crema de parmesano'],
  'gf-cestino': ['garni de légumes sautés à la poêle', 'محشوّة بخضار مقلية في المقلاة', 'gefüllt mit in der Pfanne gebratenem Gemüse', 'relleno de verduras salteadas'],
  'gf-flan-patate': ['au cœur de fromage fondant', 'بقلب من الجبن الطري', 'mit weichem Käsekern', 'con corazón de queso fundido'],
  'gf-ravioli': ['avec gorgonzola et noix', 'مع الجورجونزولا والجوز', 'mit Gorgonzola und Walnüssen', 'con gorgonzola y nueces'],
  'gf-tortelli': ['avec tomates cerises et aubergines', 'مع الطماطم الكرزية والباذنجان', 'mit Kirschtomaten und Auberginen', 'con tomates cherry y berenjenas'],
  'gf-gnocchi': ['avec saumon et courgettes', 'مع السلمون والكوسا', 'mit Lachs und Zucchini', 'con salmón y calabacín'],
  'cappelletti-cacio': ['pâtes farcies au porc et au parmesan, crème de fromage de brebis et poivre', 'معكرونة محشوّة بلحم الخنزير والبارميزان مع كريمة جبن الغنم والفلفل', 'mit Schwein und Parmesan gefüllte Pasta mit cremigem Schafskäse und Pfeffer', 'pasta rellena de cerdo y parmesano con crema de queso de oveja y pimienta'],
  'zuppa-inglese': ['dessert traditionnel à la crème pâtissière et au biscuit', 'حلوى تقليدية بالكاسترد والبسكويت الإسفنجي', 'traditionelles Dessert mit Vanillecreme und Biskuit', 'postre tradicional de crema pastelera y bizcocho'],
  'gf-tenerina': ['gâteau fondant au chocolat', 'كعكة شوكولاتة طرية', 'saftiger Schokoladenkuchen', 'tarta de chocolate jugosa'],
  'gf-dolce-salame': ['salami de chocolat et de biscuits', 'سلامي الشوكولاتة والبسكويت', 'Salami aus Schokolade und Keksen', 'salami de chocolate y galletas'],
  'gf-salmone': ['à la plancha', 'مشوي على الصاج', 'vom Grill', 'a la plancha'],
};

// I piatti senza glutine ripetono la descrizione di quelli corrispondenti
base['gf-cappellacci-ragu'] = base['cappellacci-ragu'];
base['gf-cappellacci-vellutata'] = base['cappellacci-vellutata'];

export const DISH_DESC_TR: Record<string, Tr> = base;
export const TR_LOCALES = ['fr', 'ar', 'de', 'es'] as const;
