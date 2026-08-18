import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const failures = []
const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()

function expect(unit, label, required, forbidden = []) {
  if (!unit) { failures.push(`${label}: unit missing`); return }
  const example = unit.workedExamples?.[0]
  const check = unit.questions?.find((q) => q.id.includes('-ped-v17-check-')) ?? unit.questions?.[0]
  const text = norm(`${example?.context} ${example?.prompt} ${example?.answer} ${example?.explanation} ${check?.context} ${check?.prompt} ${check?.kind === 'choice' ? check.options?.join(' ') : check?.sampleAnswer}`)
  for (const pattern of required) if (!pattern.test(text)) failures.push(`${label}: required evidence missing: ${pattern}`)
  for (const pattern of forbidden) if (pattern.test(text)) failures.push(`${label}: forbidden stale task remains: ${pattern}`)
}

try {
  const v20 = await server.ssrLoadModule('/src/curriculum-textbook-v20-pass1.ts')
  const get = (id) => v20.getTextbookUnitContentV20Pass1(id)

  expect(get('g1-math-s1-u1'), 'G1 Math 100內', [/100 以內|100以內/, /\d+\s*-\s*\d+|拿走/], [/150\s*-\s*36/, /科學記號/])
  expect(get('g5-math-s1-u1'), 'G5 Math 因數倍數', [/最大公因數|因數|倍數/], [/份材料.*用掉/, /科學記號/])
  expect(get('g8-math-s1-u1'), 'G8 Math 多項式', [/展開|多項式|x²/], [/份材料.*用掉/])
  expect(get('g9-math-s1-u1'), 'G9 Math 二次方程式', [/x²/, /方程式|因式分解/, /x\s*=/], [/4,?000.*51,?000/, /科學記號/])
  expect(get('g11-math-a-s1-u1'), 'G11 Math A 三角', [/sin|三角/, /對邊|斜邊/], [/長方形.*面積/])
  expect(get('g12-math-alpha-s1-u1'), 'G12 Math甲 微分', [/f′|導數|瞬時變化率|微分/], [/份材料.*用掉/])

  expect(get('g7-english-s1-u1'), 'G7 English Be', [/form of be|\bis\b|\bare\b/i], [/walk to school after breakfast/i])
  expect(get('g7-social-s1-u1'), 'G7 Social 臺灣位置', [/臺灣|地圖|圖例|比例尺|海域|地形/], [/車站距離/, /人口變化.*唯一/])
  expect(get('g7-chinese-s1-u1'), 'G7 Chinese 語文工具', [/字音|注音|字典|工具|讀音|聲調|部首/], [/第\s*\d+\s*天上台朗讀.*主動舉手/])
  expect(get('g7-science-s1-u1'), 'G7 Science 科學方法與細胞', [/細胞|構造|細胞膜|細胞核|觀察/], [])
} finally {
  await server.close()
}

if (failures.length) {
  console.error('[curriculum-v20-known-mismatches] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('[curriculum-v20-known-mismatches] PASS: representative previously confirmed mismatch units now surface unit-targeted learner evidence.')
