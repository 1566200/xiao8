/* ============================================================
   肖四数据（预留）
   ------------------------------------------------------------
   肖四（四套卷）发布后，把整理好的数据填进下面的 papers 数组即可，
   页面会自动出现在「首页 / 肖四专区 / 刷题 / 分类 / 大题」里，无需改代码。

   字段说明（选择题）：
     no        题号：单选 1-16，多选 17-33
     stem      题干
     options   { A:"…", B:"…", C:"…", D:"…" }
     answer    单选 "A"；多选 "ABD"（升序）
     analysis  解析原文
     module    马原 / 毛中特 / 史纲 / 思修法治 / 时政当代
     topic     考点名称（8-20 字）

   字段说明（分析题）：
     no        题号 34-38
     material  材料原文
     question  设问
     answer    参考答案
     module / topic 同上

   示例：
   window.SHIBA_X4 = {
     papers: [
       {
         id: "x4-1", book: "x4", no: 1, title: "肖四 第一套",
         single: [ { no:1, stem:"…", options:{A:"…",B:"…",C:"…",D:"…"},
                     answer:"A", analysis:"…", module:"马原", topic:"…" } ],
         multi:  [ … ],
         essay:  [ { no:34, material:"…", question:"…", answer:"…",
                     module:"马原", topic:"…" } ]
       }
     ]
   };
   ============================================================ */

window.SHIBA_X4 = window.SHIBA_X4 || { papers: [] };