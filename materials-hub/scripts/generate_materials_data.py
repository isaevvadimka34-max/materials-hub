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
        tags.append("до 15 минут")
    if minutes is not None and minutes <= 10:
        tags.append("до 10 минут")
    if category == "dessert":
        tags.append("когда хочется сладкого")
    if kbju["protein"] is not None and kbju["protein"] >= 30:
        tags.append("больше белка")
    if kbju["protein"] is not None and kbju["kcal"] is not None and kbju["protein"] >= 25 and kbju["kcal"] >= 350:
        tags.append("сытная идея")
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
            "note": note,
            "sourceSection": category["title"],
        }
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
