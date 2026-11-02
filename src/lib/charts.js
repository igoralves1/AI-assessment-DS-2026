// D3 charts for the Results page. Colors come from CSS variables (see .viz in style.css), so light and
// dark mode each use their own validated steps. Every chart has a hover tooltip; values are also shown
// in tables on the page.
import * as d3 from 'd3'
import { LEVEL_NAMES, levelOf } from './scoring.js'

const LEVEL_VAR = (l) => `var(--viz-l${l})`
const LEVEL_INK = (l) => (l >= 3 ? '#ffffff' : '#0b0b0b')
// Sequential blue ramp (100 -> 700) for 0–100 indices.
const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b']
export const seqColor = d3.scaleSequential(d3.interpolateRgbBasis(SEQ)).domain([0, 100])
const fmt = (v) => (v == null ? '—' : Math.round(v))
const BANDS = [[0, 25, 1], [25, 50, 2], [50, 75, 3], [75, 100, 4]]

// ---- tooltip ---------------------------------------------------------------
let tip
function tooltip() {
  if (!tip) tip = d3.select('body').append('div').attr('class', 'viz-tip').attr('role', 'status').style('opacity', 0)
  return tip
}
function hover(sel, html) {
  sel.on('pointerenter pointermove', (e, d) => {
    tooltip().html(html(d)).style('opacity', 1)
      .style('left', `${Math.min(e.pageX + 14, window.scrollX + window.innerWidth - 260)}px`).style('top', `${e.pageY + 14}px`)
  }).on('pointerleave', () => tooltip().style('opacity', 0))
}
const svgIn = (el, w, h) => d3.select(el).html('').append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('role', 'img')
const widthOf = (el, min = 320) => Math.max(min, el.clientWidth || 640)
const axisStyle = (g) => {
  g.selectAll('text').attr('fill', 'var(--viz-muted)').style('font-size', '11px')
  g.selectAll('line,path').attr('stroke', 'var(--viz-axis)')
}

// ---- horizontal bars: benchmark per university ------------------------------
export function benchmarkBars(el, rows, { selected, onPick } = {}) {
  const w = widthOf(el), rowH = 26, m = { t: 26, r: 46, b: 26, l: 170 }
  const h = m.t + m.b + rows.length * rowH
  const svg = svgIn(el, w, h).attr('aria-label', 'Benchmark index by university')
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, w - m.r])
  const y = d3.scaleBand().domain(rows.map((r) => r.id)).range([m.t, h - m.b]).padding(0.25)
  // level bands
  svg.append('g').selectAll('text').data(BANDS).join('text')
    .attr('x', (b) => (x(b[0]) + x(b[1])) / 2).attr('y', 14).attr('text-anchor', 'middle')
    .attr('fill', 'var(--viz-muted)').style('font-size', '11px').text((b) => `Level ${b[2]} · ${LEVEL_NAMES[b[2] - 1]}`)
  svg.append('g').selectAll('line').data([25, 50, 75]).join('line')
    .attr('x1', x).attr('x2', x).attr('y1', m.t - 6).attr('y2', h - m.b).attr('stroke', 'var(--viz-grid)').attr('stroke-dasharray', '3 3')
  svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(5).tickSizeOuter(0)).call(axisStyle)
  const g = svg.append('g').selectAll('g').data(rows).join('g').attr('cursor', onPick ? 'pointer' : null)
    .on('click', (e, r) => onPick && onPick(r.id))
  g.append('rect').attr('x', x(0)).attr('y', (r) => y(r.id) - 3).attr('width', w - m.r - x(0)).attr('height', y.bandwidth() + 6).attr('fill', 'transparent')
  g.append('rect').attr('x', x(0)).attr('y', (r) => y(r.id)).attr('height', y.bandwidth())
    .attr('width', (r) => Math.max(2, x(r.value) - x(0))).attr('rx', 4).attr('fill', (r) => LEVEL_VAR(r.level))
    .attr('stroke', (r) => (r.id === selected ? 'var(--viz-ink)' : 'none')).attr('stroke-width', 2)
  g.append('text').attr('x', m.l - 8).attr('y', (r) => y(r.id) + y.bandwidth() / 2).attr('dy', '0.35em').attr('text-anchor', 'end')
    .attr('fill', 'var(--viz-ink)').style('font-size', '12px').style('font-weight', (r) => (r.id === selected ? 700 : 400)).text((r) => r.name)
  g.append('text').attr('x', (r) => x(r.value) + 6).attr('y', (r) => y(r.id) + y.bandwidth() / 2).attr('dy', '0.35em')
    .attr('fill', 'var(--viz-ink2)').style('font-size', '12px').style('font-variant-numeric', 'tabular-nums').text((r) => fmt(r.value))
  hover(g, (r) => `<b>${r.name}</b><br>Benchmark ${fmt(r.value)} · Level ${r.level} (${LEVEL_NAMES[r.level - 1]})<br>Funding readiness ${fmt(r.funding)}`)
}

