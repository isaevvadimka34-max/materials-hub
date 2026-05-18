from __future__ import annotations

import csv
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "recipes-source.html"
DATA_DIR = ROOT / "assets" / "data"
REPORTS_DIR = ROOT / "reports"

CATEGORIES = {
    "b": {"id": "breakfast", "title": "Завтраки"},
    "l": {"id": "lunch", "title": "Обеды"},
    "s": {"id": "snack", "title": "Перекусы"},
    "d": {"id": "dinner", "title": "Ужины"},
    "ds": {"id": "dessert", "title": "Десерты"},
}

CLAIM_WORDS = (
    "леч",
    "профилактик",
    "гормон",
    "токсин",
    "сахар",
    "кров",
    "печен",
    "кишеч",
    "сосуд",
    "воспален",
    "метабол",
    "обмен",
    "иммун",
    "сердц",
    "мозг",
    "кости",
    "кожа",
    "антиокс",
)

SAFE_NOTES = {
    "b1": "Сытный завтрак с яйцами, овощами и хлебом: есть белок, клетчатка и углеводы для бодрого начала дня.",
    "b2": "Белковый творожный завтрак, который удобно готовить заранее и брать как более сытную сладкую альтернативу.",
    "b3": "Плотный завтрак с белком, сыром и овсяной основой: хороший вариант, когда хочется надолго закрыть голод.",
    "b4": "Быстрый белковый завтрак с креветками и яйцами, а хлеб добавляет понятную порцию углеводов.",
    "b5": "Удобный завтрак без утренней готовки: овсянка дает мягкую сладость и хорошо подходит для заготовки с вечера.",
    "b6": "Сбалансированный тост с яйцом и авокадо: подойдет, когда хочется не сладкий и достаточно плотный завтрак.",
    "b7": "Маффины удобно приготовить заранее: это порционный белковый завтрак или перекус без лишней возни утром.",
    "b8": "Мягкий сладкий завтрак без сложных ингредиентов: банан добавляет вкус, а овсяная основа делает блюдо сытнее.",
    "b9": "Несладкий сытный завтрак с крупой, яйцом и грибами: хороший вариант для дней, когда нужен плотный прием пищи.",
    "b10": "Легкий творожный вариант с высоким белком: подойдет, когда хочется сладкого завтрака без тяжелого ощущения.",
    "b11": "Быстрый ролл с курицей: удобно собрать за несколько минут и получить понятную порцию белка.",
    "b12": "Сытная овсянка с орехами и ягодами: хороший вариант, когда хочется сладкого завтрака с текстурой.",
    "b13": "Белковый завтрак с тунцом и яйцом: подойдет для тех, кто не любит сладкое утром.",
    "b14": "Теплая каша с тыквой и специями: мягкий углеводный завтрак для спокойного начала дня.",
    "b15": "Запеканка удобна для заготовки: можно приготовить порциями и быстро собрать завтрак в течение недели.",
    "b16": "Простой омлет с овощами: базовый белковый завтрак, который легко адаптировать под продукты дома.",
    "b17": "Плотный тост с творожным сыром и рыбой: сочетает белок, жиры и углеводы в одном быстром блюде.",
    "b18": "Завтрак с киноа и яйцом: подойдет, когда хочется более питательный несладкий вариант.",
    "b19": "Легкий творожный крем: быстрый вариант для сладкого завтрака или десерта без сложной готовки.",
    "b20": "Быстрый завтрак с йогуртом и гранолой: удобно собрать, когда нет времени готовить.",
    "b21": "Сытный тост с яйцом и сыром: простой вариант, когда нужен быстрый плотный завтрак.",
    "b22": "Высокобелковый завтрак с курицей: подойдет, если утром важно добрать белок.",
    "b23": "Овсянка с фруктами дает мягкую сладость и хорошо подходит для спокойного завтрака.",
    "b24": "Порционный завтрак, который удобно приготовить заранее и брать с собой.",
    "b25": "Белковый творожный вариант с ягодами: подойдет, когда хочется сладкого, но более сытного завтрака.",
}


