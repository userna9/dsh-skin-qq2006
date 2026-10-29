# dsh-skin-qq2006

把 **DSH（DeepSeek Harness）Web 界面**变成 2006 / 2007 年那版老 QQ 的皮肤插件。

蓝色渐变标题栏、企鹅头像、联系人列表、斜面按钮、宋体 12px、Windows 经典滚动条——装完刷新页面即生效，卸载后界面完全还原。

![总览](docs/preview.png)

| 侧栏 | 消息 | 输入框 |
| --- | --- | --- |
| ![](docs/preview-sidebar.png) | ![](docs/preview-message.png) | ![](docs/preview-composer.png) |

---

## 特性

- **整窗标题栏**：一条贯穿窗口的蓝色玻璃渐变栏，左边手绘企鹅 + `QQ 2006` + **当前会话名**（`QQ 2006 – 检查皮肤样式中文消息`，跟随切换会话实时更新），右边三颗经典窗口按钮（装饰用）。侧栏与会话区一起被压到它下面，不再是「两截标题」。
- **底部状态栏**：22px 的服务图标条 + 绿色「安全」盾牌 + **实时时钟**，和标题栏一起把窗口框起来。
- **主面板用户条**：企鹅头像方块 + `DSH 用户` + 绿色「在线」小标签，右上角是收起侧栏按钮。
- **企鹅头像**：手绘 SVG，按老 QQ 那只的样子画——黑身体、单张白脸罩、双眼之间一道黑色 V 形额、橙色喙、红围巾（左侧垂一条）、橙脚；18/20/28/30px 都单独调过，缩到侧栏那一格也认得出。
- **联系人列表**：`▣ 工作区` 分组条、企鹅头像方块、选中行浅蓝描边、行尾时间戳与置顶标记。
- **聊天窗口**：标题写成 `与 … 聊天中`，下面一排凸起的斜面标签（对话 / 轨迹 / 上下文 / 编队）当工具栏。
- **消息面板**：整块带 1px 描边的浅蓝纸面 + 淡企鹅水印，消息浮在上面；右侧气泡 + 小尾巴 + 自己的头像。
- **输入区**：占满窗宽，顶部「字体 表情 图片 截图 震屏」工具条，米色斜面「发送(S)」，下方是 QQ 式的状态条。
- **细节**：12px 宋体 + Tahoma 字栈、14px 经典滚动条、黄色便签式 tooltip、方角菜单与对话框、分组条与输入区的分隔线。
- **明暗主题都强制为浅色皮肤**，切换系统主题不会出现深色底 + 蓝标题栏的混搭。
- 全部样式作用域在 `html[data-qq2006]`，窗口栏节点也在插件卸载时一并移除，不留残余。

---

## 安装

> 下面命令里的 `--profile web` 是 profile 名，换成你自己在用的那个即可（`~/.dsh/profiles/` 下的目录名）。

### 方式 A：GitHub 链接（推荐，装完即可用）

```bash
dsh plugin --profile web add github:userna9/dsh-skin-qq2006
```

也接受完整仓库地址：

```bash
dsh plugin --profile web add https://github.com/userna9/dsh-skin-qq2006
```

然后重启 `dsh web`（已经打开的话刷新页面也行）。

### 方式 B：本地克隆（改皮肤、二次开发用）

```bash
git clone https://github.com/userna9/dsh-skin-qq2006
cd dsh-skin-qq2006
dsh plugin --profile web add .
```

`add .` 装的是指向克隆目录的 link 依赖，所以改完源码只要：

```bash
npm run build     # 把 src/skin.css 内联进 lib/client.js
```

刷新页面就生效，不需要重新安装。

### 方式 C：用包名安装（需要先发布到 npm）

```bash
npm publish                                   # 在仓库目录执行
dsh plugin --profile web add dsh-skin-qq2006   # 之后任何人按名字安装
```

---

## 卸载

```bash
dsh plugin --profile web remove dsh-skin-qq2006
```

重启（或刷新）后界面完全回到默认外观。

---

## 怎么工作的

DSH 的插件是 Cordis 的「双面包」：

| 文件 | 作用 |
| --- | --- |
| `cordis.patch.yml` | 往 profile 的插件树里插入一行 `ui-qq2006-skin` |
| `lib/index.js` | 宿主半边，空实现——皮肤是纯浏览器的事 |
| `lib/client.js` | 浏览器半边，注册进 `window.__ModuleLoader__`，在 `apply()` 里注入样式和窗口标题栏 |
| `src/skin.css` | 真正的皮肤源码（含 `__PENGUIN__` / `__WATERMARK__` 占位符） |
| `src/penguin.svg` | 手绘企鹅头像，构建时 base64 内联 |
| `src/watermark.svg` | 消息区平铺水印 |
| `scripts/build.mjs` | 把上面几个文件拼成 `lib/client.js`，无第三方依赖 |

