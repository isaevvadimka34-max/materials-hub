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
  const materialsHub = document.querySelector('.materials-hub');
  const library = document.querySelector('[data-material-library]');
  const reader = document.querySelector('[data-material-reader]');
  const materialTitle = document.querySelector('[data-material-title]');
  const backTop = document.querySelector('.back-top');
  const materialCards = [...document.querySelectorAll('[data-material-card]')];
  const materialPanels = [...document.querySelectorAll('[data-material-panel]')];
  const comingSoonMaterialIds = new Set(['cycle-training']);
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
  const celluliteStorageKey = 'ggc-material-cellulite-progress-v1';
  const celluliteWaterWeight = document.querySelector('[data-cellulite-water-weight]');
  const celluliteWaterResult = document.querySelector('[data-cellulite-water-result]');
  const celluliteFactorButtons = [...document.querySelectorAll('[data-cellulite-factor]')];
  const celluliteFactorResult = document.querySelector('[data-cellulite-factor-result]');
  const celluliteProgress = document.querySelector('[data-cellulite-progress]');
  const celluliteProgressChecks = [...document.querySelectorAll('[data-cellulite-progress] input[type="checkbox"]')];
  const celluliteProgressValues = new Set(celluliteProgressChecks.map((input) => input.value));
  const celluliteProgressSummary = document.querySelector('[data-cellulite-progress-summary]');
  const celluliteReset = document.querySelector('[data-cellulite-reset]');
  const copyArticleButtons = [...document.querySelectorAll('[data-copy-article]')];
  const copyStatus = document.querySelector('[data-copy-status]');
  const swellingTrackerStorageKey = 'ggc_material_swelling_tracker_v1';
  const swellingTracker = document.querySelector('[data-swelling-tracker]');
  const swellingTodayDate = swellingTracker?.querySelector('[data-swelling-today-date]');
  const swellingStart = swellingTracker?.querySelector('[data-swelling-start]');
  const swellingStartPanel = swellingTracker?.querySelector('[data-swelling-start-panel]');
  const swellingWorkspace = swellingTracker?.querySelector('[data-swelling-workspace]');
  const swellingForm = swellingTracker?.querySelector('[data-swelling-form]');
  const swellingViews = [...(swellingTracker?.querySelectorAll('[data-swelling-step]') || [])];
  const swellingNoticeInputs = [...(swellingTracker?.querySelectorAll('[data-swelling-notice]') || [])];
  const swellingFactorInputs = [...(swellingTracker?.querySelectorAll('[data-swelling-factor]') || [])];
  const swellingWaterInputs = [...(swellingTracker?.querySelectorAll('[data-swelling-water]') || [])];
  const swellingFeelingInputs = [...(swellingTracker?.querySelectorAll('[data-swelling-feeling]') || [])];
  const swellingProgress = swellingTracker?.querySelector('[data-swelling-progress]');
  const swellingQuestionProgress = swellingTracker?.querySelector('[data-swelling-question-progress]');
  const swellingDayProgress = swellingTracker?.querySelector('[data-swelling-day-progress]');
  const swellingFactorCount = swellingTracker?.querySelector('[data-swelling-factor-counter]');
  const swellingFactorHint = swellingTracker?.querySelector('[data-swelling-factor-hint]');
  const swellingErrors = [...(swellingTracker?.querySelectorAll('[data-swelling-step-error]') || [])];
  const swellingStatus = swellingTracker?.querySelector('[data-swelling-status]');
  const swellingStorageWarning = swellingTracker?.querySelector('[data-swelling-storage-warning]');
  const swellingDayResult = swellingTracker?.querySelector('[data-swelling-day-result]');
  const swellingSummary = swellingTracker?.querySelector('[data-swelling-summary]');
  const swellingBackButtons = [...(swellingTracker?.querySelectorAll('[data-swelling-back]') || [])];
  const swellingNextButtons = [...(swellingTracker?.querySelectorAll('[data-swelling-next]') || [])];
  const swellingSubmit = swellingTracker?.querySelector('[data-swelling-save]');

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
    materialsHub?.classList.remove('is-reading-material');
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
    materialsHub?.classList.add('is-reading-material');

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

  const swellingOptionCopy = {
    notice: {
      face: 'лицо или область глаз',
      hands: 'кольца или кисти',
      legs: 'следы от носков или тяжесть в ногах',
      bloating: 'вздутие живота',
      appearance: 'изменение веса или внешнего вида',
      none: 'ничего необычного',
    },
    factor: {
      'hard-training': 'тяжёлая тренировка',
      'regular-training': 'обычная тренировка',
      cycle: 'ПМС или первые дни цикла',
      'salty-food': 'солёная еда',
      alcohol: 'алкоголь',
      heat: 'жара',
      sitting: 'дорога или долгое сидение',
      'low-sleep': 'мало сна',
      stress: 'напряжённый день',
      routine: 'привычный режим',
    },
    water: {
      less: 'меньше обычного',
      usual: 'примерно как обычно',
      more: 'больше обычного',
      unknown: 'не отслеживала',
    },
    feeling: {
      usual: 'обычное',
      heavy: 'чувствую тяжесть',
      'under-recovered': 'плохо восстановилась',
      pain: 'есть необычная боль или резкое ухудшение',
    },
  };

  const swellingHabitCopy = {
    'hard-training': 'Следи за восстановлением после тяжёлых тренировок и не добавляй кардио ради воды',
    'regular-training': 'Продолжай программу и оценивай изменения в динамике',
    cycle: 'Не оценивай форму по этим дням и сравнивай состояние в других фазах цикла',
    'salty-food': 'Не исключай соль полностью — вернись к обычному рациону и оцени ощущения',
    alcohol: 'Возвращай обычный режим еды, воды и сна без голодания и компенсаций',
    heat: 'Учитывай температуру, ориентируйся на жажду и не добавляй нагрузку сверх программы',
    sitting: 'Добавляй лёгкую ходьбу или короткую разминку после долгого сидения',
    'low-sleep': 'Понаблюдай, как тело реагирует после нормального сна',
    stress: 'В напряжённые дни сохраняй обычную еду, воду, сон и нагрузку по программе',
    routine: 'Сохраняй стабильный режим и сравнивай несколько дней',
  };

  const swellingDefaultHabits = [
    'Сохраняй обычное питание без компенсаций',
    'Пей в привычном режиме без крайностей',
    'Следуй программе и оценивай изменения в динамике',
  ];

  const swellingWaterActionCopy = {
    less: 'Постепенно возвращайся к привычному питьевому режиму, не пытаясь наверстать всё сразу',
    usual: 'Оставь привычный питьевой режим без резких изменений',
    more: 'Не увеличивай воду специально. Вернись к обычному режиму и ориентируйся на жажду',
    unknown: 'Вернись к привычному режиму воды без строгого контроля',
  };

  function formatSwellingDate(stamp) {
    const date = new Date(`${stamp}T12:00:00`);
    if (!Number.isFinite(date.getTime())) return '';
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
  }

  function swellingInputValue(input, type) {
    const dataValue = input?.dataset?.[`swelling${type[0].toUpperCase()}${type.slice(1)}`];
    return dataValue || input?.value || '';
  }

  function uniqueKnownValues(values, type, limit = Infinity) {
    return [...new Set(values)]
      .filter((value) => Object.hasOwn(swellingOptionCopy[type], value))
      .slice(0, limit);
  }

  const swellingSteps = ['start', 'question-1', 'question-2', 'question-3', 'question-4', 'day-result', 'final-result'];
  const swellingQuestionSteps = swellingSteps.slice(1, 5);
  let swellingMemoryState = null;
  let swellingStorageAvailable = true;

  function emptySwellingDraft(dayIndex = 1) {
    return {
      date: todayStamp(),
      dayIndex,
      answers: {
        changes: [],
        factors: [],
        water: null,
        feeling: null,
      },
    };
  }

  function emptySwellingState() {
    return {
      version: 2,
      records: [],
      draft: emptySwellingDraft(),
      currentStep: 'start',
      startedAt: null,
      completedAt: null,
    };
  }

  function dayDistance(fromStamp, toStamp) {
    const from = new Date(`${fromStamp}T00:00:00`);
    const to = new Date(`${toStamp}T00:00:00`);
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) return 0;
    return Math.floor((to.getTime() - from.getTime()) / 86400000);
  }

  function validSwellingDate(value) {
    return typeof value === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(value)
      && Number.isFinite(new Date(`${value}T12:00:00`).getTime());
  }

  function normalizeSwellingRecord(entry, index = 0) {
    if (!entry || !validSwellingDate(entry.date)) return null;

    const sourceChanges = Array.isArray(entry.changes) ? entry.changes : entry.notices;
    const changes = uniqueKnownValues(Array.isArray(sourceChanges) ? sourceChanges : [], 'notice');
    const factors = uniqueKnownValues(Array.isArray(entry.factors) ? entry.factors : [], 'factor', 3);
    const water = Object.hasOwn(swellingOptionCopy.water, entry.water) ? entry.water : '';
    const feeling = Object.hasOwn(swellingOptionCopy.feeling, entry.feeling) ? entry.feeling : '';
    if (!changes.length || !factors.length || !water || !feeling) return null;

    return {
      id: typeof entry.id === 'string' && entry.id ? entry.id : `swelling-${entry.date}-${index + 1}`,
      date: entry.date,
      dayIndex: Number.isInteger(entry.dayIndex) ? Math.min(Math.max(entry.dayIndex, 1), 3) : index + 1,
      changes: changes.includes('none') ? ['none'] : changes,
      factors,
      water,
      feeling,
      createdAt: typeof entry.createdAt === 'string' && entry.createdAt
        ? entry.createdAt
        : `${entry.date}T12:00:00.000Z`,
    };
  }

  function normalizeSwellingDraft(savedDraft, records) {
    const dayIndex = Math.min(records.length + 1, 3);
    const sourceAnswers = savedDraft?.answers || savedDraft || {};
    const sourceChanges = Array.isArray(sourceAnswers.changes) ? sourceAnswers.changes : sourceAnswers.notices;
    const changes = uniqueKnownValues(Array.isArray(sourceChanges) ? sourceChanges : [], 'notice');
    return {
      date: validSwellingDate(savedDraft?.date) ? savedDraft.date : todayStamp(),
      dayIndex: Number.isInteger(savedDraft?.dayIndex)
        ? Math.min(Math.max(savedDraft.dayIndex, 1), 3)
        : dayIndex,
      answers: {
        changes: changes.includes('none') ? ['none'] : changes,
        factors: uniqueKnownValues(Array.isArray(sourceAnswers.factors) ? sourceAnswers.factors : [], 'factor', 3),
        water: Object.hasOwn(swellingOptionCopy.water, sourceAnswers.water) ? sourceAnswers.water : null,
        feeling: Object.hasOwn(swellingOptionCopy.feeling, sourceAnswers.feeling) ? sourceAnswers.feeling : null,
      },
    };
  }

  function normalizeSwellingState(saved) {
    const recordsByDate = new Map();
    const sourceRecords = Array.isArray(saved?.records)
      ? saved.records
      : Array.isArray(saved?.entries) ? saved.entries : [];
    sourceRecords.forEach((sourceRecord, index) => {
      const record = normalizeSwellingRecord(sourceRecord, index);
      if (record) recordsByDate.set(record.date, record);
    });

    const records = [...recordsByDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
      .map((record, index) => ({ ...record, dayIndex: index + 1 }));
    const draft = normalizeSwellingDraft(saved?.draft, records);
    const todayRecord = records.find((record) => record.date === todayStamp());
    const hasSavedStep = swellingSteps.includes(saved?.currentStep);
    let currentStep = hasSavedStep
      ? saved.currentStep
      : todayRecord ? 'day-result' : 'start';

    if (records.length === 3) {
      currentStep = 'final-result';
    } else if (swellingQuestionSteps.includes(currentStep) && draft.date !== todayStamp()) {
      currentStep = 'start';
    } else if (currentStep === 'day-result' && !todayRecord) {
      currentStep = 'start';
    } else if (currentStep === 'final-result') {
      currentStep = 'start';
    }

    return {
      version: 2,
      records,
      draft,
      currentStep,
      startedAt: validSwellingDate(saved?.startedAt) ? saved.startedAt : records[0]?.date || null,
      completedAt: records.length === 3
        ? (validSwellingDate(saved?.completedAt) ? saved.completedAt : records[2].date)
        : null,
    };
  }

  function readSwellingState() {
    let saved = swellingMemoryState || emptySwellingState();
    try {
      const stored = localStorage.getItem(swellingTrackerStorageKey);
      if (stored) saved = JSON.parse(stored);
    } catch {
      swellingStorageAvailable = false;
    }

    let state = normalizeSwellingState(saved);

    const expired = state.records.length > 0
      && state.records.length < 3
      && dayDistance(state.startedAt, todayStamp()) >= 7;
    if (!expired) {
      swellingMemoryState = state;
      return { state, wasReset: false };
    }

    state = emptySwellingState();
    writeSwellingState(state);
    return { state, wasReset: true };
  }

  function writeSwellingState(state) {
    const normalized = normalizeSwellingState(state);
    swellingMemoryState = normalized;
    try {
      localStorage.setItem(swellingTrackerStorageKey, JSON.stringify(normalized));
    } catch {
      swellingStorageAvailable = false;
    }
    renderSwellingStorageWarning();
    return normalized;
  }

  function renderSwellingStorageWarning() {
    const message = swellingStorageAvailable
      ? ''
      : 'Не удалось сохранить ответы в браузере. Трекер продолжит работать в этой вкладке';
    if (swellingStorageWarning) {
      swellingStorageWarning.hidden = swellingStorageAvailable;
      swellingStorageWarning.textContent = message;
    } else if (!swellingStorageAvailable && swellingStatus) {
      swellingStatus.textContent = message;
    }
  }

  function setSwellingStatus(message) {
    if (swellingStatus) swellingStatus.textContent = message;
  }

  function setSwellingError(message = '', step = '') {
    swellingErrors.forEach((error) => {
      const matches = !step || error.dataset.swellingStepError === step;
      error.hidden = !message || !matches;
      if (matches && message) error.textContent = message;
    });
  }

  function setSwellingInputChecked(input, isChecked) {
    input.checked = isChecked;
    input.closest('label')?.classList.toggle('is-active', isChecked);
  }

  function clearSwellingForm() {
    [...swellingNoticeInputs, ...swellingFactorInputs, ...swellingWaterInputs, ...swellingFeelingInputs]
      .forEach((input) => setSwellingInputChecked(input, false));
  }

  function fillSwellingForm(draft) {
    clearSwellingForm();
    if (!draft) return;

    const selected = {
      notice: new Set(draft.answers.changes),
      factor: new Set(draft.answers.factors),
      water: new Set([draft.answers.water]),
      feeling: new Set([draft.answers.feeling]),
    };

    [
      ['notice', swellingNoticeInputs],
      ['factor', swellingFactorInputs],
      ['water', swellingWaterInputs],
      ['feeling', swellingFeelingInputs],
    ].forEach(([type, inputs]) => {
      inputs.forEach((input) => {
        setSwellingInputChecked(input, selected[type].has(swellingInputValue(input, type)));
      });
    });
  }

  function selectedSwellingValues(inputs, type) {
    return inputs
      .filter((input) => input.checked)
      .map((input) => swellingInputValue(input, type));
  }

  function readSwellingDraft(dayIndex = 1) {
    return {
      date: todayStamp(),
      dayIndex,
      answers: {
        changes: selectedSwellingValues(swellingNoticeInputs, 'notice'),
        factors: selectedSwellingValues(swellingFactorInputs, 'factor'),
        water: selectedSwellingValues(swellingWaterInputs, 'water')[0] || null,
        feeling: selectedSwellingValues(swellingFeelingInputs, 'feeling')[0] || null,
      },
    };
  }

  function createSwellingElement(tagName, className, textValue = '') {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textValue) element.textContent = textValue;
    return element;
  }

  function renderSwellingList(items, className) {
    const list = createSwellingElement('ul', className);
    items.forEach((item) => list.append(createSwellingElement('li', '', item)));
    return list;
  }

  function renderSwellingProgress(state) {
    const questionNumber = swellingQuestionSteps.indexOf(state.currentStep) + 1;
    const dayIndex = Math.min(state.records.length + (state.records.some((record) => record.date === todayStamp()) ? 0 : 1), 3);
    if (swellingQuestionProgress) {
      swellingQuestionProgress.textContent = questionNumber ? `Вопрос ${questionNumber} из 4` : '';
    }
    if (swellingDayProgress) {
      swellingDayProgress.textContent = state.currentStep === 'final-result'
        ? 'Записи 3 из 3 готовы'
        : `День ${Math.max(dayIndex, 1)} из 3`;
    }

    if (!swellingProgress) return;
    let segments = [...swellingProgress.querySelectorAll('[data-swelling-progress-segment]')];
    if (!segments.length) {
      segments = Array.from({ length: 3 }, (_, index) => {
        const segment = createSwellingElement('span', 'swelling-tracker__progress-segment');
        segment.dataset.swellingProgressSegment = String(index + 1);
        swellingProgress.append(segment);
        return segment;
      });
    }

    segments.forEach((segment, index) => {
      const isComplete = index < state.records.length;
      segment.classList.toggle('is-complete', isComplete);
      segment.setAttribute('aria-hidden', 'true');
    });
    swellingProgress.setAttribute('aria-label', `${state.records.length} из 3 записей готовы`);
  }

  function joinSwellingLabels(labels) {
    if (labels.length === 1) return labels[0];
    return `${labels.slice(0, -1).join(', ')} и ${labels.at(-1)}`;
  }

  function entryFactorPhrase(entry) {
    return joinSwellingLabels(entry.factors.map((factor) => swellingOptionCopy.factor[factor]));
  }

  function entryChangePhrase(entry) {
    return joinSwellingLabels(entry.changes.map((change) => swellingOptionCopy.notice[change]));
  }

  function createSwellingSection(title, content, className = '') {
    const section = createSwellingElement('section', `swelling-tracker__result-section ${className}`.trim());
    section.append(createSwellingElement('h4', 'swelling-tracker__section-title', title));
    if (typeof content === 'string') {
      section.append(createSwellingElement('p', '', content));
    } else if (content) {
      section.append(content);
    }
    return section;
  }

  function swellingTrainingAction(entry) {
    if (entry.feeling === 'pain') {
      return 'Не используй трекер для решения о тренировке — сначала оцени тревожные симптомы';
    }
    if (entry.factors.includes('hard-training') || entry.feeling === 'under-recovered') {
      return 'Следуй программе, но ориентируйся на самочувствие. Не увеличивай нагрузку сверх плана';
    }
    if (entry.factors.includes('regular-training')) {
      return 'Продолжай тренироваться по программе без дополнительных компенсаций';
    }
    return 'Двигайся в привычном режиме и не добавляй кардио только ради отёков';
  }

  function swellingRecoveryAction(entry) {
    const recoveryPriority = [
      'low-sleep',
      'sitting',
      'heat',
      'alcohol',
      'cycle',
      'stress',
      'salty-food',
      'routine',
      'regular-training',
      'hard-training',
    ];
    const factor = recoveryPriority.find((key) => entry.factors.includes(key));
    const copy = {
      'low-sleep': 'Сделай восстановление приоритетом: сон, спокойный режим и тренировка без перегрузок',
      sitting: 'Добавь лёгкую ходьбу или мягкую разминку, но не превращай это в дополнительную тренировку',
      heat: 'Следи за самочувствием, не добавляй нагрузку сверх программы и вернись к обычному режиму воды',
      alcohol: 'Вернись к обычному питанию и воде без голодания или переедания ради компенсации',
      cycle: 'Не оценивай прогресс по одному дню и продолжай мягко соблюдать привычный режим',
      stress: 'Снизь нагрузку вечером: обычная еда, вода и спокойное восстановление',
      'salty-food': 'Не убирай соль резко. Вернись к обычному рациону и нормальному приёму пищи',
      routine: 'Сохрани обычное питание и спокойное восстановление',
      'regular-training': 'Сохрани обычное питание и дай телу восстановиться по плану',
      'hard-training': 'Сохрани обычное питание и дай телу время на восстановление после нагрузки',
    };
    return copy[factor] || 'Сохрани обычное питание и спокойное восстановление';
  }

  function renderSwellingSafety(entry) {
    if (entry.feeling !== 'pain') return null;
    const safety = createSwellingElement('aside', 'swelling-tracker__safety');
    safety.setAttribute('role', 'alert');
    safety.append(
      createSwellingElement('strong', '', 'Обрати внимание на самочувствие'),
      createSwellingElement('p', '', 'Если есть необычная боль, резкое ухудшение самочувствия, сильная односторонняя отёчность, одышка или симптомы, которые тебя пугают, лучше обратиться к врачу. Трекер не заменяет медицинскую консультацию'),
    );
    return safety;
  }

  function renderSwellingDayResult(entry, savedCount = 0) {
    if (!swellingDayResult) return;
    swellingDayResult.replaceChildren();
    if (!entry) return;

    const hasChanges = !entry.changes.includes('none');
    const changesCopy = hasChanges
      ? `Сегодня ты отметила: ${entryChangePhrase(entry)}`
      : 'Сегодня ты не отметила заметных изменений. Это тоже полезная запись — она помогает сравнивать дни между собой';
    const onlyRoutine = entry.factors.every((factor) => factor === 'routine');
    const factorsCopy = onlyRoutine
      ? 'Явного бытового фактора сегодня не видно. Следующие записи помогут понять, повторится ли ситуация'
      : `За последние два дня были: ${entryFactorPhrase(entry)}`;
    const recommendations = [
      swellingTrainingAction(entry),
      swellingWaterActionCopy[entry.water],
      swellingRecoveryAction(entry),
      'Не добавляй голодание, мочегонные, детокс или лишнее кардио ради воды',
    ];
    const safety = renderSwellingSafety(entry);
    const nextBox = createSwellingElement('section', 'swelling-tracker__next-visit');
    if (savedCount === 1) {
      nextBox.append(
        createSwellingElement('h4', '', `Следующая запись — завтра, ${formatSwellingDate(tomorrowStamp())}`),
        createSwellingElement('p', '', 'Вернись ещё два раза, чтобы проверить, повторятся ли те же факторы'),
      );
    } else {
      nextBox.append(
        createSwellingElement('h4', '', 'Остался последний день'),
        createSwellingElement('p', '', 'Вернись ещё один раз, чтобы подвести итог по трём записям'),
      );
    }
    const actions = createSwellingElement('div', 'swelling-tracker__result-actions');
    const editButton = createSwellingElement('button', 'swelling-tracker__secondary-button', 'Изменить ответы');
    editButton.type = 'button';
    editButton.dataset.swellingEdit = '';
    const restartButton = createSwellingElement('button', 'swelling-tracker__link-button', 'Начать заново');
    restartButton.type = 'button';
    restartButton.dataset.swellingRestart = '';
    actions.append(editButton, restartButton);

    swellingDayResult.append(
      createSwellingElement('p', 'swelling-tracker__eyebrow', `Запись ${entry.dayIndex} из 3 готова`),
      createSwellingElement('h3', 'swelling-tracker__result-title', `День ${entry.dayIndex} готов`),
      ...(safety ? [safety] : []),
      createSwellingSection('Что ты отметила', changesCopy),
      createSwellingSection('Что могло повлиять', factorsCopy),
      createSwellingSection('План на сегодня', renderSwellingList(recommendations, 'swelling-tracker__recommendations')),
      nextBox,
      actions,
    );
  }

  function topSwellingFactors(entries) {
    const counts = new Map();
    const firstSeen = new Map();
    let order = 0;
    entries.forEach((entry) => {
      entry.factors.forEach((factor) => {
        counts.set(factor, (counts.get(factor) || 0) + 1);
        if (!firstSeen.has(factor)) firstSeen.set(factor, order++);
      });
    });

    let factors = [...counts.keys()];
    const specificFactors = factors.filter((factor) => !['routine', 'regular-training'].includes(factor));
    if (specificFactors.length) factors = specificFactors;

    return factors
      .sort((a, b) => counts.get(b) - counts.get(a) || firstSeen.get(a) - firstSeen.get(b))
      .slice(0, 2)
      .map((factor) => ({ factor, count: counts.get(factor) }));
  }

  function swellingHabits(topFactors) {
    const habits = topFactors
      .map(({ factor }) => swellingHabitCopy[factor])
      .filter(Boolean);
    swellingDefaultHabits.forEach((habit) => {
      if (habits.length < 3 && !habits.includes(habit)) habits.push(habit);
    });
    return habits.slice(0, 3);
  }

  function renderSwellingSummary(state) {
    if (!swellingSummary) return;
    swellingSummary.replaceChildren();
    const isComplete = state.records.length === 3;
    if (!isComplete) return;

    const changedEntries = state.records.filter((entry) => !entry.changes.includes('none'));
    const noneCount = state.records.length - changedEntries.length;
    const topFactors = topSwellingFactors(changedEntries)
      .filter(({ factor }) => !['routine', 'regular-training'].includes(factor));
    const repeatedFactors = topFactors.filter(({ count }) => count >= 2);
    let repeatedCopy = '';
    let meaningCopy = '';
    let habits = [];

    if (noneCount >= 2) {
      repeatedCopy = 'Заметных изменений почти не было';
      meaningCopy = 'За эти три дня текущий режим, тренировки и восстановление не дали повторяющейся реакции';
      habits = [
        'Продолжай тренироваться по программе',
        'Не меняй резко воду и соль',
        'Вернись к трекеру, если снова появятся отёки, вздутие или тяжесть',
      ];
    } else if (changedEntries.length === 1) {
      repeatedCopy = 'Изменения появились только в одной записи';
      meaningCopy = 'Пока это больше похоже на разовую реакцию, а не на повторяющуюся ситуацию';
      habits = [
        'Не делай выводов по одному дню',
        'Вернись к привычному питанию, воде и тренировкам',
        'Повтори трекер, если ситуация повторится',
      ];
    } else if (repeatedFactors.length) {
      const repeated = repeatedFactors.slice(0, 2);
      repeatedCopy = `Чаще всего изменения совпадали с: ${joinSwellingLabels(repeated.map(({ factor }) => swellingOptionCopy.factor[factor]))}`;
      meaningCopy = 'Это не доказывает причину, но показывает, за чем стоит понаблюдать в первую очередь';
      habits = swellingHabits(repeated);
    } else {
      repeatedCopy = 'Один повторяющийся фактор не выделился';
      meaningCopy = 'На состояние могли одновременно влиять сон, цикл, тренировки, питание, стресс и дорога';
      habits = [
        'Не делай поспешных выводов',
        'Оставь стабильными воду, питание и тренировки',
        'Повтори наблюдение, если изменения вернутся',
      ];
    }

    const restartButton = createSwellingElement('button', 'swelling-tracker__primary-button', 'Начать новое наблюдение');
    restartButton.type = 'button';
    restartButton.dataset.swellingRestart = '';

    swellingSummary.append(
      createSwellingElement('h3', 'swelling-tracker__summary-title', 'Итоги трёх дней'),
      createSwellingElement('p', 'swelling-tracker__summary-copy', 'Мы сравнили твои записи и посмотрели, что повторялось вместе с изменениями'),
      createSwellingSection('Что повторялось', repeatedCopy),
      createSwellingSection('Что это значит', meaningCopy),
      createSwellingSection('Что оставить на следующую неделю', renderSwellingList(habits, 'swelling-tracker__habits')),
      createSwellingSection('Чего не делать', 'Не добавляй голодание, мочегонные, детокс, резкое ограничение воды или соли и лишнее кардио ради воды'),
      createSwellingSection('Когда стоит обратиться к врачу', 'Если есть необычная боль, резкое ухудшение, сильная односторонняя отёчность, одышка или симптомы, которые тебя пугают'),
      createSwellingElement('p', 'swelling-tracker__disclaimer', 'Это ориентир, а не доказательство причины'),
      restartButton,
    );
  }

  function isSwellingStepValid(step, draft) {
    if (step === 'question-1') return draft.answers.changes.length > 0;
    if (step === 'question-2') return draft.answers.factors.length > 0 && draft.answers.factors.length <= 3;
    if (step === 'question-3') return Boolean(draft.answers.water);
    if (step === 'question-4') return Boolean(draft.answers.feeling);
    return true;
  }

  function renderSwellingFactorMeta() {
    const count = swellingFactorInputs.filter((input) => input.checked).length;
    if (swellingFactorCount) swellingFactorCount.textContent = `Выбрано ${count} из 3`;
    if (swellingFactorHint) {
      swellingFactorHint.hidden = count < 3;
      swellingFactorHint.textContent = count >= 3
        ? 'Выбери до трёх основных факторов — так результат будет понятнее'
        : '';
    }
  }

  function renderSwellingTracker(state, { focus = false } = {}) {
    const todayRecord = state.records.find((record) => record.date === todayStamp()) || null;
    const activeStep = state.records.length === 3 ? 'final-result' : state.currentStep;
    swellingViews.forEach((view) => {
      view.hidden = view.dataset.swellingStep !== activeStep;
    });
    if (swellingStartPanel) swellingStartPanel.hidden = activeStep !== 'start';
    if (swellingWorkspace) swellingWorkspace.hidden = activeStep === 'start';
    if (swellingForm) swellingForm.hidden = !swellingQuestionSteps.includes(activeStep);
    if (swellingTodayDate) {
      swellingTodayDate.dateTime = todayStamp();
      swellingTodayDate.textContent = formatSwellingDate(todayStamp());
    }
    if (swellingStart) swellingStart.textContent = `Начать день ${Math.min(state.records.length + 1, 3)}`;
    renderSwellingProgress({ ...state, currentStep: activeStep });
    renderSwellingFactorMeta();
    renderSwellingDayResult(todayRecord, state.records.length);
    renderSwellingSummary(state);
    swellingNextButtons.forEach((button) => {
      const owner = button.closest('[data-swelling-step]');
      if (!owner || owner.dataset.swellingStep !== activeStep) return;
      button.disabled = !isSwellingStepValid(activeStep, state.draft);
    });
    if (swellingSubmit) swellingSubmit.disabled = !isSwellingStepValid('question-4', state.draft);
    renderSwellingStorageWarning();

    if (focus) {
      const activeView = swellingTracker.querySelector(`[data-swelling-step="${activeStep}"]`);
      const heading = activeView?.querySelector('[data-swelling-question-heading], [data-swelling-start-title], h2, h3');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }

  function persistSwellingDraft() {
    const { state } = readSwellingState();
    const dayIndex = state.records.find((record) => record.date === todayStamp())?.dayIndex
      || Math.min(state.records.length + 1, 3);
    const nextState = writeSwellingState({ ...state, draft: readSwellingDraft(dayIndex) });
    setSwellingError('');
    renderSwellingTracker(nextState);
    return nextState;
  }

  function goToSwellingStep(step) {
    const { state } = readSwellingState();
    if (!swellingSteps.includes(step)) return;
    const nextState = writeSwellingState({ ...state, currentStep: step });
    setSwellingError('');
    renderSwellingTracker(nextState, { focus: true });
  }

  function validateCurrentSwellingStep(state) {
    if (isSwellingStepValid(state.currentStep, state.draft)) return true;
    setSwellingError('Выбери подходящий вариант, чтобы продолжить', state.currentStep);
    return false;
  }

  function nextSwellingQuestion() {
    const { state } = readSwellingState();
    if (!validateCurrentSwellingStep(state)) return;
    const index = swellingQuestionSteps.indexOf(state.currentStep);
    if (index >= 0 && index < swellingQuestionSteps.length - 1) {
      goToSwellingStep(swellingQuestionSteps[index + 1]);
    }
  }

  function previousSwellingQuestion() {
    const { state } = readSwellingState();
    const index = swellingQuestionSteps.indexOf(state.currentStep);
    goToSwellingStep(index > 0 ? swellingQuestionSteps[index - 1] : 'start');
  }

  function saveSwellingEntry() {
    const { state } = readSwellingState();
    if (!isSwellingStepValid('question-1', state.draft)
      || !isSwellingStepValid('question-2', state.draft)
      || !isSwellingStepValid('question-3', state.draft)
      || !isSwellingStepValid('question-4', state.draft)) {
      setSwellingError('Ответь на этот вопрос, чтобы получить план', 'question-4');
      return;
    }

    const recordIndex = state.records.findIndex((record) => record.date === todayStamp());
    if (recordIndex < 0 && state.records.length >= 3) return;
    const existing = state.records[recordIndex];
    const answers = state.draft.answers;
    const record = {
      id: existing?.id || `swelling-${todayStamp()}-${state.records.length + 1}`,
      date: todayStamp(),
      dayIndex: existing?.dayIndex || state.records.length + 1,
      changes: answers.changes,
      factors: answers.factors,
      water: answers.water,
      feeling: answers.feeling,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    const records = [...state.records];
    if (recordIndex >= 0) records[recordIndex] = record;
    else records.push(record);
    records.sort((a, b) => a.date.localeCompare(b.date));
    const isComplete = records.length === 3;
    const nextState = writeSwellingState({
      ...state,
      records,
      startedAt: state.startedAt || records[0].date,
      completedAt: isComplete ? todayStamp() : null,
      currentStep: isComplete ? 'final-result' : 'day-result',
    });
    setSwellingStatus(`Запись ${record.dayIndex} из 3 готова`);
    setSwellingError('');
    renderSwellingTracker(nextState, { focus: true });
  }

  function beginSwellingDay() {
    const { state } = readSwellingState();
    const todayRecord = state.records.find((record) => record.date === todayStamp());
    const draft = todayRecord
      ? {
        date: todayRecord.date,
        dayIndex: todayRecord.dayIndex,
        answers: {
          changes: todayRecord.changes,
          factors: todayRecord.factors,
          water: todayRecord.water,
          feeling: todayRecord.feeling,
        },
      }
      : emptySwellingDraft(Math.min(state.records.length + 1, 3));
    fillSwellingForm(draft);
    const nextState = writeSwellingState({ ...state, draft, currentStep: 'question-1' });
    setSwellingStatus('');
    setSwellingError('');
    renderSwellingTracker(nextState, { focus: true });
  }

  function restartSwellingTracker() {
    if (!window.confirm('Начать заново? Ответы текущего наблюдения будут удалены.')) return;
    const state = writeSwellingState(emptySwellingState());
    clearSwellingForm();
    setSwellingStatus('Новое наблюдение можно начать');
    setSwellingError('');
    renderSwellingTracker(state, { focus: true });
  }

  function initSwellingTracker() {
    if (!swellingTracker) return;

    const { state, wasReset } = readSwellingState();
    fillSwellingForm(state.draft);
    writeSwellingState(state);
    renderSwellingTracker(state);
    if (wasReset) setSwellingStatus('Прошло больше семи дней — начни новое наблюдение');

    swellingNoticeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        const value = swellingInputValue(input, 'notice');
        if (input.checked && value === 'none') {
          swellingNoticeInputs.forEach((other) => setSwellingInputChecked(other, other === input));
        } else if (input.checked) {
          const noneInput = swellingNoticeInputs.find((other) => swellingInputValue(other, 'notice') === 'none');
          if (noneInput) setSwellingInputChecked(noneInput, false);
        }
        setSwellingInputChecked(input, input.checked);
        persistSwellingDraft();
      });
    });

    swellingFactorInputs.forEach((input) => {
      input.addEventListener('change', () => {
        const selected = swellingFactorInputs.filter((item) => item.checked);
        if (selected.length > 3) {
          setSwellingInputChecked(input, false);
          if (swellingFactorHint) {
            swellingFactorHint.hidden = false;
            swellingFactorHint.textContent = 'Выбери до трёх основных факторов — так результат будет понятнее';
          }
        } else {
          setSwellingInputChecked(input, input.checked);
        }
        persistSwellingDraft();
      });
    });

    [...swellingWaterInputs, ...swellingFeelingInputs].forEach((input) => {
      input.addEventListener('change', () => {
        const group = swellingWaterInputs.includes(input) ? swellingWaterInputs : swellingFeelingInputs;
        group.forEach((item) => setSwellingInputChecked(item, item.checked));
        persistSwellingDraft();
      });
    });

    swellingForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      saveSwellingEntry();
    });

    swellingTracker.addEventListener('click', (event) => {
      const target = event.target.closest('button, [role="button"]');
      if (!target || !swellingTracker.contains(target)) return;
      if (target.matches('[data-swelling-start]')) beginSwellingDay();
      if (target.matches('[data-swelling-next]')) nextSwellingQuestion();
      if (target.matches('[data-swelling-back]')) previousSwellingQuestion();
      if (target.matches('[data-swelling-edit]')) beginSwellingDay();
      if (target.matches('[data-swelling-restart]')) restartSwellingTracker();
    });
  }

  initSwellingTracker();

  const celluliteFactorCopy = {
    water: 'Начни с базы: вода по мягкому ориентиру, соль без крайностей и нормальный сон. Не оценивай рельеф по одному утру — смотри динамику 1-2 недель',
    movement: 'Добавь ежедневную прогулку или больше бытового движения. Плюс силовые по курсу: они делают тело визуально плотнее, а не просто “сжигают целлюлит”',
    nutrition: 'Собери тарелку проще: белок в 2-4 приёмах, овощи или клетчатка, нормальные углеводы. Главная цель — убрать качели голод, срыв и наказание',
    regularity: 'Не собирай идеальную систему. На ближайшие 3 дня выбери минимум: вода, шаги и один спокойный уход. Регулярность важнее длинного списка привычек',
  };

  function getCelluliteTodayKey() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function normalizeCelluliteSavedValue(value) {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') {
      return '';
    }

    return typeof value === 'string' ? value : String(value);
  }

  function readCelluliteState() {
    try {
      const saved = JSON.parse(localStorage.getItem(celluliteStorageKey)) || {};
      const todayKey = getCelluliteTodayKey();
      const progressDate = typeof saved.progressDate === 'string' ? saved.progressDate : '';
      return {
        waterWeight: normalizeCelluliteSavedValue(saved.waterWeight),
        factor: normalizeCelluliteSavedValue(saved.factor),
        progressDate: todayKey,
        checkedItems: progressDate === todayKey && Array.isArray(saved.checkedItems)
          ? saved.checkedItems.filter((item) => typeof item === 'string' && celluliteProgressValues.has(item))
          : [],
      };
    } catch {
      return { waterWeight: '', factor: '', progressDate: getCelluliteTodayKey(), checkedItems: [] };
    }
  }

  function writeCelluliteState(nextState) {
    try {
      localStorage.setItem(celluliteStorageKey, JSON.stringify({
        ...nextState,
        progressDate: nextState.progressDate || getCelluliteTodayKey(),
      }));
    } catch {
      // The guide still works without persistence if storage is blocked.
    }
  }

  function renderCelluliteWater(weightValue) {
    if (!celluliteWaterResult) return;

    const weight = Number(String(weightValue || '').replace(',', '.'));
    if (!weightValue) {
      celluliteWaterResult.textContent = 'Введи вес — покажу мягкий диапазон на день';
      return;
    }

    if (!Number.isFinite(weight) || weight < 35 || weight > 220) {
      celluliteWaterResult.textContent = 'Проверь вес: нужен ориентир в килограммах, например 62';
      return;
    }

    const min = Math.round((weight * 30) / 50) * 50;
    const max = Math.round((weight * 35) / 50) * 50;
    celluliteWaterResult.textContent = `Твой ориентир: ${min}-${max} мл воды в день. Пей равномерно, без попытки “залить” всё вечером`;
  }

  function renderCelluliteFactor(factor) {
    celluliteFactorButtons.forEach((button) => {
      const isActive = button.dataset.celluliteFactor === factor;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (!celluliteFactorResult) return;
    celluliteFactorResult.textContent = celluliteFactorCopy[factor] || 'Выбери фактор — здесь появится твой первый шаг';
  }

  function renderCelluliteProgress(checkedItems) {
    const checkedSet = new Set(checkedItems);
    celluliteProgressChecks.forEach((input) => {
      input.checked = checkedSet.has(input.value);
    });

    if (celluliteProgressSummary) {
      const checkedCount = celluliteProgressChecks.filter((input) => input.checked).length;
      celluliteProgressSummary.textContent = `${checkedCount}/${celluliteProgressChecks.length} сегодня`;
    }
  }

  function copyArticle(button) {
    const article = button.dataset.copyArticle || '';
    if (!article) return;

    const markCopied = () => {
      button.classList.add('is-copied');
      if (copyStatus) {
        copyStatus.textContent = `Скопировано: ${article}`;
      }
      window.setTimeout(() => {
        button.classList.remove('is-copied');
        if (copyStatus?.textContent === `Скопировано: ${article}`) {
          copyStatus.textContent = '';
        }
      }, 1800);
    };

    const copyFallback = () => {
      const input = document.createElement('textarea');
      input.value = article;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.top = '-999px';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      input.setSelectionRange(0, article.length);
      const copied = document.execCommand('copy');
      input.remove();
      if (copied) {
        markCopied();
      } else {
        if (copyStatus) {
          copyStatus.textContent = `Артикул: ${article}`;
        }
      }
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(article).then(markCopied).catch(copyFallback);
      return;
    }

    copyFallback();
  }

  function initCelluliteGuide() {
    const state = readCelluliteState();

    if (celluliteWaterWeight) {
      celluliteWaterWeight.value = state.waterWeight;
      renderCelluliteWater(state.waterWeight);
      celluliteWaterWeight.addEventListener('input', () => {
        const nextState = { ...readCelluliteState(), waterWeight: celluliteWaterWeight.value };
        renderCelluliteWater(nextState.waterWeight);
        writeCelluliteState(nextState);
      });
    }

    renderCelluliteFactor(state.factor);
    celluliteFactorButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextState = { ...readCelluliteState(), factor: button.dataset.celluliteFactor || '' };
        renderCelluliteFactor(nextState.factor);
        writeCelluliteState(nextState);
      });
    });

    renderCelluliteProgress(state.checkedItems);
    celluliteProgress?.addEventListener('change', (event) => {
      const target = event.target;
      if (!target?.matches?.('input[type="checkbox"]')) return;

      const checked = new Set(readCelluliteState().checkedItems);
      if (target.checked) {
        checked.add(target.value);
      } else {
        checked.delete(target.value);
      }

      const nextState = { ...readCelluliteState(), checkedItems: [...checked] };
      renderCelluliteProgress(nextState.checkedItems);
      writeCelluliteState(nextState);
    });

    celluliteReset?.addEventListener('click', () => {
      const nextState = { ...readCelluliteState(), checkedItems: [] };
      renderCelluliteProgress([]);
      writeCelluliteState(nextState);
    });

    copyArticleButtons.forEach((button) => {
      button.addEventListener('click', () => copyArticle(button));
    });
  }

  initCelluliteGuide();

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
