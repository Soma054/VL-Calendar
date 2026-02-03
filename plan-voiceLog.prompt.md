## Plan: カレンダー＋日次詳細＋録音/IndexedDB をモック完成

現状は Vite + React/TS + Tailwind(v3) + Dexie + date-fns まで入っていて、DB層（entries/recordings）と最低限のUI部品（Button/Card/Input/Textarea/Badge）が用意されています。一方で画面はまだ Vite のデフォルト (App.tsx) のままなので、ここを「月カレンダー＋日付詳細パネル」に置き換え、`MediaRecorder` による録音・既存音声のアップロード・再生・削除を Dexie(IndexedDB) に保存する流れまで繋げれば、MVPモックが完成します。

**Steps**
1. Appをアプリ本体に差し替え  
   - [src/App.tsx](src/App.tsx) を「左：月カレンダー / 右：選択日の詳細」レイアウトに変更  
   - [src/App.css](src/App.css) の依存を外す（Tailwindのみで表示）
2. カレンダー（月表示）コンポーネント追加  
   - [src/components/CalendarMonth.tsx](src/components/CalendarMonth.tsx) を新規作成  
   - [src/lib/date.ts](src/lib/date.ts) の `buildCalendarDays` / `toIsoDateString` を使って 6週グリッドを描画  
   - 月移動（前/次/月初へ）と、選択日ハイライトを実装
3. 「記録がある日」マーカーを表示  
   - [src/db/repository.ts](src/db/repository.ts) の `getDatesWithDataInRange` を月のグリッド範囲で呼び、Set を Calendar に渡す  
   - カレンダーの各日セルに「●」などの小さいインジケータを表示
4. 日次詳細（メモ/課題）パネル追加  
   - [src/components/DayDetail.tsx](src/components/DayDetail.tsx) を新規作成  
   - 日付変更時に `getOrCreateEntry(date)` で読み込み、memo/tasks を編集  
   - 保存ボタンで `saveEntry({date, memo, tasks})` を呼ぶ（学習者向けに挙動が分かりやすい）
5. 録音（MediaRecorder）コンポーネント追加  
   - [src/components/Recorder.tsx](src/components/Recorder.tsx) を新規作成  
   - `navigator.mediaDevices.getUserMedia({ audio: true })` → `new MediaRecorder(stream)` → `dataavailable` を収集  
   - stop時に Blob を作って `addRecording({ date, name, mimeType, blob })` に保存  
   - 録音中表示・停止・エラーハンドリング（権限拒否など）を実装
6. アップロード＋再生＋削除一覧  
   - [src/components/RecordingList.tsx](src/components/RecordingList.tsx) を新規作成  
   - `listRecordings(date)` を表示し、`audio` タグでその場再生（`URL.createObjectURL` を使い、表示更新時に `revokeObjectURL` で後始末）  
   - `<input type="file" accept="audio/*">` から追加し `addRecording`  
   - 削除ボタンで `deleteRecording(id)` → 再取得
7. Tailwind/全体の見た目を最小で整える  
   - [src/index.css](src/index.css) は既に Tailwind directives になっているので、UIの余白/見出し/レイアウトのみ追加
8. READMEを「学習用モック」として整備  
   - [README.md](README.md) に、必要権限（マイク）、保存先（IndexedDB）、起動手順、データ消去方法（DevTools）を追記

**Verification**
- `npm run dev` で起動し、以下を手動確認  
  - 月移動・日付選択・当日の詳細表示  
  - メモ/課題の保存→リロード後も残る  
  - 録音→保存→一覧に出る→再生できる  
  - 音声ファイルをアップロード→再生できる  
  - 削除が反映され、カレンダーの「記録あり」マーカーも追随する

**Decisions**
- shadcn/ui は未導入なので、今回のMVPは既存の簡易UI部品（Button/Card等）で「それっぽい見た目」を作り、学習の主題（Hooks/MediaRecorder/Dexie）を優先します（後から shadcn/ui に差し替え可能な構造にします）。
