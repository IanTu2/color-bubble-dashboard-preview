import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const failures = []
const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()

function expect(unit, label, required, forbidden = []) {
  if (!unit) { failures.push(`${label}: unit missing`); return }
  const text = norm(`${unit.overview} ${(unit.objectives ?? []).join(' ')} ${(unit.workedExamples ?? []).map((e) => `${e.context} ${e.prompt} ${e.answer} ${e.explanation}`).join(' ')} ${(unit.questions ?? []).map((q) => `${q.context} ${q.prompt} ${q.kind === 'choice' ? q.options?.join(' ') : q.sampleAnswer} ${q.explanation}`).join(' ')} ${(unit.takeaway ?? []).join(' ')}`)
  for (const pattern of required) if (!pattern.test(text)) failures.push(`${label}: required evidence missing: ${pattern}`)
  for (const pattern of forbidden) if (pattern.test(text)) failures.push(`${label}: forbidden stale task remains: ${pattern}`)
}

try {
  const v20 = await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed.ts')
  const get = (id) => v20.getTextbookUnitContentV20Reviewed(id)

  expect(get('g1-math-s1-u1'), 'G1 Math 100內', [/個十/, /個一/, /100 以內/], [/150\s*-\s*36/, /科學記號/, /3 個千/])
  expect(get('g2-math-s1-u1'), 'G2 Math 1000內', [/個百/, /個十/, /個一/], [/3 個千/, /3133/])
  expect(get('g1-math-s1-u3'), 'G1 Math 形狀位置', [/圓形|三角形|正方形/, /右邊|上方/], [/面積是多少/])
  expect(get('g5-math-s1-u1'), 'G5 Math 因數倍數', [/最大公因數|因數|倍數/], [/份材料.*用掉/, /科學記號/])
  expect(get('g7-math-s1-u3'), 'G7 Math 一元一次方程式', [/x/, /方程式|等量/], [/科學記號/])
  expect(get('g7-math-s2-u2'), 'G7 Math 二元聯立', [/x\+y/, /x-y|x−y/, /\(x,y\)/], [/份資料.*剩/])
  expect(get('g8-math-s1-u1'), 'G8 Math 多項式', [/展開/, /x²/], [/總共有多少個/])
  expect(get('g9-math-s1-u1'), 'G9 Math 二次方程式', [/x²/, /因式分解|兩根|所有實數解/, /x\s*=/], [/科學記號/])
  expect(get('g11-math-a-s1-u1'), 'G11 Math A 三角', [/sin/, /對邊/, /斜邊/], [/長方形.*面積/])
  expect(get('g12-math-alpha-s1-u3'), 'G12 Math甲 積分', [/∫/, /定積分|反導/], [/瞬時變化率/])

  expect(get('g7-english-s1-u1'), 'G7 English Be', [/form of be|\bis\b|\bare\b/i], [/walk to school after breakfast/i])
  expect(get('g7-social-s1-u1'), 'G7 Social 臺灣位置', [/地圖|比例尺|圖例|方向/], [/車站距離/])
  expect(get('g7-chinese-s1-u1'), 'G7 Chinese 語文工具', [/語境|字詞|謹慎|小心仔細/], [/主動舉手.*朗讀/])
  expect(get('g7-science-s1-u1'), 'G7 Science 科學方法與細胞', [/細胞膜|細胞核|細胞質/, /物質進出/], [/pH=/])
  expect(get('g12-physics-s1-u2'), 'G12 Physics 電磁學', [/電阻|電壓|歐姆|電流/], [/聲源振動頻率/])
  expect(get('g12-physics-s2-u1'), 'G12 Physics 近代物理', [/光電子|光子|頻率|量子/], [/pH=/])
} finally {
  await server.close()
}

if (failures.length) {
  console.error('[curriculum-v20-known-mismatches] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('[curriculum-v20-known-mismatches] PASS: representative confirmed mismatch units now use title/focus-specific V20 reviewed tasks.')
