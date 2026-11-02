window.__ModuleLoader__.load({
	id: "@yogurtss/dsh-branding",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region lib/shared.js
		const ENTRY_ID = "yogurtss-branding";
		const LOGO_PATTERN = /^(?:|data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2})$/;
		const NAME_PATTERN = /^[^\u0000-\u001f\u007f]*$/;
		const EMPTY_BRANDING = {
			displayName: "",
			logo: ""
		};
		/** Validate untrusted settings before using them in the sidebar. */
		function readBranding(value) {
			if (!value || typeof value !== "object") return EMPTY_BRANDING;
			const { displayName, logo } = value;
			return {
				displayName: typeof displayName === "string" && displayName.length <= 40 && NAME_PATTERN.test(displayName) ? displayName.trim() : "",
				logo: typeof logo === "string" && logo.length <= 1e5 && LOGO_PATTERN.test(logo) ? logo : ""
			};
		}
		//#endregion
		//#region lib/client/image.js
		/** Decode a local raster image and store only a small, inert PNG thumbnail. */
		async function prepareLogo(file) {
			if (file.size > 2097152) throw new Error("tooLarge");
			if (![
				"image/png",
				"image/jpeg",
				"image/webp"
			].includes(file.type)) throw new Error("uploadFailed");
			const url = URL.createObjectURL(file);
			try {
				const image = new Image();
				image.src = url;
				await image.decode();
				if (!image.naturalWidth || !image.naturalHeight) throw new Error("uploadFailed");
				if (Math.max(image.naturalWidth, image.naturalHeight) > 4096) throw new Error("dimensions");
				const scale = Math.min(1, 128 / Math.max(image.naturalWidth, image.naturalHeight));
				const canvas = document.createElement("canvas");
				canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
				canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
				const context = canvas.getContext("2d");
				if (!context) throw new Error("uploadFailed");
				context.drawImage(image, 0, 0, canvas.width, canvas.height);
				const data = canvas.toDataURL("image/png");
				if (data.length > 1e5 || !LOGO_PATTERN.test(data)) throw new Error("uploadFailed");
				return data;
			} finally {
				URL.revokeObjectURL(url);
			}
		}
		//#endregion
		//#region lib/client/Settings.js
		function Settings({ form, t }) {
			const snapshot = (0, react.useSyncExternalStore)((listener) => form.subscribe(listener), () => form.getSnapshot());
			const [draft, setDraft] = (0, react.useState)(() => readBranding(snapshot.value));
			const [revision, setRevision] = (0, react.useState)(snapshot.revision);
			const [dirty, setDirty] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(false);
			const alive = (0, react.useRef)(true);
			const fileInput = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				alive.current = true;
				return () => {
					alive.current = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!dirty) {
					setDraft(readBranding(snapshot.value));
					setRevision(snapshot.revision);
				}
			}, [
				snapshot.value,
				snapshot.revision,
				dirty
			]);
			function edit(value) {
				setDraft((previous) => ({
					...previous,
					...value
				}));
				setDirty(true);
				setMessage(null);
			}
			function reload() {
				setDraft(readBranding(form.getSnapshot().value));
				setRevision(form.getSnapshot().revision);
				setDirty(false);
				setMessage(null);
				setError(false);
			}
			async function upload(file) {
				setBusy(true);
				setMessage(null);
				try {
					const logo = await prepareLogo(file);
					if (alive.current) edit({ logo });
				} catch (cause) {
					if (alive.current) {
						const key = cause instanceof Error && ["tooLarge", "dimensions"].includes(cause.message) ? cause.message : "uploadFailed";
						setMessage(key);
						setError(true);
					}
				} finally {
					if (alive.current) setBusy(false);
				}
			}
			async function save(reset = false) {
				const value = reset ? EMPTY_BRANDING : {
					...draft,
					displayName: draft.displayName.trim()
				};
				if (value.displayName.length > 40 || !NAME_PATTERN.test(value.displayName)) {
					setMessage("invalidName");
					setError(true);
					return;
				}
				setBusy(true);
				setMessage(null);
				try {
					if (!await form.mutate([{
						op: "set",
						path: ["displayName"],
						value: value.displayName
					}, {
						op: "set",
						path: ["logo"],
						value: value.logo
					}], reset ? snapshot.revision : revision)) throw new Error("refused");
					if (alive.current) {
						setDraft(value);
						setDirty(false);
						setError(false);
						setMessage(reset ? "restored" : "saved");
					}
				} catch {
					if (alive.current) {
						setError(true);
						setMessage("failed");
					}
				} finally {
					if (alive.current) setBusy(false);
				}
			}
			if (snapshot.status !== "ready") return (0, react_jsx_runtime.jsx)("p", {
				role: "status",
				children: t(snapshot.status === "loading" ? "loading" : "unavailable")
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: "yogurtss-branding",
				"aria-label": t("title"),
				children: [
					(0, react_jsx_runtime.jsx)("h2", { children: t("title") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "yb-muted",
						children: t("intro")
					}),
					(0, react_jsx_runtime.jsxs)("fieldset", {
						disabled: busy || !snapshot.writable,
						children: [
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: "yb-name",
								children: t("name")
							}),
							(0, react_jsx_runtime.jsx)("input", {
								id: "yb-name",
								type: "text",
								maxLength: 40,
								value: draft.displayName,
								placeholder: t("placeholder"),
								onChange: (event) => edit({ displayName: event.target.value }),
								"aria-describedby": "yb-name-hint"
							}),
							(0, react_jsx_runtime.jsx)("p", {
								id: "yb-name-hint",
								className: "yb-muted",
								children: t("nameHint")
							}),
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: "yb-file",
								children: t("logo")
							}),
							(0, react_jsx_runtime.jsx)("input", {
								ref: fileInput,
								id: "yb-file",
								type: "file",
								accept: "image/png,image/jpeg,image/webp",
								"aria-describedby": "yb-upload-hint",
								onChange: (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (file) upload(file);
								}
							}),
							(0, react_jsx_runtime.jsx)("p", {
								id: "yb-upload-hint",
								className: "yb-muted",
								children: t("uploadHint")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => edit({ logo: "" }),
								disabled: !draft.logo,
								children: t("remove")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "yb-preview",
								"aria-label": t("preview"),
								children: [draft.logo ? (0, react_jsx_runtime.jsx)("img", {
									src: draft.logo,
									alt: t("logo")
								}) : (0, react_jsx_runtime.jsx)("span", {
									className: "yb-default",
									children: t("defaultLogo")
								}), (0, react_jsx_runtime.jsx)("strong", {
									title: draft.displayName,
									children: draft.displayName || t("defaultName")
								})]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "yb-actions",
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "yb-primary",
									disabled: !dirty,
									onClick: () => {
										save();
									},
									children: busy ? t("saving") : t("save")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										save(true);
									},
									children: t("reset")
								})]
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: "yb-muted",
								children: t("resetHint")
							})
						]
					}),
					!snapshot.writable && (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("readOnly")
					}),
					message && (0, react_jsx_runtime.jsx)("p", {
						role: error ? "alert" : "status",
						children: t(message)
					}),
					error && message === "failed" && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: reload,
						children: t("reload")
					})
				]
			});
		}
		const styles = `
.yogurtss-branding{max-width:640px;color:var(--dsw-alias-label-primary);font:inherit}
.yogurtss-branding h2{font-size:20px;margin:0 0 12px}.yogurtss-branding p{line-height:1.6}
.yogurtss-branding .yb-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:8px 0 22px}
.yogurtss-branding fieldset{border:0;padding:0;margin:0;min-width:0}.yogurtss-branding label{display:block;font-weight:600;margin:20px 0 10px}
.yogurtss-branding input[type=text]{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l1,#8886);border-radius:9px;padding:10px 12px;background:var(--dsw-alias-bg-layer-1,transparent);color:inherit;font:inherit}
.yogurtss-branding input[type=file]{max-width:100%;font:inherit}.yogurtss-branding button{font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1,transparent);border:1px solid var(--dsw-alias-border-l1,#8886);border-radius:9px;padding:9px 14px;cursor:pointer}
.yogurtss-branding .yb-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);color:white;border-color:transparent}
.yogurtss-branding button:disabled{opacity:.5;cursor:default}.yogurtss-branding :focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:3px}
.yogurtss-branding .yb-preview{display:flex;gap:14px;align-items:center;margin:24px 0;padding:22px;border:1px solid var(--dsw-alias-border-l1,#8886);border-radius:12px;overflow:hidden}
.yb-preview img{width:40px;height:40px;object-fit:contain;flex:none}.yb-preview strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.yb-default{font-size:11px;border:1px dashed currentColor;border-radius:7px;padding:8px;flex:none}
.yogurtss-branding .yb-actions{display:flex;flex-wrap:wrap;gap:10px}.yogurtss-branding [role=alert]{color:var(--dsw-alias-state-error-primary,#c33)}
`;
		//#endregion
		//#region lib/client/favicon.js
		/** Override document favicons while configured, preserving the host's original nodes and media rules. */
		function bindFavicon(form, doc) {
			let custom;
			let originals = [];
			const restore = () => {
				custom?.remove();
				custom = void 0;
				for (const { node, marker } of originals) marker.replaceWith(node);
				originals = [];
			};
			const sync = () => {
				const snapshot = form.getSnapshot();
				const { logo } = readBranding(snapshot.status === "ready" ? snapshot.value : void 0);
				if (!logo) {
					restore();
					return;
				}
				if (!custom) {
					originals = [...doc.head.querySelectorAll("link[rel~=\"icon\"]")].map((node) => {
						const marker = doc.createComment("yogurtss-branding: original favicon");
						node.replaceWith(marker);
						return {
							node,
							marker
						};
					});
					custom = doc.createElement("link");
					custom.rel = "icon";
					custom.type = "image/png";
					custom.dataset.plugin = "@yogurtss/dsh-branding";
					custom.href = logo;
					doc.head.appendChild(custom);
				} else if (custom.getAttribute("href") !== logo) custom.href = logo;
			};
			const unsubscribe = form.subscribe(sync);
			sync();
			return () => {
				unsubscribe();
				restore();
			};
		}
		//#endregion
		//#region lib/client/locales.js
		const zh = {
			title: "品牌设置",
			intro: "自定义左上角名称，以及侧栏、新会话欢迎页和浏览器标签栏的 Logo。保存后立即生效，并在刷新或重启后保留。",
			name: "显示名称",
			placeholder: "留空使用原来的 DSH 名称",
			nameHint: "最多 40 个字符。",
			logo: "品牌 Logo",
			upload: "上传 Logo",
			remove: "使用默认 Logo",
			uploadHint: "支持 PNG、JPEG、WebP，最大 2 MB。自动缩小并保留透明背景。",
			preview: "效果预览",
			defaultName: "默认 DSH 名称",
			defaultLogo: "默认 Logo",
			save: "保存修改",
			saving: "正在处理…",
			reset: "一键恢复默认",
			resetHint: "同时恢复 DSH 原来的名称、侧栏、新会话及标签栏 Logo。",
			saved: "已保存，侧栏、新会话欢迎页和标签栏图标已更新。",
			restored: "已恢复原来的 DSH 名称和所有品牌 Logo。",
			failed: "保存失败或设置已被其他窗口修改。请重新载入后再试。",
			reload: "重新载入设置",
			readOnly: "当前配置不可写。",
			loading: "正在读取设置…",
			unavailable: "品牌设置暂不可用，请检查插件是否启用。",
			uploadFailed: "无法读取图片，请选择有效的 PNG、JPEG 或 WebP 图片。",
			tooLarge: "图片超过 2 MB，请选择较小的文件。",
			dimensions: "图片尺寸过大，最长边不能超过 4096 像素。",
			invalidName: "名称最多 40 个字符，不能包含换行或控制字符。"
		};
		const en = {
			title: "Branding",
			intro: "Customize the sidebar name and the logo in the sidebar, new-session welcome screen and browser tab. Saved changes apply immediately and survive reloads and restarts.",
			name: "Display name",
			placeholder: "Leave blank for the original DSH name",
			nameHint: "Up to 40 characters.",
			logo: "Brand logo",
			upload: "Upload logo",
			remove: "Use default logo",
			uploadHint: "PNG, JPEG or WebP, up to 2 MB. Automatically resized, preserving transparency.",
			preview: "Preview",
			defaultName: "Default DSH name",
			defaultLogo: "Default logo",
			save: "Save changes",
			saving: "Working…",
			reset: "Restore defaults",
			resetHint: "Restore the original DSH name, sidebar, new-session and browser-tab logos.",
			saved: "Saved. The sidebar, new-session welcome screen and browser-tab icon have been updated.",
			restored: "Original DSH name and all brand logos restored.",
			failed: "Save failed or another window changed these settings. Reload and try again.",
			reload: "Reload settings",
			readOnly: "This configuration is read-only.",
			loading: "Loading settings…",
			unavailable: "Branding settings are unavailable. Check that the plugin is enabled.",
			uploadFailed: "Cannot read this image. Choose a valid PNG, JPEG or WebP image.",
			tooLarge: "Image exceeds 2 MB. Choose a smaller file.",
			dimensions: "Image dimensions exceed 4096 pixels.",
			invalidName: "Use at most 40 characters without line breaks or control characters."
		};
		//#endregion
		//#region lib/client/index.js
		const name = "yogurtss-branding";
		const inject = [
			"slots",
			"configForms",
			"locale"
		];
		const NS = "yogurtss.branding";
		/** Register overrides only while populated; removing them reveals the original occupants. */
		function bindBrandSlots(ctx, form) {
			let offName;
			let offLogo;
			let offHeroLogo;
			let previousName = "";
			let previousLogo = "";
			const sync = () => {
				const snapshot = form.getSnapshot();
				const { displayName, logo } = readBranding(snapshot.status === "ready" ? snapshot.value : void 0);
				if (displayName !== previousName) {
					offName?.();
					offName = void 0;
					previousName = displayName;
					if (displayName) offName = ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register({
						name: "sidebar.brand.name",
						priority: -100
					}, function BrandName() {
						return (0, react_jsx_runtime.jsx)("span", {
							title: displayName,
							style: {
								display: "block",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: displayName
						});
					}));
				}
				if (logo !== previousLogo) {
					offLogo?.();
					offLogo = void 0;
					previousLogo = logo;
					offHeroLogo?.();
					offHeroLogo = void 0;
					if (logo) offLogo = ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({
						name: "sidebar.brand.mark",
						priority: -100
					}, function BrandMark({ size }) {
						return (0, react_jsx_runtime.jsx)("img", {
							src: logo,
							alt: "",
							width: size,
							height: size,
							style: {
								display: "block",
								objectFit: "contain"
							}
						});
					}));
					if (logo) offHeroLogo = ctx.slots.inject("conversation.hero.brand.mark", () => ctx.slots.register({
						name: "conversation.hero.brand.mark",
						priority: -100
					}, function HeroBrandMark({ size, className }) {
						return (0, react_jsx_runtime.jsx)("img", {
							src: logo,
							alt: "",
							className,
							width: size,
							height: size,
							style: {
								display: "block",
								objectFit: "contain"
							}
						});
					}));
				}
			};
			const unsubscribe = form.subscribe(sync);
			sync();
			return () => {
				unsubscribe();
				offName?.();
				offLogo?.();
				offHeroLogo?.();
			};
		}
		/** Attach the native settings page and reversible sidebar overrides. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}));
			const form = ctx.configForms.get(ENTRY_ID);
			ctx.effect(() => bindBrandSlots(ctx, form));
			ctx.effect(() => bindFavicon(form, document));
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = "@yogurtss/dsh-branding";
				style.textContent = styles;
				document.head.appendChild(style);
				return () => style.remove();
			});
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: ENTRY_ID,
				order: 25,
				label: () => t("title"),
				locale: NS,
				inject: () => ({ form })
			}, Settings));
		}
		//#endregion
		exports.apply = apply;
		exports.bindBrandSlots = bindBrandSlots;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map