#!/usr/bin/env python3
"""
Scrape Æsop's Fables (V. S. Vernon-Jones) from Wikisource and build assets/fables.json

Usage:
  python3 scripts/scrape_wikisource_fables.py

Notes:
- Extracts only the individual fable pages linked from the main edition page (excludes the introduction).
- Stores plain text in the `content` field and includes the first image URL in `image` when available.
"""

from __future__ import annotations

import json
import time
from typing import List
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from bs4.element import Tag

BASE_URL = "https://en.wikisource.org"
INDEX_URL = "https://en.wikisource.org/wiki/%C3%86sop%27s_Fables_(V._S._Vernon-Jones)"
OUT_PATH = "assets/fables.json"
HEADERS = {"User-Agent": "aesop-scraper/1.0 (github.com)"}


def get_soup(url: str) -> BeautifulSoup:
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")


def extract_fable_links() -> List[str]:
    print("Querying MediaWiki API for subpages...")
    api = urljoin(BASE_URL, "/w/api.php")
    prefix = "Æsop's Fables (V. S. Vernon-Jones)/"
    params = {
        "action": "query",
        "format": "json",
        "list": "allpages",
        "aplimit": "max",
        "apprefix": prefix,
    }

    links: List[str] = []
    seen = set()

    while True:
        r = requests.get(api, params=params, headers=HEADERS)
        r.raise_for_status()
        data = r.json()
        pages = data.get("query", {}).get("allpages", [])
        for p in pages:
            title = p.get("title")
            if not title:
                continue
            # build page URL
            page_url = BASE_URL + "/wiki/" + title.replace(" ", "_")
            if page_url in seen:
                continue
            seen.add(page_url)
            # skip an explicit Introduction subpage if present
            if page_url.lower().endswith("/introduction"):
                continue
            links.append(page_url)

        cont = data.get("continue")
        if cont and cont.get("apcontinue"):
            params["apcontinue"] = cont["apcontinue"]
        else:
            break

    print(f"Found {len(links)} fable links via API")
    return links


def extract_text_and_image(soup: BeautifulSoup, page_title: str | None = None):
    content = soup.find("div", class_="mw-parser-output")
    if content is None:
        return "", None, None
    parts = []
    image_url = None
    image_alt = None

    in_body = False

    # Prefer Rackham illustration images when available (filename contains this pattern)
    for img in content.find_all("img"):
        src = img.get("src") or ""
        if src.startswith("//"):
            candidate = "https:" + src
        else:
            candidate = src
        if "Aesops_Fables-Rackham-" in candidate:
            image_url = candidate
            image_alt = img.get("alt", "")
            break

    for child in content.children:
        # skip non-tags
        if not isinstance(child, Tag):
            continue

        # stop at first h2 (end of main fable content)
        if child.name == "h2":
            break

        # capture first image found in children (fallback if no Rackham image found)
        if image_url is None:
            img = child.find("img") if getattr(child, "find", None) else None
            if img and getattr(img, "get", None) and img.get("src"):
                src = img["src"]
                if src.startswith("//"):
                    src = "https:" + src
                image_url = src
                image_alt = img.get("alt", "")

        # collect textual content from paragraphs and lists
        if child.name == "p":
            text = child.get_text(" ", strip=True)
            if not text:
                continue
            # skip navigation/header paragraphs that include site chrome
            nav_indicators = ["Æsop's Fables", "Listen to this text", "sister projects", "←", "→"]
            if not in_body:
                if any(indicator in text for indicator in nav_indicators):
                    continue
                # consider this the start of the actual fable body
                in_body = True
            if in_body:
                parts.append(text)

        elif in_body and child.name in ("ul", "ol"):
            text = child.get_text(" ", strip=True)
            if text:
                parts.append(text)

    text_content = "\n\n".join(parts).strip()
    # fallback: if we didn't capture any parts, try a looser extraction using the title
    if not text_content:
        fulltext = content.get_text("\n", strip=True)
        if page_title:
            search_title = page_title.upper()
            idx = fulltext.find(search_title)
            if idx != -1:
                body = fulltext[idx + len(search_title) :].strip()
            else:
                # pick the first reasonably long paragraph
                paragraphs = [p.strip() for p in fulltext.split("\n\n") if p.strip()]
                body = "\n\n".join(p for p in paragraphs if len(p) > 40)[:20000]
        else:
            paragraphs = [p.strip() for p in fulltext.split("\n\n") if p.strip()]
            body = "\n\n".join(p for p in paragraphs if len(p) > 40)[:20000]

        # remove trailing chrome markers
        for marker in ("Return to the top of the page", "Category:"):
            midx = body.find(marker)
            if midx != -1:
                body = body[:midx].strip()

        text_content = body

        # For Rackham images, provide a meaningful alt text when missing or site-chrome
        if image_url and "Aesops_Fables-Rackham-" in (image_url or ""):
            bad_indicators = ("sister projects", "related authors", "system-users", "wikimedia-logo")
            if not image_alt or not image_alt.strip() or any(ind in (image_alt or "").lower() for ind in bad_indicators):
                # Prefer the page title if available for a meaningful alt text
                if page_title:
                    image_alt = f"Illustration for {page_title}"
                else:
                    image_alt = "Illustration"

        return text_content, image_url, image_alt


def scrape_fable(url: str):
    soup = get_soup(url)
    title_tag = soup.find("h1", id="firstHeading")
    title = title_tag.get_text(strip=True) if title_tag else ""
    # strip the edition prefix from the title if present
    if "/" in title:
        title = title.split("/", 1)[1]
    content, image_url, image_alt = extract_text_and_image(soup, page_title=title)
    return {"title": title, "content": content, "image": image_url, "imageAlt": image_alt}


def main():
    links = extract_fable_links()
    fables = []
    for i, link in enumerate(links, start=1):
        try:
            print(f"[{i}/{len(links)}] {link}")
            f = scrape_fable(link)
            if not f["content"]:
                print(f"  Warning: empty content for {f['title'] or link}")
            fables.append(f)
        except Exception as exc:
            print("  Error scraping", link, exc)
        # be polite
        time.sleep(0.5)

    print(f"Writing {len(fables)} fables to {OUT_PATH}")
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(fables, fh, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
