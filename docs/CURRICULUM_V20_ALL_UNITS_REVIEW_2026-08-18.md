# Bubble Space V20 全課程審稿現況 — 2026-08-18

> 本文件記錄目前 453 個 active curriculum units 的 V20 全量機器預審與第二層內容檢視結果。
>
> **它不是「453 個單元已完成人類教科書審稿」的宣告。** 依 V20 規格，在逐題盲解、官方課綱證據逐碼核對、先備反查、視覺意義審查、難度校準、出版校對與桌機／手機學生走讀完成前，所有單元都只能是 `v20-reviewing`。

## 1. 目前總狀態

- Active units：**453 / 453 已建立 V20 review record**。
- V18 runtime-ready：**453 / 453**；這只代表網站能解析內容，不代表 V20 品質通過。
- `v20-internal-ready`：**0 / 453**。
- 歷史 strict-reviewed content：33 units；V20 不直接繼承舊版「已審閱」。
- 已有逐單元官方 scope mapping 證據：**15 / 453**；其餘 **438** 必須重新逐碼核對。
- 已有 V20 明確 `prerequisite / source / check / bridge`：**0 / 453**。
- 第一層 machine preflight：P0 units = 0、P1 units = 453。這裡的 P0=0 僅代表目前自動規則沒有抓到結構性 P0，**不是內容已證明無錯**。

## 2. 第一層：V20 結構與可驗證性預審

CI 對全部 453 單元逐一檢查：runtime、答案索引、選項重複、必要素材、placeholder、題庫數量、例題結構、source traceability、課程路線、官方 scope mapping 與 prerequisite metadata。

結果：

| finding | 單元數 |
|---|---:|
| `P1:explicit-prerequisite-trace-required` | **453** |
| `P1:official-scope-mapping-required` | **438** |
| `P1:platform-extension-not-official-textbook-route` | **12** |
| machine-detected P0 unit | **0** |
| `v20-internal-ready` | **0** |

低年級英文 12 單元屬平台／校本啟蒙延伸，V20 可以審其教材品質，但不能宣稱它是全國一致的國定固定年級教科書進度。

## 3. 第二層：讀取 453 單元完整教材後的內容品質結果

本輪不是只讀 title 或 audit flag，而是匯出並分析每單元實際的 concepts、misconceptions、worked examples、questions、answers/explanations 與 visuals。

### 3.1 題庫跨單元重複 — P1

- 題目總數：**6,903**。
- 以 `context + prompt + options/sample answer` 計算，exact unique learner experiences 只有 **514**。
- **6,795 / 6,903 = 98.4%** 題目在不同單元之間原封不動重複。
- **453 / 453** 單元的跨單元 exact reuse 比例都超過 50%，全部列 `P1:cross-unit-question-bank-reuse`。

| 科目 | 題數 | 跨單元 exact reuse | 比例 | 重大重複單元 |
|---|---:|---:|---:|---:|
| 國文 | 1,080 | 1,080 | **100.0%** | 72 / 72 |
| 英文 | 1,146 | 1,080 | **94.2%** | 72 / 72 |
| 數學 | 1,305 | 1,305 | **100.0%** | 87 / 87 |
| 自然／生活 | 1,929 | 1,890 | **98.0%** | 126 / 126 |
| 社會 | 1,443 | 1,440 | **99.8%** | 96 / 96 |

這推翻了「V17/V18 contextual/concrete = 100% 就代表題庫具單元專屬性」的假設。題目可以很具體，但仍然可能只是同一具體情境被搬到完全不同的單元。

代表例：

- 國文多個不同單元共用「學生第 N 天上台朗讀、主動舉手／詢問同學」的閱讀判斷題；甚至會出現在注音、識字等並非測閱讀人物變化的單元。
- 英文大量單元共用 `Amy says, “I usually get up at 6:00 ... and walk to school after breakfast.”` 類 routine comprehension；它沒有測到各單元特定的 be 動詞、時態、句型或語用目標。
- 自然大量不同單元共用「兩株幼苗、光照 vs 不光照」操縱變因題；它適合科學方法，但不能代替細胞、力學、化學、天文等不同單元的正式題庫。
- 社會大量單元共用車站距離／人口資料推論題，不能代替地理、歷史、制度、公民議題各自需要的史料、地圖、統計或制度文本。

## 4. Worked examples — P1

總 worked examples：**1,812**。

其中國文、英文、自然、社會仍大量使用「描述如何處理一個假想情境」的模板，而沒有真的提供要分析的文本、對話、觀察資料或史料：

| 科目 | 例題總數 | 泛用模板例題 | 比例 | >=50% 泛用模板的單元 |
|---|---:|---:|---:|---:|
| 國文 | 288 | 264 | **91.7%** | 66 / 72 |
| 英文 | 288 | 268 | **93.1%** | 67 / 72 |
| 自然／生活 | 504 | 408 | **81.0%** | 120 / 126 |
| 社會 | 384 | 305 | **79.4%** | 89 / 96 |

這些列 `P1:generic-worked-example-template`。V20 的 worked example 必須把學生真的要操作的素材直接放進例題，並示範該概念本身，而不是只說「要找證據、確認情境、形成結論」。

## 5. 數學例題與單元目標錯配 — P1

數學沒有使用上面四科相同的文字模板，但存在另一種更直接的問題：數值 task family 被搬到和單元目標無關的位置。保守規則目前已抓到 **21 個數學單元／71 個 mismatch instances**；人工檢視又確認還有規則尚未覆蓋的案例，因此這個數字只是下限。