// ---- heatmap: rows × columns of 0–100 values ------------------------------
export function heatmap(el, rows, cols, value, { onPick } = {}) {
  const w = widthOf(el, 560), m = { t: 96, r: 40, b: 8, l: 170 }
  const cw = (w - m.l - m.r) / cols.length, ch = 26
  const h = m.t + m.b + rows.length * ch
  const svg = svgIn(el, w, h).attr('aria-label', 'Heatmap of indices by university')
  svg.append('g').selectAll('text').data(cols).join('text')
    .attr('transform', (c, i) => `translate(${m.l + i * cw + cw / 2},${m.t - 8}) rotate(-40)`)
    .attr('fill', (c) => (c.strong ? 'var(--viz-ink)' : 'var(--viz-ink2)')).style('font-size', '11px').style('font-weight', (c) => (c.strong ? 700 : 400)).text((c) => c.label)
  svg.append('g').selectAll('text').data(rows).join('text').attr('x', m.l - 8).attr('y', (r, i) => m.t + i * ch + ch / 2).attr('dy', '0.35em')
    .attr('text-anchor', 'end').attr('fill', 'var(--viz-ink)').style('font-size', '12px').attr('cursor', onPick ? 'pointer' : null)
    .text((r) => r.name).on('click', (e, r) => onPick && onPick(r.id))
  const cells = rows.flatMap((r, i) => cols.map((c, j) => ({ r, c, i, j, v: value(r, c) })))
  const g = svg.append('g').selectAll('g').data(cells).join('g')
  g.append('rect').attr('x', (d) => m.l + d.j * cw + 1).attr('y', (d) => m.t + d.i * ch + 1).attr('width', cw - 2).attr('height', ch - 2).attr('rx', 3)
    .attr('fill', (d) => (d.v == null ? 'var(--viz-grid)' : seqColor(d.v)))
  g.append('text').attr('x', (d) => m.l + d.j * cw + cw / 2).attr('y', (d) => m.t + d.i * ch + ch / 2).attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', (d) => (d.v > 45 ? '#ffffff' : '#0b0b0b')).style('font-size', '11px').style('font-variant-numeric', 'tabular-nums').text((d) => fmt(d.v))
  hover(g, (d) => `<b>${d.r.name}</b><br>${d.c.full || d.c.label}: ${fmt(d.v)} (level ${levelOf(d.v) ?? '—'})`)
}

// ---- boxplots with points ----------------------------------------------------
export function boxplots(el, groups) {
  const w = widthOf(el, 560), m = { t: 12, r: 12, b: 96, l: 40 }, h = 340
  const svg = svgIn(el, w, h).attr('aria-label', 'Distribution of indices across universities')
  const x = d3.scaleBand().domain(groups.map((g) => g.key)).range([m.l, w - m.r]).padding(0.35)
  const y = d3.scaleLinear().domain([0, 100]).range([h - m.b, m.t])
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(w - m.l - m.r))).call(axisStyle)
    .call((g) => g.selectAll('.tick line').attr('stroke', 'var(--viz-grid)')).call((g) => g.select('.domain').remove())
  svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).tickFormat((k) => groups.find((g) => g.key === k).label).tickSizeOuter(0)).call(axisStyle)
    .selectAll('text').attr('transform', 'rotate(-35)').attr('text-anchor', 'end').attr('dx', '-0.4em').attr('dy', '0.6em')
  const bw = x.bandwidth()
  const g = svg.append('g').selectAll('g').data(groups).join('g').attr('transform', (d) => `translate(${x(d.key)},0)`)
  g.append('line').attr('x1', bw / 2).attr('x2', bw / 2).attr('y1', (d) => y(d.stats.min)).attr('y2', (d) => y(d.stats.max)).attr('stroke', 'var(--viz-ink2)')
  g.append('rect').attr('x', 0).attr('width', bw).attr('y', (d) => y(d.stats.q3)).attr('height', (d) => Math.max(1, y(d.stats.q1) - y(d.stats.q3)))
    .attr('rx', 4).attr('fill', 'var(--viz-s1-soft)').attr('stroke', 'var(--viz-s1)')
  g.append('line').attr('x1', 0).attr('x2', bw).attr('y1', (d) => y(d.stats.median)).attr('y2', (d) => y(d.stats.median)).attr('stroke', 'var(--viz-ink)').attr('stroke-width', 2)
  hover(g.select('rect'), (d) => `<b>${d.label}</b><br>Median ${fmt(d.stats.median)} · IQR ${fmt(d.stats.q1)}–${fmt(d.stats.q3)}<br>Min ${fmt(d.stats.min)} · Max ${fmt(d.stats.max)} · n ${d.stats.n}`)
  const pts = g.selectAll('circle').data((d) => d.values.map((v, i) => ({ ...v, label: d.label, i }))).join('circle')
    .attr('cx', (p) => bw / 2 + ((p.i % 5) - 2) * Math.min(4, bw / 12)).attr('cy', (p) => y(p.v)).attr('r', 4)
    .attr('fill', (p) => LEVEL_VAR(levelOf(p.v))).attr('stroke', 'var(--viz-surface)').attr('stroke-width', 1.5)
  hover(pts, (p) => `<b>${p.name}</b><br>${p.label}: ${fmt(p.v)}`)
}