def safe_note(recipe: dict) -> str:
    if recipe["id"] in SAFE_NOTES:
        return SAFE_NOTES[recipe["id"]]

    category = recipe["category"]["id"]
    kbju = recipe["kbju"]
    minutes = recipe["timeMinutes"] or 0
    title_and_steps = f"{recipe['title']} {' '.join(recipe['steps'])}".lower()

    if category == "snack":
        if minutes and minutes <= 15:
            return "Быстрый перекус, который удобно держать под рукой между основными приемами пищи."
        return "Простой перекус для ситуации, когда нужно что-то небольшое и понятное по составу."

    if category == "dessert":
        if re.search(r"холодильник|ночь|запек|суфле|панна|чизкейк", title_and_steps):
            return "Сладкий вариант, который можно приготовить заранее и держать как готовый десерт."
        return "Десерт для ситуации, когда хочется сладкого в более контролируемой домашней версии."

    if category == "dinner":
        if kbju["protein"] is not None and kbju["protein"] >= 30:
            return "Белковый ужин с умеренной калорийностью: подойдет, когда хочется сытно поесть без тяжелого гарнира."
        if re.search(r"запек|духовк|котлет|митбол", title_and_steps):
            return "Удобный ужин для заготовки: можно приготовить порцию заранее и быстро разогреть."
        return "Понятный ужин с простыми ингредиентами, который легко вписать в обычный рацион."

    if category == "lunch":
        if kbju["carbs"] is not None and kbju["carbs"] >= 45:
            return "Полноценный обед с хорошей порцией углеводов: подойдет для активного дня и плотного приема пищи."
        if kbju["protein"] is not None and kbju["protein"] >= 30:
            return "Белковый обед, который помогает сделать прием пищи более сытным."
        return "Сбалансированный обед из простых продуктов для обычного дня без сложной готовки."

    if category == "breakfast":
        if kbju["protein"] is not None and kbju["protein"] >= 25:
            return "Белковый завтрак, который помогает дольше сохранять сытость утром."
        if kbju["carbs"] is not None and kbju["carbs"] >= 45:
            return "Углеводный завтрак для дней, когда нужна энергия и более плотное начало дня."
        return "Простой завтрак из понятных продуктов, который легко повторить дома."

    return "Понятный рецепт из доступных ингредиентов для разнообразия рациона."


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def parse_category(recipe_id: str) -> dict[str, str]:
    prefix = "ds" if recipe_id.startswith("ds") else recipe_id[0]
    return CATEGORIES[prefix]


def parse_int(pattern: str, text: str) -> int | None:
    match = re.search(pattern, text, flags=re.I)
    if not match:
        return None
    return int(match.group(1))


def parse_kbju(block: str) -> dict[str, int | None]:
    text = clean_text(re.search(r'<div class="kbju-box">(.*?)</div>', block, flags=re.S).group(1))
    return {
        "kcal": parse_int(r"Ккал:\s*(\d+)", text),
        "protein": parse_int(r"Б:\s*(\d+)", text),
        "fat": parse_int(r"Ж:\s*(\d+)", text),
        "carbs": parse_int(r"У:\s*(\d+)", text),
    }


def calculated_kcal(kbju: dict[str, int | None]) -> int | None:
    protein = kbju.get("protein")
    fat = kbju.get("fat")
    carbs = kbju.get("carbs")
    if protein is None or fat is None or carbs is None:
        return None
    return protein * 4 + fat * 9 + carbs * 4


