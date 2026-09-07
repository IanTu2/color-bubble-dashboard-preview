# Bubble Space v2 Preview

Bubble Space 的 React + TypeScript 雲端測試站。

## 環境用途

- 本 Repository：新版測試服
- 正式版 Repository：`IanTu2/color-bubble-dashboard`
- 正式版網址：`https://iantu2.github.io/color-bubble-dashboard/`
- 測試版網址：`https://iantu2.github.io/color-bubble-dashboard-preview/`

## 技術架構

- React
- TypeScript
- Vite
- GitHub Codespaces
- GitHub Actions
- GitHub Pages

## 發布規則

推送至 `main` 後，由 GitHub Actions 在雲端執行 TypeScript 檢查、建置並部署測試站。此 Repository 不存放任何 Supabase 密碼、外部 API Key 或其他秘密資料。

## 輔助教材重整（2026-09）

- 左側學習入口改為「輔助教材區」；英文提供 EPOP 式情境填空與多鄰國式線性闖關兩種模式。自編內容，非兩家官方課程或完整複製版。
- 闖關第一批為 6 個生活英文單元、18 句自編教材，衍生 54 個選詞／組句／聽寫練習。關末重新練習錯題，全部答對後解鎖下一單元。
- 歷史與人體生物僅顯示「籌備中」，尚無可用教材。
- 舊年級課程入口、首頁繼續上課卡片與舊課程視窗恢復已下架；原始教材與資料庫不刪除。
- 新闖關進度依使用者儲存在目前瀏覽器，不跨裝置同步；舊英文進度沿用既有儲存鍵。
- `predev` / `prebuild` / `pretypecheck` 保留詞庫生成及英文檢查，不再自動執行要求舊課程導覽存在的 `curriculum:audit`。完整舊課程稽核指令仍保留供未來重建使用；此次不宣稱舊 453 課程通過品質稽核。
- 教學流程參考：https://epop.ai/tw 、https://blog.duolingo.com/new-duolingo-home-screen-design/ 。未進行登入 App 的逐畫面比對。