// ---- scatter: benchmark vs funding readiness -------------------------------
export function scatter(el, pts, { onPick } = {}) {
  const w = widthOf(el, 420), h = 380, m = { t: 16, r: 16, b: 44, l: 48 }
  const svg = svgIn(el, w, h).attr('aria-label', 'Benchmark versus funding readiness')
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, w - m.r])
  const y = d3.scaleLinear().domain([0, 100]).range([h - m.b, m.t])
  svg.append('rect').attr('x', x(50)).attr('y', y(100)).attr('width', x(100) - x(50)).attr('height', y(50) - y(100)).attr('fill', 'var(--viz-s1-soft)')
  svg.append('text').attr('x', x(98)).attr('y', y(97)).attr('text-anchor', 'end').attr('fill', 'var(--viz-ink2)').style('font-size', '12px').text('Best placed to use a grant')
  svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(5)).call(axisStyle)
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5)).call(axisStyle)
  svg.append('text').attr('x', (m.l + w - m.r) / 2).attr('y', h - 8).attr('text-anchor', 'middle').attr('fill', 'var(--viz-muted)').style('font-size', '12px').text('Benchmark (health informatics maturity)')
  svg.append('text').attr('transform', `translate(14,${(m.t + h - m.b) / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('fill', 'var(--viz-muted)').style('font-size', '12px').text('Funding readiness (foundations)')
  const g = svg.append('g').selectAll('g').data(pts).join('g').attr('cursor', onPick ? 'pointer' : null).on('click', (e, p) => onPick && onPick(p.id))
  g.append('circle').attr('cx', (p) => x(p.x)).attr('cy', (p) => y(p.y)).attr('r', 9).attr('fill', (p) => LEVEL_VAR(p.level)).attr('stroke', 'var(--viz-surface)').attr('stroke-width', 2)
  g.append('text').attr('x', (p) => x(p.x)).attr('y', (p) => y(p.y)).attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', (p) => LEVEL_INK(p.level)).style('font-size', '10px').style('font-weight', 700).text((p) => p.id)
  hover(g, (p) => `<b>${p.name}</b><br>Benchmark ${fmt(p.x)} · Funding readiness ${fmt(p.y)}`)
}

// ---- gauge -------------------------------------------------------------------
export function gauge(el, value, level) {
  const w = 260, h = 196, r = 110, cx = w / 2, cy = 124
  const svg = svgIn(el, w, h).attr('aria-label', `Benchmark ${fmt(value)} of 100`)
  const a = d3.scaleLinear().domain([0, 100]).range([-Math.PI / 2, Math.PI / 2])
  const arc = d3.arc().innerRadius(r - 22).outerRadius(r).cornerRadius(3)
  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`)
  g.selectAll('path.band').data(BANDS).join('path').attr('class', 'band')
    .attr('d', (b) => arc({ startAngle: a(b[0]) + 0.01, endAngle: a(b[1]) - 0.01 })).attr('fill', (b) => LEVEL_VAR(b[2])).attr('opacity', (b) => (b[2] === level ? 1 : 0.28))
  const t = a(value ?? 0)
  g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', Math.sin(t) * (r - 30)).attr('y2', -Math.cos(t) * (r - 30)).attr('stroke', 'var(--viz-ink)').attr('stroke-width', 3).attr('stroke-linecap', 'round')
  g.append('circle').attr('r', 6).attr('fill', 'var(--viz-ink)')
  g.append('text').attr('y', 46).attr('text-anchor', 'middle').attr('fill', 'var(--viz-ink)').style('font-size', '34px').style('font-weight', 700).text(fmt(value))
  g.append('text').attr('y', 66).attr('text-anchor', 'middle').attr('fill', 'var(--viz-ink2)').style('font-size', '12px').text(`Level ${level} · ${LEVEL_NAMES[level - 1]}`)
}