`apply(ctx)` 里做了三件事，都用 `ctx.effect` 包着，卸载时自动回收：

1. 给 `<html>` 打上 `data-qq2006` 标记；
2. 插入一个 `<style data-plugin="dsh-skin-qq2006">`；
3. 往 `document.body` 追加窗口标题栏 `.qq-windowbar`——它挂在 React 树外面，不会被重渲染吃掉。

样式本身不碰 React 状态，只做三件事：

- **覆盖主题 token**：`--dsw-alias-bg-*` / `--dsw-alias-label-*` / `--dsw-alias-border-*` 等换成 QQ 配色；
- **给窗口腾地方**：`[class*="_frame"]:has(> [class*="_sidebarCol"])` 加 `padding-top: 30px`，把标题栏的高度让出来（`:has()` 是为了别误伤聊天的 `EvIC1a_frame`）；
- **改结构外观**：宿主用的是 CSS Modules，类名形如 `hHd-Xa_sessionRow`，hash 每次构建都会变。所以选择器一律按语义后缀匹配（`[class*="_sessionRow"]`），通用后缀（`_header`、`_card`、`_row`、`_pane`）必须再加元素或容器限定——`[class*="_pane"]` 会连 `_panelRow` 一起命中，`[class*="_panel"][aria-hidden]` 会把侧栏图标一起隐藏，这两个坑都踩过，注释里留着。

---

## 自定义

想改成 2007 版（更深的海蓝）或换成你自己的头像：

1. 改 `src/skin.css` 顶部的调色板变量（`--qq-bar-hi` / `--qq-bar-lo` / `--qq-line` …）；
2. 换头像就替换 `src/penguin.svg`（任意 1:1 的 SVG 都行）；
3. `npm run build`，刷新页面。

---

## 已知限制

- 验证环境：**dsh 0.2.0-rc.2 + Windows + Chrome**，1440×900 与 1080×700 都验过。
- 窗口标题栏是**装饰性**的：三颗窗口按钮不可点（Web 界面没有真正的窗口句柄），真正的最大化/关闭请用宿主自己的窗口按钮。
- 皮肤强制浅色，所以深色模式下也是蓝白界面（这正是老 QQ 的样子）。
- 只改视觉，不改布局尺寸：侧栏宽度仍由 DSH 自己控制；会话有内容时输入框会拉满窗宽，空会话时保留宿主居中的输入框。
- 右侧面板、设置弹窗、菜单只做了配色与圆角处理，没做 QQ 化的结构重排。
- 如果 DSH 后续版本重命名了语义类名（例如 `_sessionRow` 改了名），对应规则会失效，需要按新类名小改一下；不会影响宿主本身。

## 常见问题

**装完没变化？**
插件在页面加载时注入，必须**重启 `dsh web` 或刷新页面**。确认是否装上了：

```bash
dsh --profile web --dump-config | grep -i qq2006
```

能看到 `ui-qq2006-skin` 就说明插件行已经进配置树了。

**`ERR_PNPM_UNEXPECTED_STORE` 或 pnpm 报 store 版本不一致？**
DSH 创建 profile 时用的是某个 pnpm 大版本，本机 pnpm 版本不一致就会报这个。看一眼 profile 用的版本，再装同款：

```bash
grep packageManager ~/.dsh/profiles/web/node_modules/.modules.yaml
npm i -g pnpm@11.7.0      # 换成上面显示的版本
```

**GitHub 安装会卡在「构建授权」吗？**
不会。本插件不声明 `prepare` / `install` 脚本，`lib/client.js` 是提交进仓库的构建产物，pnpm 不需要执行任何构建，也就不会触发 `ERR_PNPM_IGNORED_BUILDS`。

**只想换个颜色？**
改 `src/skin.css` 顶部 `--qq-bar-*` / `--qq-line` / `--qq-blue` / `--qq-paper` 几个变量，`npm run build`，刷新即可。

**标题栏挡住了菜单怎么办？**
窗口栏是 `position: fixed; z-index: 9000; pointer-events: none`，正常情况下只盖住最上面 30px。如果某个宿子弹层正好落在这一条上，把 `src/skin.css` 里 `--qq-chrome` 调大或把那一条的 `z-index` 调小即可。

## 许可

MIT。企鹅是项目内手绘的 SVG，只是怀旧致敬：**本项目与腾讯公司无关**，「QQ」名称与企鹅形象的相关权利归腾讯所有，请仅作个人学习与怀旧使用。