已確認代表案例：

- `g1-math-s1-u1` **100 以內的數**：例題使用 `150 - 36`、`154 - 37` 等超過 100 的數值，和單元範圍直接衝突。
- `g5-math-s1-u1` **因數與倍數**：主要例題是「150 份材料用掉 36 份後剩多少」，未示範因數、倍數、最大公因數或最小公倍數。
- `g8-math-s1-u1` **乘法公式與多項式**：出現材料減法題，未示範乘法公式或多項式運算。
- `g9-math-s1-u1` **二次方程式**：實際 worked examples 是把 4,000、51,000、620,000 等改寫成科學記號，沒有處理一元二次方程式。
- `g11-math-a-s1-u1` **三角比與三角函數**：例題只用長方形長 × 寬求面積，沒有三角比、弧度或三角函數。
- `g12-math-alpha-s1-u1` **極限與微分**：主要例題仍是材料減法，沒有極限、導數或變化率。

這些案例證明 V14–V19 的結構／深度 gate 可以被「格式完整但學科目標錯配」的內容通過；V20 必須檢查題目／例題真的在教什麼。

## 6. 視覺與「常見迷思」— P1

- **453 / 453** 單元都存在一張 comparison / misconception visual，以「只要記住『某概念』最後結論，就不需要重新檢查題目條件、文本或證據」作為所謂常見迷思。
- 這是泛用後設學習策略錯誤，不是各單元真實、可診斷的學科迷思，因此全部列 `P1:generic-meta-misconception-visual`。
- V19 已讓五科有不同的視覺 UI 語言，但底層 visual content 仍需逐單元重做／重審：數學要畫實際數學關係，自然要畫真實模型／實驗證據，社會要有真地圖／時間軸／資料，國文要有真文本結構，英文要有真對話／句型／語境。

## 7. Concept prose — P2

- Concepts 共 **3,344** 個。
- **3,344 / 3,344 = 100%** 都帶有各科固定的 subject-level closing paragraph。
- 這不一定造成學科錯誤，因此目前列 `P2:subject-wide-concept-boilerplate`；但它會膨脹文字量、讓不同概念看起來像同一模板，也正是先前使用者感受到「文字占比太大」的根源之一。

## 8. 目前所有 453 單元仍未完成的 human gates

以下 V20 gate 全部保持 `false / pending`，自動 audit 不得代替：

1. `correctnessReadThrough`：逐頁核對定義、史實、文法、科學與數學推理。
2. `curriculumEvidenceReadThrough`：逐單元用官方課綱代碼與頁面學習證據核對。
3. `prerequisiteTrace`：反查先備能力真正在前一單元／前一年級哪裡教過，並提供 check / bridge。
4. `visualMeaningReview`：逐張圖判斷是否準確、是否形成錯誤心智模型。
5. `blindSolveAllObjectiveQuestions`：所有客觀題遮住答案逐題作答／驗算。
6. `rubricReviewAllOpenQuestions`：所有開放題逐一檢查 sample answer 與 rubric。
7. `difficultyCalibration`：依年級、學習階段與前後課程校準閱讀、計算與抽象負荷。
8. `copyeditPass`：錯字、符號、單位、譯名、圖說、來源、授權與格式逐項校對。
9. `desktopStudentWalkthrough` / `mobileStudentWalkthrough`：由學生視角完整走讀。

## 9. 五科後續修訂原則

- **國文**：用真文本、字詞、句子、篇章證據重建例題與題庫；不能用同一人物變化閱讀題覆蓋注音、識字、修辭、文體與寫作。
- **英文**：每單元建立對應語法／詞彙／語用目標的自然對話、閱讀、聽力與輸出題；不再以同一 routine comprehension 充當不同單元評量。
- **數學**：優先把所有 worked examples 重新對齊單元目標，再逐題盲解；高年級的二次方程式、三角函數、極限微分等錯配優先處理。
- **自然**：用該單元實際現象、模型、量測與實驗資料建立證據鏈；操縱變因題只能出現在真的要評量實驗設計的地方。
- **社會**：以真史料、地圖、統計、制度文本與資料年份建立題目；法律、政策、人口與經濟資料必須保留查核日期與來源。

## 10. 發佈／命名規則

- 現階段 **453 / 453 均為 `v20-reviewing`**。
- `v20-internal-ready = 0`。
- 舊 V15 的 15 個 `textbook-ready` 是歷史內部標記，**不得解讀為 V20 通過**。
- 「build 成功」「V18 ready」「V19 visual-first」都不能抵銷任何 V20 P0/P1。
- 在 human gates 完成前，對外只能說「已進入 V20 全課程審稿」，不可說「453 個單元已達教科書級」。

## 11. 可重現工具

- `npm run curriculum:v20-review`
  - `scripts/audit-curriculum-v20-all-units.mjs`
  - `scripts/audit-curriculum-v20-content-quality.mjs`
- `scripts/export-curriculum-v20-review-dataset.mjs`
  - 匯出 453 個單元的完整 concepts / examples / questions / visuals 供逐單元深審。
- CI 會上傳 `v20-review-dataset` artifact；任何後續修訂都要重新跑，確保問題不是只在單一頁面被手動遮掉。

這份結果的目的不是證明「教材很好」，而是第一次把 V20 標準套到全部內容後，**誠實指出目前為什麼還不能叫教科書級，以及每一類問題要如何被真正修掉。**
