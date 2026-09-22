export type Note = { id:string; title:string; body:string; tags:string[]; author:string; updatedAt:string; isPublic:boolean; likes:number; comments:number };
export const tags=["React","TypeScript","英語","読書","仕事術"];
export const notes:Note[]=[
{id:"react-basics",title:"Reactの基礎まとめ",body:"# Reactの基礎まとめ\n\n## はじめに\nReactは、コンポーネントを組み合わせてUIを作るライブラリです。\n\n## 主な特徴\n\n- 宣言的にUIを記述できる\n- 状態の変化に応じて再描画される\n- 小さな部品を組み合わせられる\n\n> 学んだことは、小さく試して言葉にすると定着しやすい。",tags:["React","TypeScript"],author:"yamada",updatedAt:"2時間前",isPublic:true,likes:24,comments:3},
{id:"reading-habit",title:"読書メモ：人を動かす",body:"# 読書メモ\n\n相手の立場から物事を見ること。批判よりも、理解するための質問を増やす。",tags:["読書"],author:"sakura",updatedAt:"5時間前",isPublic:true,likes:18,comments:1},
{id:"python-analysis",title:"Pythonでデータ分析をはじめる",body:"# Pythonデータ分析\n\nPandasで表形式のデータを読み込み、欠損値を確認するところから始める。",tags:["仕事術"],author:"takumi",updatedAt:"1日前",isPublic:true,likes:32,comments:4},
{id:"weekly-review",title:"仕事のタスク管理術",body:"# 週次レビュー\n\n毎週金曜日に、未完了タスクと次週の優先順位を見直す。",tags:["仕事術"],author:"sakura",updatedAt:"1日前",isPublic:false,likes:0,comments:0}];
