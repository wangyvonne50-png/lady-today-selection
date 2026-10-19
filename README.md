# Lady Today 潮流穿搭选品工作台

独立 GitHub Pages 简版，支持任意潮流穿搭品类。

- 九阶段选品 SOP、通用空白示例（原始提案未公开）
- 项目编辑、证据记录、商品方案、评分与定价
- 版本快照、JSON 导入导出、Markdown/CSV/PPTX 导出与 PDF 打印
- 公开参考检索、收藏和转为项目

项目保存在浏览器 localStorage，附件保存在 IndexedDB。个人新数据不会写入公开仓库。更换设备不自动同步，请定期导出 JSON 备份；附件另存原件。

尚未接入：自动联网研究、每日更新、OCR、生图和云端同步。公开参考不是实时爆款榜。

## 开发

Node 22+；`npm install`，`npm run build`。将 main 分支 `/docs` 作为 GitHub Pages 发布目录。