def audit_recipe(recipe: dict) -> dict:
    kbju = recipe["kbju"]
    declared = kbju["kcal"]
    calculated = calculated_kcal(kbju)
    diff = None if declared is None or calculated is None else abs(declared - calculated)

    issues: list[str] = []
    if calculated is None or declared is None:
        issues.append("Не все значения КБЖУ распознаны")
    elif diff > 40:
        issues.append(f"Сильное расхождение КБЖУ: заявлено {declared}, по БЖУ {calculated}")
    elif diff > 25:
        issues.append(f"Умеренное расхождение КБЖУ: заявлено {declared}, по БЖУ {calculated}")

    ingredients = recipe["ingredients"].lower()
    if not re.search(r"\d", ingredients):
        issues.append("В ингредиентах не найдены числовые граммовки/количества")

    note = recipe["note"].lower()
    claim_hits = sorted({word for word in CLAIM_WORDS if word in note})
    if claim_hits:
        issues.append("Заметка содержит формулировки, которые лучше проверить редактору")

    if not recipe["steps"]:
        issues.append("Не распознаны шаги приготовления")

    if not issues:
        status = "ok"
    elif any("Сильное" in issue or "Не все" in issue or "Не распознаны" in issue for issue in issues):
        status = "needs_review"
    else:
        status = "minor_review"

    return {
        "status": status,
        "declaredKcal": declared,
        "calculatedKcalFromMacros": calculated,
        "kcalDiff": diff,
        "issues": issues,
        "claimWords": claim_hits,
    }


def recipe_tags(recipe: dict) -> list[str]:
    tags: list[str] = []
    category = recipe["category"]["id"]
    kbju = recipe["kbju"]
    minutes = recipe["timeMinutes"]
    title_and_steps = f"{recipe['title']} {' '.join(recipe['steps'])}".lower()

    if minutes is not None and minutes <= 15:
        tags.append("быстро")
    if category == "dessert":
        tags.append("сладкое")
    if kbju["protein"] is not None and kbju["protein"] >= 30:
        tags.append("больше белка")
    if kbju["protein"] is not None and kbju["kcal"] is not None and kbju["protein"] >= 25 and kbju["kcal"] >= 350:
        tags.append("сытно")
    if category in {"breakfast", "lunch"} and kbju["carbs"] is not None and kbju["carbs"] >= 45:
        tags.append("больше углеводов")
    if category in {"snack", "dessert"} and kbju["kcal"] is not None and kbju["kcal"] <= 250:
        tags.append("легкий вариант")
    if category == "dinner" and kbju["kcal"] is not None and kbju["kcal"] <= 320:
        tags.append("легче по калориям")
    if re.search(r"запек|духовк|холодильник|ночь|маффин|гранол|котлет|запекан", title_and_steps):
        tags.append("можно заранее")

    return tags


def parse_recipes(source: str) -> list[dict]:
    blocks = re.findall(
        r'<div class="meal-block" id="([^"]+)">(.*?)(?=\n\s*<div class="meal-block"|\n\s*<a href="#top" class="back-link")',
        source,
        flags=re.S,
    )

    recipes: list[dict] = []
    for recipe_id, block in blocks:
        category = parse_category(recipe_id)
        title_raw = clean_text(re.search(r'<div class="meal-title">(.*?)</div>', block, flags=re.S).group(1))
        title = re.sub(r"^\d+\.\s*", "", title_raw)
        time = clean_text(re.search(r'<div class="meal-time">(.*?)</div>', block, flags=re.S).group(1))
        time_minutes = parse_int(r"(\d+)", time)
        ingredients = clean_text(re.search(r'<p class="ingredients-list">(.*?)</p>', block, flags=re.S).group(1))
        steps = [clean_text(item) for item in re.findall(r"<li>(.*?)</li>", block, flags=re.S)]
        note_match = re.search(r'<div class="benefit-box">(.*?)</div>', block, flags=re.S)
        note = clean_text(note_match.group(1)) if note_match else ""
        note = re.sub(r"^[^\wА-Яа-я]*ПОЛЬЗА:\s*", "", note, flags=re.I)
        kbju = parse_kbju(block)

        recipe = {
            "id": recipe_id,
            "title": title,
            "category": category,
            "time": time,
            "timeMinutes": time_minutes,
            "kbju": kbju,
            "ingredients": ingredients,
            "steps": steps,
            "note": "",
            "sourceSection": category["title"],
        }
        recipe["note"] = safe_note(recipe)
        recipe["audit"] = audit_recipe(recipe)
        recipe["tags"] = recipe_tags(recipe)
        recipes.append(recipe)

    return recipes


