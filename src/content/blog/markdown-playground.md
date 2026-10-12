---
title: "Markdown playground: everything a post can do"
date: 2026-10-12
summary: "A living reference for the blog: callouts, stickers, GIFs, math, code, tables and embeds. It's a draft, so it only shows up in local dev."
tags: ["meta", "guide"]
mood: "🧪"
draft: true
---

This post is a **draft**, so it only shows in `npm run dev` and never on the live site. Open it in the studio (`/blog/write` → *open*) to see the markdown behind each block. :sparkles:

## Text that pops

Regular **bold**, *italic*, ~~strikethrough~~, `inline code`, <mark>highlights</mark>, <kbd>⌘</kbd> + <kbd>K</kbd> and [links](https://github.com/Rahul5977). Emoji work as-is 🚀 or as shortcodes :fire: :coffee: :tada:.

> Quotes look like this. Good for the one line you want people to remember.

## Callouts

> [!TIL]
> Python's `functools.cache` memoises a function with one decorator, no `maxsize` needed.

> [!NOTE]
> Plain notes for context or asides.

> [!TIP] Pro move
> Put your own title after the callout type.

> [!WARNING]
> Heads-up boxes for gotchas.

> [!CAUTION]
> For the "don't run this in prod" moments.

## Stickers & GIFs

Stickers are animated and sit inline with the text:

![sticker: rocket](https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.webp) ![sticker: fire](https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp) ![sticker: mind-blown](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/512.webp)

GIFs and images get a frame, a caption (from the quoted title) and click-to-zoom:

![gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd2dWx6dXlqZ3V6c2Z4d3JtYjRqY3F4eW1hYXJ0dWZ5OXBjZ2NkMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13HgwGsXF0aiGY/giphy.gif "me, shipping on a Friday")

## Code

```python
from functools import cache

@cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(90))  # instant
```

```ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
```

## Math

Inline: the softmax of $z_i$ is $\frac{e^{z_i}}{\sum_j e^{z_j}}$.

$$
\mathcal{L}(\theta) = -\frac{1}{N}\sum_{i=1}^{N} \sum_{c} y_{i,c} \log \hat{y}_{i,c}
$$

## Lists & tables

- [x] Set up the blog
- [x] Write the playground
- [ ] Publish the first real post

| Approach | Latency | Notes |
| --- | --- | --- |
| Naive RAG | 1.2s | one retrieval pass |
| Agentic RAG | 3.4s | grades its own evidence |

<details>
<summary>Click to expand a collapsible section</summary>

Hidden until someone wants it. Useful for long logs or spoilers.

</details>

## Embeds

A YouTube link alone on its own line becomes a player:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

---

That's everything. Now go write something real. ✍️