// ---- radar: domains, school vs group average ----------------------------------
export function radar(el, axes, series) {
  const w = Math.min(widthOf(el, 340), 520), h = w, cx = w / 2, cy = h / 2, R = w / 2 - 78
  const svg = svgIn(el, w, h).attr('aria-label', 'Domain profile compared with the average of all universities')
  const ang = (i) => (i / axes.length) * 2 * Math.PI - Math.PI / 2
  const rs = d3.scaleLinear().domain([0, 100]).range([0, R])
  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`)
  for (const v of [25, 50, 75, 100]) g.append('circle').attr('r', rs(v)).attr('fill', 'none').attr('stroke', 'var(--viz-grid)')
  axes.forEach((ax, i) => {
    g.append('line').attr('x2', Math.cos(ang(i)) * R).attr('y2', Math.sin(ang(i)) * R).attr('stroke', 'var(--viz-grid)')
    const lx = Math.cos(ang(i)) * (R + 14), ly = Math.sin(ang(i)) * (R + 14)
    g.append('text').attr('x', lx).attr('y', ly).attr('dy', '0.35em').attr('text-anchor', Math.abs(lx) < 8 ? 'middle' : lx > 0 ? 'start' : 'end')
      .attr('fill', 'var(--viz-ink2)').style('font-size', '11px').text(ax.label)
  })
  const line = d3.lineRadial().angle((d, i) => ang(i) + Math.PI / 2).radius((d) => rs(d ?? 0)).curve(d3.curveLinearClosed)
  series.forEach((s) => {
    g.append('path').attr('d', line(axes.map((ax) => s.values[ax.key]))).attr('fill', s.color).attr('fill-opacity', s.fill ? 0.18 : 0)
      .attr('stroke', s.color).attr('stroke-width', 2).attr('stroke-dasharray', s.dashed ? '5 4' : null)
    const dots = g.selectAll(null).data(axes).join('circle').attr('r', 4.5)
      .attr('cx', (ax, i) => Math.cos(ang(i)) * rs(s.values[ax.key] ?? 0)).attr('cy', (ax, i) => Math.sin(ang(i)) * rs(s.values[ax.key] ?? 0))
      .attr('fill', s.color).attr('stroke', 'var(--viz-surface)').attr('stroke-width', 1.5)
    hover(dots, (ax) => `<b>${ax.label}</b><br>${s.name}: ${fmt(s.values[ax.key])}`)
  })
}

// ---- bars per group of questions with group-average marker ---------------------
export function partBars(el, rows) {
  const w = widthOf(el), rowH = 30, m = { t: 8, r: 40, b: 26, l: 230 }
  const h = m.t + m.b + rows.length * rowH
  const svg = svgIn(el, w, h).attr('aria-label', 'Maturity index by group of questions')
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, w - m.r])
  const y = d3.scaleBand().domain(rows.map((r) => r.key)).range([m.t, h - m.b]).padding(0.28)
  svg.append('g').selectAll('line').data([25, 50, 75]).join('line').attr('x1', x).attr('x2', x).attr('y1', m.t).attr('y2', h - m.b).attr('stroke', 'var(--viz-grid)').attr('stroke-dasharray', '3 3')
  svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(5).tickSizeOuter(0)).call(axisStyle)
  const g = svg.append('g').selectAll('g').data(rows).join('g')
  g.append('text').attr('x', m.l - 8).attr('y', (r) => y(r.key) + y.bandwidth() / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('fill', 'var(--viz-ink)').style('font-size', '12px').text((r) => r.label)
  g.append('rect').attr('x', x(0)).attr('y', (r) => y(r.key)).attr('height', y.bandwidth()).attr('width', (r) => Math.max(2, x(r.value ?? 0) - x(0))).attr('rx', 4).attr('fill', (r) => LEVEL_VAR(levelOf(r.value) ?? 1))
  g.append('line').attr('x1', (r) => x(r.avg)).attr('x2', (r) => x(r.avg)).attr('y1', (r) => y(r.key) - 4).attr('y2', (r) => y(r.key) + y.bandwidth() + 4).attr('stroke', 'var(--viz-s2)').attr('stroke-width', 3)
  g.append('text').attr('x', (r) => x(Math.max(r.value ?? 0, r.avg)) + 8).attr('y', (r) => y(r.key) + y.bandwidth() / 2).attr('dy', '0.35em').attr('fill', 'var(--viz-ink2)').style('font-size', '12px').text((r) => fmt(r.value))
  hover(g, (r) => `<b>${r.label}</b><br>This university: ${fmt(r.value)} (level ${levelOf(r.value)})<br>Average of 15: ${fmt(r.avg)}`)
}

// ---- departments with course dots ------------------------------------------------
export function deptBars(el, depts) {
  const w = widthOf(el), rowH = 34, m = { t: 8, r: 40, b: 26, l: 230 }
  const h = m.t + m.b + depts.length * rowH
  const svg = svgIn(el, w, h).attr('aria-label', 'Benchmark by department, with each course as a dot')
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, w - m.r])
  const y = d3.scaleBand().domain(depts.map((d) => d.name)).range([m.t, h - m.b]).padding(0.3)
  svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(5).tickSizeOuter(0)).call(axisStyle)
  const g = svg.append('g').selectAll('g').data(depts).join('g')
  g.append('text').attr('x', m.l - 8).attr('y', (d) => y(d.name) + y.bandwidth() / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('fill', 'var(--viz-ink)').style('font-size', '12px').text((d) => d.name)
  g.append('rect').attr('x', x(0)).attr('y', (d) => y(d.name)).attr('height', y.bandwidth()).attr('width', (d) => Math.max(2, x(d.value) - x(0))).attr('rx', 4).attr('fill', 'var(--viz-s1-soft)')
  const dots = g.selectAll('circle').data((d) => d.courses.map((c) => ({ ...c, dept: d }))).join('circle')
    .attr('cx', (c) => x(c.value)).attr('cy', (c) => y(c.dept.name) + y.bandwidth() / 2).attr('r', 6)
    .attr('fill', (c) => LEVEL_VAR(levelOf(c.value))).attr('stroke', 'var(--viz-surface)').attr('stroke-width', 2)
  hover(dots, (c) => `<b>${c.code}</b><br>${c.dept.name}<br>Course benchmark ${fmt(c.value)}`)
  g.append('text').attr('x', (d) => x(Math.max(d.value, ...d.courses.map((c) => c.value))) + 12).attr('y', (d) => y(d.name) + y.bandwidth() / 2).attr('dy', '0.35em').attr('fill', 'var(--viz-ink2)').style('font-size', '12px').text((d) => fmt(d.value))
}

// ---- per-question matrix (HTML built with D3) ------------------------------------
export function itemMatrix(el, parts) {
  const root = d3.select(el).html('')
  const part = root.selectAll('div.im-part').data(parts).join('div').attr('class', 'im-part')
  part.append('div').attr('class', 'im-title').text((p) => `Part ${p.id} · ${p.title}`)
  const cells = part.append('div').attr('class', 'im-cells').selectAll('div').data((p) => p.items).join('div').attr('class', 'im-cell')
    .style('background', (it) => (it.value == null ? 'var(--viz-grid)' : LEVEL_VAR(Math.round(it.value))))
    .style('color', (it) => (it.value == null ? 'var(--viz-ink)' : LEVEL_INK(Math.round(it.value))))
    .attr('tabindex', 0).attr('aria-label', (it) => `${it.id} ${it.title}: level ${it.value == null ? 'unknown' : it.value.toFixed(1)}`)
  cells.append('span').attr('class', 'im-id').text((it) => it.id)
  cells.append('span').attr('class', 'im-v').text((it) => (it.value == null ? '—' : it.value.toFixed(1)))
  hover(cells, (it) => `<b>${it.id} · ${it.title}</b><br>Mean level ${it.value == null ? '—' : it.value.toFixed(1)} (${it.value == null ? '—' : LEVEL_NAMES[Math.round(it.value) - 1]})<br><i>Target:</i> ${it.target}${it.value != null && it.value < 3 ? `<br><i>Next step:</i> ${it.next}` : ''}`)
}