def parse_bonus(source: str) -> dict:
    bonus_start = source.find('<div class="section-break" id="bonus">')
    bonus_html = source[bonus_start:] if bonus_start >= 0 else ""
    replacements = []
    for row in re.findall(r"<tr>\s*<td><strong>(.*?)</strong></td>\s*<td[^>]*>.*?</td>\s*<td>(.*?)</td>\s*</tr>", bonus_html, flags=re.S):
        replacements.append({"from": clean_text(row[0]), "to": clean_text(row[1])})

    sauces = []
    sauce_pattern = re.compile(
        r'<div style="font-weight: bold;[^"]*">(.*?)</div>\s*<div style="font-size: 0.85em;[^"]*">(.*?)</div>',
        flags=re.S,
    )
    for title, body in sauce_pattern.findall(bonus_html)[:3]:
        sauces.append({"title": clean_text(title), "body": clean_text(body)})

    basket_items = sorted(set(re.findall(r'<div class="shop-item"[^>]*>\s*<div class="shop-check"></div>(.*?)</div>', bonus_html, flags=re.S)))
    basket_items = [clean_text(item) for item in basket_items if clean_text(item)]

    return {
        "replacements": replacements,
        "sauces": sauces,
        "basketItems": basket_items,
    }


def write_outputs(recipes: list[dict], bonus: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    payload = {"recipes": recipes, "bonus": bonus}
    (DATA_DIR / "recipes.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (DATA_DIR / "recipes-data.js").write_text(
        "window.MATERIALS_DATA = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )

    status_counts: dict[str, int] = {}
    tag_counts: dict[str, int] = {}
    for recipe in recipes:
        status_counts[recipe["audit"]["status"]] = status_counts.get(recipe["audit"]["status"], 0) + 1
        for tag in recipe["tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    summary = {
        "totalRecipes": len(recipes),
        "statusCounts": status_counts,
        "tagCounts": tag_counts,
        "auditMethod": "Техническая проверка: согласованность калорий с БЖУ по формуле 4/9/4, наличие числовых граммовок, распознавание шагов и поиск спорных формулировок в заметках. Это не заменяет экспертный нутрициологический пересчёт по базе продуктов.",
    }
    (DATA_DIR / "audit-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    with (REPORTS_DIR / "recipe-audit.csv").open("w", encoding="utf-8-sig", newline="") as output:
        writer = csv.writer(output, delimiter=";")
        writer.writerow([
            "id",
            "category",
            "title",
            "time",
            "declared_kcal",
            "calculated_kcal",
            "diff",
            "protein",
            "fat",
            "carbs",
            "status",
            "tags",
            "issues",
        ])
        for recipe in recipes:
            audit = recipe["audit"]
            kbju = recipe["kbju"]
            writer.writerow([
                recipe["id"],
                recipe["category"]["title"],
                recipe["title"],
                recipe["time"],
                kbju["kcal"],
                audit["calculatedKcalFromMacros"],
                audit["kcalDiff"],
                kbju["protein"],
                kbju["fat"],
                kbju["carbs"],
                audit["status"],
                ", ".join(recipe["tags"]),
                " | ".join(audit["issues"]),
            ])


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    recipes = parse_recipes(source)
    bonus = parse_bonus(source)
    write_outputs(recipes, bonus)
    print(f"Generated {len(recipes)} recipes")


if __name__ == "__main__":
    main()
