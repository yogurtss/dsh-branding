# 验证记录

日期：2026-11-02。操作系统：Windows；Node 24.19.0；pnpm 11.25.0。

## 契约依据

- 官方 tag `dsh-v0.2.1-rc.2`，commit `687f282e8625c6b8d11ff58211a90524be2e4317`。
- npm `@deepseek-ai/dsh-client-ui-sidebar`、`dsh-client-ui-settings`、`dsh-client-ui-renderer`、`dsh-client-locale`、`dsh-settings` 均为 `0.2.1-rc.2`。
- Cordis `4.0.5`、Schemastery `3.18.5`、React `18.3.1`；完整开发图固定于 `pnpm-lock.yaml`，`pnpm peers check` 无缺失依赖。
- 官方 `ui-sidebar/src/client/contract/slots.ts` 声明 `sidebar.brand.mark` / `sidebar.brand.name`；`ui-settings/src/client/contract/slots.ts` 声明 `settings.section`。
- 官方 `ui-slots` 的低 priority 覆盖机制允许保留原始 occupant；本插件仅在有自定义值时以 `-100` 注册，空值、不可用及 dispose 时撤销。
- 官方 `ConfigForm.mutate(ops, expectedRevision)` 支持原子变更与 revision fence；品牌字段使用原生 volatile Config，在 profile patch 中持久化。

## 自动化检查

- TypeScript host/client 检查与 client purity 构建通过。
- 发布用 client wrapper 的 package id、导出和 inject 校验。
- Host 验证名称长度、控制字符、Logo 类型及长度。
- 使用真实 SlotCore 验证覆盖、重复更新、恢复默认、配置不可用及卸载清理。
- React/jsdom 验证原子还原、保存被拒后不误报成功和订阅清理。
- 上传类型/大小拒绝和解码失败后的 object URL 清理。

## 真实宿主验收

通过官方 CLI 在隔离 DSH_HOME 创建 Web profile，安装本插件 tarball，启动 DSH 0.2.1-rc.2。

1. 「更多 → 设置」出现「品牌设置」，未定制时仍显示官方原始品牌。
2. 填写 `Yogurt 工作台`，上传本地 PNG 测试图片，预览正常。
3. 保存后侧栏名称和 Logo 立即替换；收起侧栏时 Logo 正常。
4. 刷新页面后自定义名称及 Logo 保留，检查 profile patch 确实包含保存值。
5. 点击「一键恢复默认」，两个字段清空，页面显示还原成功，侧栏恢复官方原始图标和名称。
6. 浏览器 error 日志为空。截图见本目录。

原生桌面、macOS/Linux、其他 Harness 版本及双浏览器实时同步未做端到端验收。没有调用模型或使用模型凭据。

## 命名

`yogurtss/branding` 的本地 naming manifest 通过 strict 验证。

2026-11-02 查询社区注册表：
`https://raw.githubusercontent.com/oh-my-dsh/dsh-plugin-registry/main/registry/index.json`

索引 SHA-256：`0a9ba9bd9b4e0d2ab8136e750103b55ee23487e3e954c643aea1b210c4045a34`。
目标 Harness `0.2.1-rc.2`，没有已审核匹配；这不是全局唯一性保证或名称预留。
