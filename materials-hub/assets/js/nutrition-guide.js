'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'ggc-nutrition-guide-v1';

  const foodItems = [
    {
      names: ['масло'],
      status: 'Уточни продукт',
      tone: 'amber',
      text: 'Масла очень разные по вкусу, но почти всегда плотные по калориям.',
      portionTip: 'Уточни: сливочное, оливковое, подсолнечное, кокосовое, авокадо или гхи.',
      clarifyOptions: ['сливочное масло', 'оливковое масло', 'подсолнечное масло', 'масло авокадо', 'гхи'],
    },
    {
      names: ['сыр'],
      status: 'Уточни продукт',
      tone: 'amber',
      text: 'Сыры отличаются по жирности и плотности, поэтому лучше уточнить вид.',
      portionTip: 'Уточни: творожный, твердый, плавленый, легкий, фета, моцарелла или брынза.',
      clarifyOptions: ['твердый сыр', 'творожный сыр', 'плавленый сыр', 'легкий сыр', 'моцарелла'],
    },
    {
      names: ['йогурт'],
      status: 'Уточни продукт',
      tone: 'amber',
      text: 'Натуральный йогурт и сладкий питьевой йогурт считаются по-разному.',
      portionTip: 'Уточни: греческий без сахара, натуральный, питьевой или сладкий йогурт.',
      clarifyOptions: ['греческий йогурт', 'натуральный йогурт', 'питьевой йогурт', 'сладкий йогурт'],
    },
    {
      names: ['хлеб'],
      status: 'Уточни продукт',
      tone: 'amber',
      text: 'Хлеб и хлебцы лучше учитывать, но вид продукта помогает дать точнее совет.',
      portionTip: 'Уточни: белый, ржаной, цельнозерновой, лаваш, тортилья или хлебцы.',
      clarifyOptions: ['белый хлеб', 'ржаной хлеб', 'цельнозерновой хлеб', 'лаваш', 'хлебцы'],
    },
    {
      names: ['соус', 'заправка'],
      status: 'Уточни продукт',
      tone: 'amber',
      text: 'Соусы бывают легкими и очень калорийными, особенно на масле, сливках или майонезе.',
      portionTip: 'Уточни: майонез, кетчуп, сметанный, сливочный, соевый, песто или масляная заправка.',
      clarifyOptions: ['майонез', 'кетчуп', 'соевый соус', 'песто', 'сливочный соус'],
    },
    {
      names: ['каша'],
      status: 'Уточни продукт',
      tone: 'amber',
      text: 'Каша почти всегда идет в учет, но крупа и добавки влияют на итог.',
      portionTip: 'Уточни: овсянка, гречка, рисовая, пшенная, манная или каша на молоке.',
      clarifyOptions: ['овсянка', 'гречка', 'рисовая каша', 'пшенная каша', 'манная каша'],
    },
    {
      names: ['огурец', 'огурцы', 'помидор', 'помидоры', 'томат', 'томаты', 'черри', 'сельдерей', 'кабачок', 'кабачки', 'цукини', 'капуста', 'брокколи', 'цветная капуста', 'пекинская капуста', 'брюссельская капуста', 'руккола', 'салат', 'айсберг', 'романо', 'латук', 'шпинат', 'зелень', 'укроп', 'петрушка', 'кинза', 'базилик', 'зеленый лук', 'лук зеленый', 'щавель', 'спаржа', 'редис', 'редиска', 'дайкон', 'баклажан', 'баклажаны', 'перец', 'болгарский перец', 'чили', 'грибы', 'шампиньоны', 'вешенки', 'лисички', 'белые грибы', 'опята'],
      status: 'Можно не считать',
      tone: 'green',
      text: 'Много воды и клетчатки, мало калорий. Такие продукты обычно не ломают рацион.',
      portionTip: 'Если добавляешь масло, сметану или соус — учитывай именно добавку.',
    },
    {
      names: ['лук', 'репчатый лук', 'чеснок', 'морская капуста', 'ламинария', 'квашеная капуста', 'соленые огурцы', 'маринованные огурцы', 'маринованные грибы', 'кимчи'],
      status: 'Можно не считать',
      tone: 'green',
      text: 'Обычно это небольшая добавка к блюду, а не главный источник энергии.',
      portionTip: 'Если продукт в масле, сахарном маринаде или сливочном соусе — учитывай добавку.',
    },
    {
      names: ['картофель', 'картошка', 'картоха', 'картофельное пюре', 'пюре', 'батат', 'сладкий картофель', 'кукуруза', 'горошек', 'зеленый горошек', 'свекла', 'вареная свекла', 'морковь', 'вареная морковь', 'тыква', 'пастернак'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Это уже плотный источник энергии: крахмал и сладкие овощи заметно влияют на рацион.',
      portionTip: 'Оставь продукт в рационе, но внеси его как отдельную часть приема пищи.',
    },
    {
      names: ['фасоль', 'бобы', 'бобовые', 'чечевица', 'нут', 'горох', 'маш', 'эдмаме', 'соя', 'соевые бобы', 'тофу', 'темпе', 'хумус', 'фалафель'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Бобовые полезные и сытные, но дают заметную энергию и углеводы.',
      portionTip: 'Считай как гарнир или белково-углеводную часть блюда.',
    },
    {
      names: ['рис', 'бурый рис', 'коричневый рис', 'дикий рис', 'басмати', 'жасмин', 'гречка', 'греча', 'гречневая каша', 'овсянка', 'овес', 'геркулес', 'перловка', 'булгур', 'кус-кус', 'кускус', 'киноа', 'пшено', 'полба', 'ячка', 'ячневая крупа', 'манка', 'манная каша', 'кукурузная крупа', 'рисовая каша', 'пшенная каша'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Крупы и каши — нормальная база рациона, но их нужно учитывать.',
      portionTip: 'Особенно если добавляешь молоко, масло, сахар, мед или сухофрукты.',
    },
    {
      names: ['макароны', 'паста', 'спагетти', 'пенне', 'фузилли', 'лапша', 'удон', 'соба', 'рисовая лапша', 'фунчоза', 'ньокки', 'равиоли', 'пельмени', 'вареники', 'хинкали', 'манты'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Мучные блюда и паста быстро набирают калории за счет теста и соусов.',
      portionTip: 'Учитывай само блюдо и отдельно жирный соус, сыр или масло.',
    },
    {
      names: ['белый хлеб', 'батон', 'багет', 'ржаной хлеб', 'бородинский хлеб', 'цельнозерновой хлеб', 'тост', 'тосты', 'лаваш', 'пита', 'тортилья', 'хлебцы', 'крекер', 'крекеры', 'сухари', 'сушки', 'баранки'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Хлеб и хлебные продукты — заметный источник углеводов.',
      portionTip: 'Считай порцию, особенно если сверху масло, сыр, паста или соус.',
    },
    {
      names: ['курица', 'куриная грудка', 'куриное филе', 'куриные бедра', 'куриное бедро', 'индейка', 'филе индейки', 'говядина', 'телятина', 'свинина', 'баранина', 'фарш', 'говяжий фарш', 'куриный фарш', 'котлета', 'котлеты', 'стейк', 'ветчина', 'бекон', 'колбаса', 'сосиски', 'сардельки'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Белковые продукты полезны, но жирность и способ приготовления сильно меняют калорийность.',
      portionTip: 'Считай продукт, а масло, панировку и жирные соусы добавляй отдельно.',
    },
    {
      names: ['рыба', 'лосось', 'семга', 'форель', 'тунец', 'треска', 'хек', 'минтай', 'дорадо', 'сибас', 'скумбрия', 'сельдь', 'сардина', 'икра', 'креветки', 'кальмар', 'мидии', 'осьминог', 'краб', 'морепродукты'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Рыба и морепродукты отлично подходят рациону, но жирные виды и икра плотнее по калориям.',
      portionTip: 'Считай порцию, особенно если продукт в масле, сливочном соусе или панировке.',
    },
    {
      names: ['яйцо', 'яйца', 'белок яйца', 'яичный белок', 'желток', 'омлет', 'яичница', 'скрэмбл'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Яйца — хороший белковый продукт, но желток и масло добавляют энергию.',
      portionTip: 'Считай яйца и отдельно масло, сыр или сливки, если они есть в блюде.',
    },
    {
      names: ['творог', 'мягкий творог', 'зерненый творог', 'творог 0', 'творог 2', 'творог 5', 'творог 9', 'греческий йогурт', 'натуральный йогурт', 'йогурт без сахара', 'кефир', 'ряженка', 'молоко', 'соевое молоко', 'миндальное молоко', 'протеиновый йогурт', 'протеин'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Молочные и белковые продукты помогают добрать белок, но их жирность и добавки важны.',
      portionTip: 'Выбирай вариант без сахара, а сладкие наполнители считай отдельно.',
    },
    {
      names: ['сладкий йогурт', 'питьевой йогурт', 'йогурт с сахаром', 'сырок', 'творожный сырок', 'глазированный сырок', 'творожная масса', 'молочный коктейль', 'сгущенка', 'сгущенное молоко'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Молочные продукты с сахаром часто выглядят как перекус, но работают как десерт.',
      portionTip: 'Считай порцию и проверяй сахар в составе.',
    },
    {
      names: ['твердый сыр', 'пармезан', 'чеддер', 'гауда', 'российский сыр', 'творожный сыр', 'крем сыр', 'сливочный сыр', 'плавленый сыр', 'моцарелла', 'фета', 'брынза', 'сулугуни', 'рикотта', 'маскарпоне', 'легкий сыр'],
      status: 'Нужно считать',
      tone: 'amber',
      text: 'Сыр вкусный и белковый, но чаще всего плотный по жирам.',
      portionTip: 'Считай как отдельную добавку, даже если это немного сыра в салате или пасте.',
    },
    {
      names: ['авокадо', 'оливки', 'маслины', 'орехи', 'миндаль', 'грецкий орех', 'грецкие орехи', 'фундук', 'кешью', 'арахис', 'фисташки', 'кедровые орехи', 'семечки', 'семена', 'семена чиа', 'чиа', 'лен', 'семена льна', 'кунжут', 'тыквенные семечки', 'арахисовая паста', 'ореховая паста', 'тахини', 'урбеч'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Полезные жиры легко перебрать: маленькая порция может дать много энергии.',
      portionTip: 'Не убирай продукт, просто считай порцию внимательнее.',
    },
    {
      names: ['сливочное масло', 'масло сливочное', 'оливковое масло', 'подсолнечное масло', 'кокосовое масло', 'масло авокадо', 'кунжутное масло', 'льняное масло', 'топленое масло', 'гхи', 'кхи', 'маргарин'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Любое масло — концентрированный жир, даже если оно полезное.',
      portionTip: 'Учитывай добавку отдельно: масло быстро меняет калорийность блюда.',
    },
    {
      names: ['майонез', 'кетчуп', 'песто', 'соевый соус', 'терияки', 'барбекю соус', 'сырный соус', 'сливочный соус', 'сметанный соус', 'цезарь соус', 'бальзамический соус', 'салатная заправка', 'горчица', 'сметана', 'сливки'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Соусы и заправки часто незаметно добавляют жиры, сахар или соль.',
      portionTip: 'Считай соус отдельно, особенно если он на майонезе, масле, сливках или сахаре.',
    },
    {
      names: ['банан', 'виноград', 'хурма', 'манго', 'ананас', 'груша', 'дыня', 'арбуз', 'яблоко', 'апельсин', 'мандарин', 'грейпфрут', 'киви', 'персик', 'нектарин', 'абрикос', 'слива', 'гранат', 'инжир', 'кокос'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Фрукты полезнее сладостей, но это тоже энергия и углеводы.',
      portionTip: 'Считай сладкие фрукты и большие порции, особенно бананы, виноград, манго и хурму.',
    },
    {
      names: ['клубника', 'малина', 'голубика', 'черника', 'ежевика', 'смородина', 'клюква', 'брусника', 'вишня', 'черешня', 'крыжовник', 'облепиха'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Ягоды обычно легче десертов, но в больших порциях тоже дают углеводы.',
      portionTip: 'Если ягод немного и без сахара — спокойно; варенье и сироп считай отдельно.',
    },
    {
      names: ['финики', 'изюм', 'курага', 'чернослив', 'сушеные фрукты', 'сухофрукты', 'цукаты', 'банановые чипсы', 'яблочные чипсы'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Сухофрукты очень концентрированные: сладость и калории набегают быстро.',
      portionTip: 'Считай даже небольшую горсть.',
    },
    {
      names: ['шоколад', 'конфета', 'конфеты', 'печенье', 'торт', 'пирожное', 'кекс', 'маффин', 'круассан', 'булочка', 'пончик', 'вафли', 'мороженое', 'зефир', 'мармелад', 'пастила', 'мед', 'варенье', 'джем', 'сахар', 'сироп', 'гранола', 'мюсли'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Сладкое и выпечка быстро дают энергию и часто не насыщают надолго.',
      portionTip: 'Можно оставить в рационе, но лучше считать порцию честно.',
    },
    {
      names: ['чипсы', 'сухарики', 'попкорн', 'начос', 'картофель фри', 'фри', 'бургер', 'пицца', 'шаурма', 'ролл', 'сэндвич', 'бутерброд', 'хот дог', 'наггетсы', 'панировка', 'фастфуд'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Фастфуд и снеки обычно состоят из теста, масла, соусов и соли.',
      portionTip: 'Лучше считать целиком как готовое блюдо, а не по одному ингредиенту.',
    },
    {
      names: ['сок', 'апельсиновый сок', 'яблочный сок', 'томатный сок', 'морс', 'компот', 'лимонад', 'газировка', 'кола', 'энергетик', 'сладкий чай', 'кофе с сиропом', 'латте с сиропом', 'какао'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Сладкие напитки легко выпить незаметно, но они тоже дают энергию.',
      portionTip: 'Считай напиток, если там есть сахар, сок, сироп, молоко или сливки.',
    },
    {
      names: ['вода', 'минеральная вода', 'чай без сахара', 'кофе без сахара', 'эспрессо', 'американо', 'зеленый чай', 'травяной чай'],
      status: 'Можно не считать',
      tone: 'green',
      text: 'Напиток без сахара, молока, сливок и сиропов почти не влияет на рацион.',
      portionTip: 'Если добавляешь молоко, сахар, мед или сироп — считай добавку.',
    },
    {
      names: ['вино', 'пиво', 'сидр', 'шампанское', 'просекко', 'коктейль', 'водка', 'виски', 'ром', 'джин', 'ликер', 'алкоголь'],
      status: 'Аккуратно',
      tone: 'rose',
      text: 'Алкоголь дает калории и часто усиливает желание перекусить.',
      portionTip: 'Считай напиток отдельно, особенно сладкие коктейли, пиво и ликеры.',
    },
  ];

  const search = document.querySelector('[data-food-search]');
  const result = document.querySelector('[data-food-result]');
  const library = document.querySelector('[data-material-library]');
  const reader = document.querySelector('[data-material-reader]');
  const materialTitle = document.querySelector('[data-material-title]');
  const backTop = document.querySelector('.back-top');
  const materialCards = [...document.querySelectorAll('[data-material-card]')];
  const materialPanels = [...document.querySelectorAll('[data-material-panel]')];
  const comingSoonMaterialIds = new Set(['swelling', 'cellulite', 'cycle-training', 'supplements']);
  const overeatingProtocolKey = 'ggc_material_overeating_cycle';
  const overeatingProtocol = document.querySelector('[data-overeating-protocol]');
  const overeatingInteractiveDisclosure = document.querySelector('[data-overeating-interactive-disclosure]');
  const overeatingFlow = document.querySelector('[data-overeating-flow]');
  const overeatingScreens = [...document.querySelectorAll('[data-overeating-screen]')];
  const overeatingStart = document.querySelector('[data-overeating-start]');
  const overeatingTypeButtons = [...document.querySelectorAll('[data-overeating-type]')];
  const overeatingReasonButtons = [...document.querySelectorAll('[data-overeating-reason]')];
  const overeatingTypeContext = document.querySelector('[data-overeating-type-context]');
  const overeatingPlanTitle = document.querySelector('[data-overeating-plan-title]');
  const overeatingPlanEvent = document.querySelector('[data-overeating-plan-event]');
  const overeatingPlanReason = document.querySelector('[data-overeating-plan-reason]');
  const overeatingPlanBody = document.querySelector('[data-overeating-plan-body]');
  const overeatingPlanNow = document.querySelector('[data-overeating-plan-now]');
  const overeatingPlanTomorrow = document.querySelector('[data-overeating-plan-tomorrow]');
  const overeatingPlanAvoid = document.querySelector('[data-overeating-plan-avoid]');
  const overeatingPlanChoice = document.querySelector('[data-overeating-plan-choice]');
  const overeatingComplete = document.querySelector('[data-overeating-complete]');
  const overeatingFinal = document.querySelector('[data-overeating-final]');
  const overeatingFinalTitle = document.querySelector('[data-overeating-final-title]');
  const overeatingFinalType = document.querySelector('[data-overeating-final-type]');
  const overeatingFinalReason = document.querySelector('[data-overeating-final-reason]');
  const overeatingFinalPlan = document.querySelector('[data-overeating-final-plan]');
  const overeatingFinalSupport = document.querySelector('[data-overeating-final-support]');
  const overeatingFinalBalance = document.querySelector('[data-overeating-final-balance]');
  const overeatingChecklist = document.querySelector('[data-overeating-checklist]');
  const overeatingChecklistIntro = document.querySelector('[data-overeating-checklist-intro]');
  const overeatingFinalHint = document.querySelector('[data-overeating-final-hint]');
  const overeatingChooseAgain = document.querySelector('[data-overeating-choose-again]');

  const overeatingTypes = {
    fastfood: {
      label: 'Фастфуд или доставка',
      title: 'Фастфуд не ломает неделю',
      event: 'Соль, жир и плотные углеводы могут дать тяжесть, жажду и задержку воды',
      body: 'Вес может временно подняться из-за воды и объема еды. Это не значит, что ты набрала жир за один прием',
      now: 'Остановись на этом приеме пищи, выпей воды и дай телу спокойно переварить еду',
      tomorrow: 'Сделай обычный завтрак с белком, добавь воду и спокойные шаги по самочувствию',
      avoid: 'Не урезать еду, не отрабатывать тренировкой и не вставать на весы утром',
    },
    sweets: {
      label: 'Сладкое',
      title: 'Сладкое не требует наказания',
      event: 'Быстрые углеводы могут усилить желание продолжить, особенно если до этого был голод или запрет',
      body: 'Может быть сонливость, жажда или скачок аппетита. Это нормальная реакция, а не провал',
      now: 'Закрой прием пищи, убери сладкое с глаз и переключись на спокойное действие без еды',
      tomorrow: 'Верни обычный завтрак с белком и углеводами, чтобы не запускать новую тягу',
      avoid: 'Не запрещать углеводы, не объявлять сахар врагом и не начинать день с голода',
    },
    night: {
      label: 'Ночной жор',
      title: 'Ночной срыв чаще про усталость',
      event: 'Ночью контроль ниже, а усталость и недоедание днем легко превращаются в сильную тягу',
      body: 'Утром может быть отек, тяжесть и чувство вины. Телу важнее восстановление, чем разбор до трех ночи',
      now: 'Останови анализ, почисти зубы и иди спать. Сон сейчас полезнее любых компенсаций',
      tomorrow: 'Запланируй регулярные приемы пищи и нормальный ужин, чтобы вечер не стал экзаменом на силу воли',
      avoid: 'Не пропускать завтрак, не ругать себя ночью и не пытаться срочно все исправить',
    },
    volume: {
      label: 'Переела до тяжести',
      title: 'Тяжесть пройдет без жестких мер',
      event: 'Срыв мог быть не про конкретный продукт, а про объем: тело получило больше еды, чем комфортно',
      body: 'Объем еды может дать растяжение, сонливость или тяжесть. Это временно и обычно проходит без вмешательства',
      now: 'Сделай паузу, расстегни давление на живот, выпей немного воды и при желании спокойно пройдись',
      tomorrow: 'Вернись к обычным порциям и ешь по голоду, без попытки компенсировать вчерашний объем',
      avoid: 'Не голодать, не пить слабительные и не делать тренировку через дискомфорт',
    },
    drinks: {
      label: 'Алкоголь или сладкие напитки',
      title: 'Напитки тоже часть рациона, но не катастрофа',
      event: 'Алкоголь и сладкие напитки дают калории, задержку воды и часто усиливают аппетит',
      body: 'На следующий день возможны отек, жажда, слабость и тяга к плотной еде',
      now: 'Остановись на воде, не продолжай добирать еду по инерции и дай телу восстановиться',
      tomorrow: 'Верни обычный режим, добавь воду, белок и мягкую активность без героизма',
      avoid: 'Не взвешиваться, не сушиться и не ставить жесткую тренировку как наказание',
    },
  };

  const overeatingReasons = {
    hunger: {
      label: 'Долго не ела',
      copy: 'Если долго не ела, тело закономерно тянет к быстрой и плотной энергии',
    },
    stress: {
      label: 'Стресс или усталость',
      copy: 'Стресс и усталость снижают контроль, поэтому еда становится быстрым способом выдохнуть',
    },
    restriction: {
      label: 'Слишком много запретов',
      copy: 'Чем жестче запрет, тем сильнее ощущение “уже сорвалась, можно продолжать”',
    },
    available: {
      label: 'Еда была под рукой',
      copy: 'Когда еда рядом и решение не подготовлено, мозг выбирает самый легкий сценарий',
    },
    social: {
      label: 'За компанию или на эмоциях',
      copy: 'Компания и эмоции легко сдвигают фокус с голода на автоматическое продолжение',
    },
  };

  const emptyOvereatingState = {
    completed: false,
    completedDate: '',
    expiresDate: '',
    bingeType: '',
    reason: '',
    chosenPlan: '',
    checkedItems: [],
  };

  const overeatingTypeChecklist = {
    fastfood: {
      firstMeal: 'На первый прием еды собери тарелку без “отработки”: яйца или творог + каша/хлеб + овощи.',
      hydration: 'Поставь воду рядом и выпей 1-2 стакана утром; соль после доставки чаще дает отек, а не “откат”.',
      plate: 'В обед добавь белок на выбор: курица, рыба, яйца, творог, йогурт без сахара или бобовые.',
      movement: 'Выбери 10-20 минут прогулки после еды или бытовую ходьбу, без тренировки “за бургер”.',
      bodyCheck: 'Не оценивай день по утреннему весу после соли: верни режим и посмотри динамику позже.',
    },
    sweets: {
      firstMeal: 'Начни день с еды, которая держит сытость: омлет/творог/йогурт + каша, хлеб или фрукт.',
      hydration: 'Выпей стакан воды утром и еще один рядом с кофе/чаем, чтобы не путать жажду с новой тягой.',
      plate: 'Оставь углеводы в 2-3 приемах: каша, рис, картофель, хлеб или фрукты вместо нового запрета.',
      movement: 'Сделай 10 минут прогулки или растяжки, чтобы переключиться, а не “сжечь сладкое”.',
      bodyCheck: 'Не оценивай себя по тяге к сладкому: сахар не враг, задача завтра — вернуться к ритму.',
    },
    night: {
      firstMeal: 'Не пропускай завтрак: творог с фруктом, яйца с хлебом или каша с йогуртом помогут не сорваться вечером.',
      hydration: 'Поставь стакан воды у кровати и второй утром; после ночной еды телу нужен спокойный старт.',
      plate: 'Запланируй ужин заранее: белок + гарнир, например рыба с картофелем или курица с рисом.',
      movement: 'Оставь только легкое движение: 10-15 минут прогулки днем или растяжка перед сном.',
      bodyCheck: 'Не разбирай себя ночью и не проверяй вес утром: сон и режим важнее срочного контроля.',
    },
    volume: {
      firstMeal: 'Первый прием сделай комфортным по объему: яйца/творог/йогурт + фрукт или небольшая порция каши.',
      hydration: 'Выпей воду маленькими порциями: стакан утром и стакан днем, без попытки “промыть” переедание.',
      plate: 'Верни обычную тарелку: белок + гарнир + овощи, например курица с рисом и салатом.',
      movement: 'Если есть тяжесть, выбери 10-20 минут спокойной ходьбы, без прыжков и жесткой тренировки.',
      bodyCheck: 'Не сравнивай утренний вес после большого объема еды: это не оценка прогресса.',
    },
    drinks: {
      firstMeal: 'На первый прием добавь белок и углеводы: яйца с хлебом, творог с фруктом или курица с картофелем.',
      hydration: 'Поставь бутылку воды рядом и выпей 2-3 стакана за утро маленькими порциями.',
      plate: 'В течение дня добавь соленое/жирное без крайностей: суп, рыба, яйца или йогурт + гарнир.',
      movement: 'Выбери мягкое восстановление: прогулка 10-15 минут, душ, растяжка, без “героической” тренировки.',
      bodyCheck: 'Не оценивай вес после алкоголя или сладких напитков: вода может задержаться, режим вернется.',
    },
  };

  const overeatingReasonChecklist = {
    hunger: {
      rhythm: 'Поставь минимум 3 точки еды завтра: завтрак, обед и ужин; перекус — йогурт, фрукт или творог.',
      environment: 'Заранее реши, что будет на обед: например курица/рыба/бобовые + рис/картофель/хлеб.',
      boundary: 'Не начинай день с урезания: голод был причиной срыва, поэтому завтра нужен регулярный ритм.',
    },
    stress: {
      rhythm: 'Упрости день: выбери 2 готовых приема еды, например творог с фруктом и курица с гарниром.',
      environment: 'Сделай паузу без еды на 5 минут: душ, дыхание, короткая прогулка или лечь раньше.',
      boundary: 'Не добавляй героизм: завтра задача восстановиться, а не доказывать дисциплину.',
    },
    restriction: {
      rhythm: 'Верни разрешение на базовую еду: каша, хлеб, картофель, рис или фрукт в 2-3 приемах.',
      environment: 'Запланируй один понятный вкусный элемент, например йогурт, фрукт или кусочек сладкого после еды.',
      boundary: 'Не запускай новый запрет “с понедельника”: запрет усиливает тягу, баланс держится гибкостью.',
    },
    available: {
      rhythm: 'Подготовь видимый вариант еды: яйца, творог, йогурт, курица или бобовые + хлеб/рис/фрукт.',
      environment: 'Убери триггеры с глаз: переложи сладкое/снеки в шкаф и поставь вперед воду или фрукт.',
      boundary: 'Не держи себя на силе воли весь день: среда должна помогать, а не проверять.',
    },
    social: {
      rhythm: 'Верни свой ритм с ближайшего приема еды: белок + гарнир, например рыба с картофелем или творог с фруктом.',
      environment: 'Если снова встреча, заранее выбери опору: вода рядом, пауза перед добавкой, один любимый продукт без гонки.',
      boundary: 'Не “отрабатывай” еду за компанию: социальная еда не отменяет твой общий прогресс.',
    },
  };

  function getOvereatingChecklist(typeKey, reasonKey) {
    const typeChecklist = overeatingTypeChecklist[typeKey];
    const reasonChecklist = overeatingReasonChecklist[reasonKey];
    if (!typeChecklist || !reasonChecklist) return [];

    return [
      { id: 'first-meal', text: typeChecklist.firstMeal },
      { id: 'hydration', text: typeChecklist.hydration },
      { id: 'protein-carbs', text: typeChecklist.plate },
      { id: 'reason-rhythm', text: reasonChecklist.rhythm },
      { id: 'movement-reset', text: `${typeChecklist.movement} ${reasonChecklist.environment}` },
      { id: 'no-punishment', text: `${typeChecklist.bodyCheck} ${reasonChecklist.boundary}` },
    ];
  }

  function materialIdFromHash() {
    if (typeof window === 'undefined') return '';
    return decodeURIComponent(window.location.hash.replace('#', ''));
  }

  function showLibrary() {
    library?.removeAttribute('hidden');
    if (reader) reader.hidden = true;
    backTop?.setAttribute('href', '#top');
    materialCards.forEach((card) => card.classList.remove('is-active'));
    materialPanels.forEach((panel) => {
      panel.hidden = true;
    });
  }

  function showMaterial(id, shouldScroll = true) {
    const activePanel = materialPanels.find((panel) => panel.dataset.materialPanel === id);
    if (!activePanel) {
      showLibrary();
      return;
    }

    if (library) library.hidden = true;
    if (reader) reader.hidden = false;

    materialPanels.forEach((panel) => {
      panel.hidden = panel !== activePanel;
    });

    materialCards.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.materialCard === id);
    });

    if (materialTitle) {
      materialTitle.textContent = activePanel.dataset.title || '';
    }

    backTop?.setAttribute('href', `#${id}`);

    if (shouldScroll && reader?.scrollIntoView) {
      reader.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    }
  }

  function syncMaterialFromHash(shouldScroll = false) {
    const id = materialIdFromHash();
    if (!id || id === 'materials') {
      showLibrary();
      return;
    }

    if (comingSoonMaterialIds.has(id)) {
      showLibrary();
      if (window.history?.replaceState) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
      return;
    }

    showMaterial(id, shouldScroll);
  }

  if (typeof window !== 'undefined') {
    syncMaterialFromHash(false);

    window.addEventListener('hashchange', () => {
      syncMaterialFromHash(true);
    });

    document.querySelector('[data-material-back]')?.addEventListener('click', () => {
      if (window.history?.pushState) {
        window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
      }
      showLibrary();
      library?.scrollIntoView?.({ behavior: scrollBehavior(), block: 'start' });
    });

    backTop?.addEventListener('click', (event) => {
      event.preventDefault();
      const activePanel = materialPanels.find((panel) => !panel.hidden);
      const target = activePanel || document.querySelector('#top');
      target?.scrollIntoView?.({ behavior: scrollBehavior(), block: 'start' });
    });
  }

  function scrollBehavior() {
    if (typeof window === 'undefined') return 'auto';
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  function todayStamp() {
    return dateStamp(new Date());
  }

  function tomorrowStamp() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStamp(tomorrow);
  }

  function dateStamp(date) {
    const now = date;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function readOvereatingState() {
    try {
      const saved = JSON.parse(localStorage.getItem(overeatingProtocolKey)) || {};
      const completedDate = typeof saved.completedDate === 'string' ? saved.completedDate : '';
      const expiresDate = typeof saved.expiresDate === 'string' ? saved.expiresDate : '';
      const bingeType = typeof saved.bingeType === 'string' ? saved.bingeType : '';
      const reason = typeof saved.reason === 'string' ? saved.reason : '';
      const chosenPlan = typeof saved.chosenPlan === 'string' ? saved.chosenPlan : '';
      const checkedItems = Array.isArray(saved.checkedItems)
        ? saved.checkedItems.filter((item) => typeof item === 'string')
        : [];
      const today = todayStamp();
      const isCompletedToday = Boolean(saved.completed)
        && Boolean(completedDate)
        && Boolean(expiresDate)
        && today <= expiresDate
        && Boolean(overeatingTypes[bingeType])
        && Boolean(overeatingReasons[reason])
        && Boolean(chosenPlan)
        && Array.isArray(saved.checkedItems);

      if (saved.completed && !isCompletedToday) {
        clearOvereatingState();
      }

      return {
        ...emptyOvereatingState,
        completed: isCompletedToday,
        completedDate: isCompletedToday ? completedDate : '',
        expiresDate: isCompletedToday ? expiresDate : '',
        bingeType: isCompletedToday ? bingeType : '',
        reason: isCompletedToday ? reason : '',
        chosenPlan: isCompletedToday ? chosenPlan : '',
        checkedItems: isCompletedToday ? checkedItems : [],
      };
    } catch {
      clearOvereatingState();
      return { ...emptyOvereatingState };
    }
  }

  function writeOvereatingState(state) {
    try {
      localStorage.setItem(overeatingProtocolKey, JSON.stringify(state));
    } catch {
      // The protocol still works without persistence if storage is blocked.
    }
  }

  function clearOvereatingState() {
    try {
      localStorage.removeItem(overeatingProtocolKey);
    } catch {
      // The protocol still works without persistence if storage is blocked.
    }
  }

  function setOvereatingScreen(screenName) {
    overeatingScreens.forEach((screen) => {
      const isActive = screen.dataset.overeatingScreen === screenName;
      if (isActive) {
        screen.hidden = false;
        requestAnimationFrame(() => {
          screen.classList.add('is-active');
        });
        return;
      }

      screen.classList.remove('is-active');
      window.setTimeout(() => {
        if (!screen.classList.contains('is-active')) screen.hidden = true;
      }, scrollBehavior() === 'smooth' ? 260 : 0);
    });
  }

  function activeOvereatingPlan(state) {
    const type = overeatingTypes[state.bingeType];
    const reason = overeatingReasons[state.reason];
    if (!type || !reason) return null;

    return {
      typeLabel: type.label,
      reasonLabel: reason.label,
      title: type.title,
      event: type.event,
      reason: reason.copy,
      body: type.body,
      now: type.now,
      tomorrow: type.tomorrow,
      avoid: type.avoid,
      checklist: getOvereatingChecklist(state.bingeType, state.reason),
      summary: `${type.label}: ${type.tomorrow}. ${type.avoid}`,
    };
  }

  function renderOvereatingChoiceTrail(target, plan) {
    if (!target) return;
    target.textContent = '';
    target.innerHTML = '';
    if (!plan) return;

    target.textContent = `Твой выбор ${plan.typeLabel} ${plan.reasonLabel}`;
    target.innerHTML = `
      <span>Твой выбор</span>
      <strong>${plan.typeLabel}</strong>
      <strong>${plan.reasonLabel}</strong>
    `;
  }

  function renderOvereatingChecklist(state, plan) {
    if (!overeatingChecklist) return;
    const checkedItems = new Set(state.checkedItems || []);
    const checklist = Array.isArray(plan?.checklist) ? plan.checklist : [];
    const checklistNodes = [];

    if (overeatingChecklistIntro) {
      checklistNodes.push(overeatingChecklistIntro);
    }

    checklist.forEach(({ id, text }) => {
      if (!id || !text) return;

      const label = document.createElement('label');
      label.className = 'overeating-next-checklist__item';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.overeatingCheck = id;
      input.checked = checkedItems.has(id);

      const textNode = document.createElement('span');
      textNode.textContent = text;

      label.append(input, textNode);
      checklistNodes.push(label);
    });

    overeatingChecklist.replaceChildren(...checklistNodes);
  }

  function renderOvereatingProtocol(state) {
    const plan = activeOvereatingPlan(state);
    const solutionCopy = state.chosenPlan || plan?.summary || '';
    const isComplete = Boolean(state.completed);
    const activeScreen = isComplete ? 'complete' : plan ? 'plan' : state.bingeType ? 'reason' : 'start';

    overeatingProtocol?.classList.toggle('is-complete', isComplete);
    overeatingProtocol?.setAttribute('data-overeating-state', activeScreen);
    if (isComplete && overeatingInteractiveDisclosure) overeatingInteractiveDisclosure.open = true;

    if (overeatingFlow) overeatingFlow.hidden = isComplete;
    if (overeatingFinal) overeatingFinal.hidden = !isComplete;
    if (overeatingFinalTitle) overeatingFinalTitle.textContent = 'Чек-лист готов';
    if (overeatingFinalType) overeatingFinalType.textContent = plan?.typeLabel || overeatingTypes[state.bingeType]?.label || '';
    if (overeatingFinalReason) overeatingFinalReason.textContent = plan?.reasonLabel || overeatingReasons[state.reason]?.label || '';
    if (overeatingFinalPlan) overeatingFinalPlan.textContent = solutionCopy ? `Фокус плана: ${solutionCopy}` : '';
    if (overeatingFinalSupport) overeatingFinalSupport.textContent = 'Один срыв не перечеркивает прогресс. Сейчас задача — вернуться к заботе, а не к наказанию.';
    if (overeatingFinalBalance) overeatingFinalBalance.textContent = '80/20: база и режим остаются опорой, гибкость не превращаем в чувство вины.';
    if (overeatingChecklistIntro) overeatingChecklistIntro.textContent = 'Мой чек-лист на завтра';
    if (overeatingFinalHint) overeatingFinalHint.textContent = 'План будет доступен до конца завтрашнего дня';
    if (overeatingTypeContext) overeatingTypeContext.textContent = overeatingTypes[state.bingeType]?.label || '';
    renderOvereatingChoiceTrail(overeatingPlanChoice, plan);
    if (overeatingPlanTitle) overeatingPlanTitle.textContent = plan?.title || '';
    if (overeatingPlanEvent) overeatingPlanEvent.textContent = plan?.event || '';
    if (overeatingPlanReason) overeatingPlanReason.textContent = plan?.reason || '';
    if (overeatingPlanBody) overeatingPlanBody.textContent = plan?.body || '';
    if (overeatingPlanNow) overeatingPlanNow.textContent = plan?.now || '';
    if (overeatingPlanTomorrow) overeatingPlanTomorrow.textContent = plan?.tomorrow || '';
    if (overeatingPlanAvoid) overeatingPlanAvoid.textContent = plan?.avoid || '';
    renderOvereatingChecklist(state, plan);

    overeatingTypeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.overeatingType === state.bingeType);
    });

    overeatingReasonButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.overeatingReason === state.reason);
    });

    if (isComplete) return;
    setOvereatingScreen(plan ? 'plan' : state.bingeType ? 'reason' : 'start');
  }

  let overeatingState = { ...emptyOvereatingState };

  function showOvereatingStep(screenName) {
    if (screenName === 'start') {
      overeatingState = { ...emptyOvereatingState };
      clearOvereatingState();
    } else if (screenName === 'type') {
      overeatingState = {
        ...emptyOvereatingState,
        bingeType: overeatingState.bingeType,
      };
      writeOvereatingState(overeatingState);
    } else if (screenName === 'reason') {
      overeatingState = {
        ...emptyOvereatingState,
        bingeType: overeatingState.bingeType,
      };
      writeOvereatingState(overeatingState);
    } else if (screenName === 'plan') {
      overeatingState = {
        ...overeatingState,
        completed: false,
        completedDate: '',
        expiresDate: '',
        checkedItems: [],
      };
      writeOvereatingState(overeatingState);
    }

    if (overeatingInteractiveDisclosure) overeatingInteractiveDisclosure.open = true;
    renderOvereatingProtocol(overeatingState);
    if (screenName !== 'plan' || activeOvereatingPlan(overeatingState)) {
      setOvereatingScreen(screenName);
      overeatingProtocol?.setAttribute('data-overeating-state', screenName);
    }
  }

  if (overeatingProtocol) {
    overeatingState = readOvereatingState();
    renderOvereatingProtocol(overeatingState);

    overeatingStart?.addEventListener('click', () => {
      overeatingState = { ...emptyOvereatingState };
      renderOvereatingProtocol(overeatingState);
      setOvereatingScreen('type');
      overeatingProtocol.setAttribute('data-overeating-state', 'type');
    });

    overeatingTypeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        overeatingState = {
          ...emptyOvereatingState,
          bingeType: button.dataset.overeatingType || '',
        };
        renderOvereatingProtocol(overeatingState);
      });
    });

    overeatingReasonButtons.forEach((button) => {
      button.addEventListener('click', () => {
        overeatingState = {
          ...overeatingState,
          reason: button.dataset.overeatingReason || '',
        };
        renderOvereatingProtocol(overeatingState);
      });
    });

    overeatingComplete?.addEventListener('click', () => {
      const plan = activeOvereatingPlan(overeatingState);
      if (!plan) return;

      overeatingState = {
        completed: true,
        completedDate: todayStamp(),
        expiresDate: tomorrowStamp(),
        bingeType: overeatingState.bingeType,
        reason: overeatingState.reason,
        chosenPlan: plan.summary,
        checkedItems: [],
      };
      writeOvereatingState(overeatingState);
      renderOvereatingProtocol(overeatingState);
    });

    overeatingChooseAgain?.addEventListener('click', () => {
      overeatingState = { ...emptyOvereatingState };
      clearOvereatingState();
      renderOvereatingProtocol(overeatingState);
    });

    overeatingProtocol.addEventListener('click', (event) => {
      const backButton = event.target?.closest?.('[data-overeating-back]')
        || (event.target?.dataset?.overeatingBack ? event.target : null);
      if (!backButton) return;

      event.preventDefault?.();
      showOvereatingStep(backButton.dataset.overeatingBack || 'start');
    });

    overeatingChecklist?.addEventListener('change', (event) => {
      const target = event.target;
      const id = target?.dataset?.overeatingCheck;
      if (!id) return;

      const activeChecklistIds = new Set(activeOvereatingPlan(overeatingState)?.checklist.map((item) => item.id) || []);
      const checkedItems = new Set((overeatingState.checkedItems || []).filter((item) => activeChecklistIds.has(item)));
      if (target.checked) {
        checkedItems.add(id);
      } else {
        checkedItems.delete(id);
      }

      overeatingState = {
        ...overeatingState,
        checkedItems: [...checkedItems],
      };
      writeOvereatingState(overeatingState);
      renderOvereatingProtocol(overeatingState);
    });
  }

  function writeState(value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  }

  function normalizeQuery(value) {
    return value
      .trim()
      .toLowerCase()
      .replaceAll('ё', 'е')
      .replace(/[^а-яa-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function findFood(query) {
    const normalized = normalizeQuery(query);
    if (!normalized) return null;
    const queryWords = normalized.split(' ').filter(Boolean);

    const normalizedItems = foodItems.map((item) => ({
      item,
      names: item.names.map((name) => normalizeQuery(name)),
    }));

    const exact = normalizedItems.find(({ names }) => names.includes(normalized));
    if (exact) return exact.item;

    const candidates = normalizedItems
      .map(({ item, names }) => {
        const matches = names
          .map((name) => {
            const nameWords = name.split(' ').filter(Boolean);
            const sameWords = nameWords.length > 1
              && nameWords.length === queryWords.length
              && nameWords.every((word) => queryWords.includes(word));
            const phraseMatch = name.length >= 3 && (name.includes(normalized) || normalized.includes(name));
            if (!sameWords && !phraseMatch) return null;

            return {
              length: name.length,
              score: (sameWords ? 1000 : 0) + nameWords.length * 100 + name.length,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);

        return matches[0] ? { item, ...matches[0] } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || b.length - a.length);

    return candidates[0]?.item || null;
  }

  function cleanVisualCopy(value) {
    return String(value || '')
      .replace(/\.(?=\s+[А-ЯЁA-Z])/g, ',')
      .replace(/[.!?]+$/g, '');
  }

  function renderFoodResult({ status, text, portionTip, tone = 'neutral' }) {
    result.className = `guide-result scanner-result guide-result--${tone}`;
    result.innerHTML = `
      <span class="scanner-result__status" data-food-status>${cleanVisualCopy(status)}</span>
      <span class="scanner-result__advice" data-food-advice>${cleanVisualCopy(text)}</span>
      <span class="scanner-result__tip" data-food-tip>${cleanVisualCopy(portionTip)}</span>
    `;
  }

  function renderFood(query) {
    if (!result) return;

    const item = findFood(query);
    if (!query.trim()) {
      renderFoodResult({
        status: '',
        text: 'Фудсканер подскажет: считать, не считать или быть аккуратнее.',
        portionTip: 'Совет появится здесь.',
      });
      return;
    }

    if (!item) {
      renderFoodResult({
        status: 'Лучше считать',
        text: 'Фудсканер не распознал продукт точно, поэтому безопаснее учесть его в рационе.',
        portionTip: 'Если это овощ без масла и соуса — можно расслабиться; если продукт плотный, сладкий или жирный — считай.',
      });
      return;
    }

    renderFoodResult(item);
  }

  const saved = readState();
  if (search && saved.query) {
    search.value = saved.query;
    renderFood(saved.query);
  }

  search?.addEventListener('input', () => {
    renderFood(search.value);
    writeState({ query: search.value });
  });
});
