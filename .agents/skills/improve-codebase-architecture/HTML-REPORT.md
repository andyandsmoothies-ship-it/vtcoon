# HTML Report Format

The architectural review is rendered as a single self-contained HTML file in the OS temp directory so that no artifacts pollute the repository worktree.

- **Storage Location**: OS temp directory (`%TEMP%` on Windows, `$TMPDIR` or `/tmp` on Linux/macOS) as `<tmpdir>/architecture-review-<timestamp>.html`.
- **Technologies**: Tailwind CSS CDN and Mermaid.js ESM import. Mermaid handles graph-shaped dependencies; custom HTML/SVG handles editorial mass and cross-section diagrams.
- **Language Policy**: When run in projects governed by Vietnamese reporting requirements (such as `vtcoon` under `GEMINI.md`), user-facing titles, problems, solutions, and wins are in Vietnamese (or bilingual), with technical terms (`module`, `interface`, `seam`, `adapter`, `depth`, `locality`, `leverage`) preserved concisely.

---

## HTML Scaffold

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Architecture Review & Deepening Candidates - {{repo_name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; stroke-width: 2px; }
      .deep-card { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans antialiased min-h-screen">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <!-- Header -->
      <header class="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Architectural Discovery
          </span>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
            Đánh Giá Kiến Trúc & Cơ Hội Đào Sâu (Deepening Review)
          </h1>
          <p class="text-sm text-slate-500 mt-1">Dự án: <span class="font-mono text-slate-700 font-medium">{{repo_name}}</span> | Thời điểm quét: {{timestamp}}</p>
        </div>
        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-slate-200 border border-slate-400"></span> Module Nông (Shallow)</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-slate-900 border border-slate-700"></span> Module Sâu (Deep)</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-4 border-t-2 border-dashed border-slate-400"></span> Seam</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-4 border-t-2 border-red-500"></span> Leak</span>
        </div>
      </header>

      <!-- Candidates Section -->
      <section id="candidates" class="space-y-10">
        <!-- Render candidate cards here -->
      </section>

      <!-- Top Recommendation Section -->
      <section id="top-recommendation" class="bg-emerald-950 text-emerald-50 rounded-2xl p-6 md:p-8 shadow-xl border border-emerald-800">
        <!-- Render top recommendation here -->
      </section>
    </main>
  </body>
</html>
```

---

## Candidate Card Template

Mỗi ứng viên đào sâu được đóng gói trong một thẻ `<article>` độc lập:

```html
<article class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
  <!-- Title & Badges -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
    <div>
      <h2 class="text-xl font-bold text-slate-900">1. {{candidate_title}}</h2>
      <p class="text-xs text-slate-500 mt-0.5">Phạm vi tệp tin liên quan:</p>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        <code class="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">{{file_path}}</code>
      </div>
    </div>
    <div class="flex items-center gap-2 self-start md:self-auto">
      <!-- Recommendation Strength Badge -->
      <span class="text-xs font-semibold px-2.5 py-1 rounded-full {{badge_color_class}}">
        {{Strong | Worth exploring | Speculative}}
      </span>
      <!-- Dependency Category Badge -->
      <span class="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
        {{in-process | local-substitutable | ports & adapters | mock}}
      </span>
    </div>
  </div>

  <!-- Before / After Visual Side-by-Side -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Before Diagram -->
    <div class="rounded-lg border border-red-200 bg-red-50/30 p-4 space-y-2">
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-red-700">
        <span>Hiện trạng (Before: Shallow / Leaky)</span>
      </div>
      <div class="min-h-[260px] flex items-center justify-center">
        <pre class="mermaid">
          flowchart TD
            Caller[Caller / UI] --> W1[Wrapper Helper]
            W1 --> S1[Thin Service]
            S1 -.leak.-> D[Direct Storage Access]
            classDef leak stroke:#dc2626,stroke-width:2px;
            class S1,D leak
        </pre>
      </div>
    </div>

    <!-- After Diagram -->
    <div class="rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 space-y-2">
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-700">
        <span>Đề xuất (After: Consolidated Deep Module)</span>
      </div>
      <div class="min-h-[260px] flex items-center justify-center">
        <pre class="mermaid">
          flowchart TD
            Caller[Caller / UI] -->|Clean Small Interface| DM["<b>Deep Module</b><br/>(Hides Internals & Adapters)"]
            subgraph Internals ["Private Implementation Behind Seam"]
              DM -.-> Helper[Private Helper]
              DM -.-> Adapter[Injected Adapter]
            end
            classDef deep fill:#0f172a,stroke:#334155,color:#ffffff;
            class DM deep
        </pre>
      </div>
    </div>
  </div>

  <!-- Problem & Solution Statements -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
    <div>
      <span class="font-semibold text-slate-900 block mb-1">Điểm nghẽn kiến trúc (Friction):</span>
      <p class="text-slate-600">{{one_sentence_problem}}</p>
    </div>
    <div>
      <span class="font-semibold text-slate-900 block mb-1">Giải pháp đào sâu (Deepening Solution):</span>
      <p class="text-slate-600">{{one_sentence_solution}}</p>
    </div>
  </div>

  <!-- Architectural Wins (Bullet Points) -->
  <div>
    <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">Giá trị kiến trúc đạt được (Architectural Wins):</span>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      <li class="flex items-center gap-2 text-slate-700">
        <span class="text-emerald-500 font-bold">✓</span>
        <span><b>Locality:</b> Gom toàn bộ quy tắc vào 1 chỗ duy nhất.</span>
      </li>
      <li class="flex items-center gap-2 text-slate-700">
        <span class="text-emerald-500 font-bold">✓</span>
        <span><b>Leverage:</b> 1 giao diện gọn phục vụ N nơi gọi.</span>
      </li>
      <li class="flex items-center gap-2 text-slate-700">
        <span class="text-emerald-500 font-bold">✓</span>
        <span><b>Test Surface:</b> Xóa unit tests nông; test trực tiếp qua seam interface.</span>
      </li>
      <li class="flex items-center gap-2 text-slate-700">
        <span class="text-emerald-500 font-bold">✓</span>
        <span><b>LOC Ceilings:</b> Tuân thủ hạn mức LOC quy định (Tier 1 $\le 400$, Tier 2 $\le 500$).</span>
      </li>
    </ul>
  </div>

  <!-- ADR or Domain Gotcha Callout (If applicable) -->
  {{if_conflict_or_domain_gotcha}}
  <div class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-800">
    <b>Lưu ý Domain Gotcha / ADR:</b> {{gotcha_context_and_rationale}}
  </div>
  {{/if}}
</article>
```

---

## Recommendation Strength Badges
- **Strong** (Đề xuất cao): `bg-emerald-100 text-emerald-800 border border-emerald-300`
- **Worth exploring** (Đáng cân nhắc): `bg-amber-100 text-amber-800 border border-amber-300`
- **Speculative** (Thử nghiệm / Dài hạn): `bg-slate-100 text-slate-700 border border-slate-300`

---

## Editorial Guidelines
- Súc tích, trực diện, không dài dòng.
- Sơ đồ Before/After là trái tim của mỗi Candidate Card. Nếu lời giải thích cần hơn 2 câu thì hãy vẽ lại sơ đồ cho rõ ràng hơn.
- Luôn sử dụng từ vựng chuẩn mực từ skill `codebase-design`: `module`, `interface`, `seam`, `adapter`, `depth`, `locality`, `leverage`.
