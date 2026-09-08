# 輔助教材重整：工作接續點

## 使用者決定

- 近期以輔助教材區為主；英文分 EPOP 式情境練習及多鄰國式闖關，歷史、人體生物之後再加入。
- 2026-09-07 已明確授權完成後直接推送，本次推送至 `feat/supplementary-materials`，建立可審查的 PR。
- 若可觀測的五小時剩餘額度低於或等於 15%，完成當前小段、保存程式與接續資訊後停止，不展開新段落。目前 Work 工具沒有剩餘額度讀取介面，無法自動監控這個條件。若使用者提供額度資訊，依其資訊執行。不要把 context/token budget 誤當帳戶額度。
- 每個完整小段提交保存，避免必須等到額度門檻才留存。

## 已完成

- 舊課程入口、首頁繼續上課卡片與旧課程視窗恢復下架；保留原始教材、使用者資料。
- 輔助教材選單及兩種英文模式；闖關 6 單元、18 句原創教材對應 54 練習。
- 闖關循序解鎖、錯題重做、瀏覽器內進度保存；歷史與人體生物僅籌備中入口。
- 待辦讀取僅遇到缺少欄位才嘗試舊資料表格式，網路／權限／登入錯誤直接回報，避免一次失敗送三次查詢。
- TypeScript、Vite 建置及英文題庫檢查通過；新增待辦回退行為測試。尚未做登入瀏覽器互動測試。

## 資料庫評估與決定

先保留 Supabase/PostgreSQL，不新增資料庫服務，也不重建或清空資料。現有程式證據顯示的問題是儲存方式與版本分散，尚無效能或平台功能不足的證據。Supabase 本身提供完整 PostgreSQL、Auth 及 RLS，換供應商無法自動改善資料表設計。

| 資料 | 程式目前使用位置 | 後續整理方向（尚未實作） |
| --- | --- | --- |
| 登入帳號 | Supabase Auth | 保留既有帳號及 user id |
| 待辦 | Supabase todos，支援三種欄位版本 | 先取得實際 schema/RLS，再用新增 migration 統一 |
| 筆記 | 使用者分隔的 localStorage | 若要跨裝置，另做備份、匯入與雲端同步 |
| 英文進度 | 多個 localStorage key | 分清兩種模式，版本化保存；未宣稱雲端同步 |
| 教材／題庫 | TypeScript 靜態資料 | 先維持可審查的自編內容；日後有線上編輯需求再設計 subjects/units/exercises |

目前只檢視 repository 內的 migration 與呼叫方式，未取得遠端管理連線、完整 schema、RLS policy 或實際效能數據，因此不宣稱已完成資料庫全面健檢。此次沒有執行遠端 SQL 或資料搬移。

官方參考：https://supabase.com/docs/guides/database/overview 、https://supabase.com/docs/guides/database/postgres/row-level-security 、https://supabase.com/docs/guides/deployment/database-migrations 。

## 下次工作

1. 依使用者回饋確認兩種模式畫面與操作細節；目前非官方 App 的逐畫面複製版本。
2. 如要實作雲端教材／進度，再取得 schema 與 RLS 的唯讀資訊，規劃新增表與原有 localStorage 資料匯入，不憑空假設線上結構。
3. 歷史、人體生物尚無課程內容，待使用者決定範圍後展開。
