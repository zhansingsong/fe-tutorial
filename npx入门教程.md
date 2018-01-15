# npx 入门教程

[**npx**](https://github.com/zkat/npx) 是一个让 npm 的命令执行变得更加便捷的工具

> 本文使用 [cowsay](https://github.com/piuccio/cowsay) 包来做演示。

## 全局命令

在开发时，经常需要安装一命令行工具包(CLI)，如 Webpack、Rollup、babel 等。为了方便使用，一般都会进行全局安装。假如这里要使用`cowsay`命令：

**安装**

```js
npm install -g cowsay
```

**使用**

```js
cowsay singsong
```

全局命令虽然使用上方便，但全局安装会导致一些问题。如不同项目可能依赖不同版本的命令行包，全局安装会让命令行包的版本维护成本增加，而且这样还会污染系统命令。所以，大多数开发人员都倾向于本地安装。

## 本地命令

**安装**

```js
npm install cowsay
```

**使用**

```js
./node_modules/.bin/cowsay singsong
```

或基于`package.json`，使用`npm run scripts`运行命令。在`package.json`中添加 script：

```js
{
  "scripts": {
    "cowsay": "cowsay singsong"
  },
}
```

```js
npm run cowsay
```

本地命令使用上不如全局命令方便。那有没有什么方法，让本地命令执行变得更加便捷？这便是 npx 诞生的缘由了。

## npx

> npx is a tool intended to help round out the experience of using packages from the NPM registry — the same way npm makes it super easy to install and manage dependencies hosted on the registry, npx makes it easy to use CLI tools and other executables hosted on the registry.

npm 5.2 版本携带了一个新工具 npx。如果安装的 npm >= 5.2，npx 已同时被安装好了。可以运行如下命令检查 npx 是否存在：

```js
which npx

// 输出
// /Users/username/.nvm/versions/node/v8.0.0/bin/npx
```

**安装**

如果 npm < 5.2，可以通过如下命令安装:

```js
npm install -g npx
```

或升级 npm

```js
npm install npm@latest -g
```

**看看 npx 如何使用**

```js
npx cowsay singsong
```

> Calling npx <command> when <command> isn’t already in your $PATH will automatically install a package with that name from the NPM registry for you, and invoke it. When it’s done, the installed package won’t be anywhere in your globals, so you won’t have to worry about pollution in the long-term.

是不是很简单，在执行`npx <command>`时，npx 会查找本地的`node_modules/.bin`，或变量环境`$PATH`是否存在`<command>`，然后再执行。如果没有查找到`<command>`，会在执行之前，安装对应`<command>`（一次性安装，即再次使用时，会重新安装）。

## 实例

### 1. 运行命令

```js
npx cowsay singsong

// 输出
//  __________
// < singsong >
//  ----------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

### 2. 运行未安装的命令

卸载已安装 cowsay

```js
npm uninstall cowsay
```

一次性调用未安装的命令(即再次使用时，会重新安装)

```js
npx cowsay singsong

// 输出
// npx: 9 安装成功，用时 4.626 秒
//  __________
// < singsong >
//  ----------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

### 3. 运行特定版本命令

```js
// 当前npm版本
npm -v

// 输出
// 5.4.2

// 指定版本
npx npm@4 -v

// 输出
// npx: 299 安装成功，用时 14.991 秒
// 4.6.1
```

### 4. 调用 GitHub 线上库的命令

这里 fork [cowsay](https://github.com/piuccio/cowsay)到自己 github，然后对`cli.js`做如下修改：

```js
#!/usr/bin/env node
var argv = require("optimist")
.usage("Usage: $0 [-e eye_string] [-f cowfile] [-h] [-l] [-n] [-T tongue_string] [-W column] [-bdgpstwy] text\n\n" +
	"If any command-line arguments are left over after all switches have been processed, they become the cow's message.\n\n" +
	"If the program is invoked as cowthink then the cow will think its message instead of saying it.")
.options({
	"e" : {
		default : "👀 " //修改由"oo" ---> "👀 "
	},
	"T" : {
		default : "  "
	},
	"W" : {
		default : 40
	},
	"f" : {
		default : "default"
	}
})...
```

测试修改后命令：

```js
npx github:zhansingsong/cowsay singsong
//或
npx https://github.com/zhansingsong/cowsay.git singsong
//或
npx git://github.com:zhansingsong/cowsay.git singsong


// 输出
// npx: 10 安装成功，用时 8.017 秒
//  __________
// < singsong >
//  ----------
//         \   ^__^
//          \  (👀 )\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

### 5. 运行 GitHub 的 gist 代码

```js
npx https://gist.github.com/zkat/4bc19503fe9e9309e2bfaa2c58074d32

// 输出
// npx: 1 安装成功，用时 5.912 秒
// yay gist
```

### 6. [run-script](https://docs.npmjs.com/misc/scripts)

```js
npx -p cowsay -c 'echo "$npm_package_name@$npm_package_version" | cowsay'

// 输出
// npx: 9 安装成功，用时 5.115 秒
//  ____________________
// < npx-tutorial@1.0.0 >
//  --------------------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

### 7. CLI 的默认回退 npx

上述命令运行，都基于 npx 来执行。有没有方法可以直接使用命令：

```js
cowsay singsong

// 输出
// zsh: command not found: cowsay
```

`command not found: cowsay`提示找不到命令。这里可以将 npx 配置为 CLI 的回退方案。如果输入的命令没有，会回退使用 npx。可以针对不同的命令行工具进行配置：

#### For bash@>=4:

```js
source <(npx --shell-auto-fallback bash)
```

#### For zsh:

```js
source <(npx --shell-auto-fallback zsh)
```

#### For fish:

```js
source (npx --shell-auto-fallback fish | psub)
```

如果输入的命令行没有，会回退使用 npx。

```js
cowsay singsong

// 输出
// 找不到 cowsay，请尝试使用 npx...
// not found: cowsay
```

因为本地没有对应 cowsay。会在本地和全局查找，如果没有不会安装。所以这里可以先安装：

```js
// 安装cowsay
npm install singsong
// 执行
cowsay singsong

// 输出
// cowsay singsong
// 找不到 cowsay，请尝试使用 npx...
//  __________
// < singsong >
//  ----------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

另外，还可以在命令后面添加`@ + version`后缀。这样 npx 会自动安装对应的命令包。

```js
// 卸载cowsay
npm uninstall cowsay
// 每次执行都会重新安装
cowsay@1 singsong

// 输出
// 找不到 cowsay@1，请尝试使用 npx...
// npx: 9 安装成功，用时 5.227 秒
//  __________
// < singsong >
//  ----------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

#### 8. 使用`--node-arg`选项，可以使用 node 参数

```js
npx --node-arg=--inspect cowsay

// 输出
// npx: 9 安装成功，用时 4.912 秒
// Debugger listening on ws://127.0.0.1:9229/ac512eef-bc5c-4132-9a7b-3251fe33f096
// For help see https://nodejs.org/en/docs/inspector
// Usage: ../.nvm/versions/node/v8.0.0/bin/node ../.npm/_npx/69761/bin/cowsay [-e eye_string] [-f cowfile] [-h] [-l] [-n] [-T tongue_string] [-W column] [-bdgpstwy] text
```

#### 9. 使用`--no-install`选项，如果查找不到命令，不会安装对应的命令包

```js
// 确保本地没有cowsay
npm uninstall cowsay

// 输出
// npm WARN npx-tutorial@1.0.0 No repository field.
// up to date in 0.202s

// 使用--no-install
npx --no-install cowsay singsong

// 输出
// not found: cowsay
```

#### 10. 使用`--ignore-existing`选项，忽略查找，直接安装命令包

```js
// 确保已安装cowsay
npm install cowsay

// 使用--ignore-existing
npx --ignore-existing cowsay singsong

// 输出
// npx: 9 安装成功，用时 4.206 秒
//  __________
// < singsong >
//  ----------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||
```

## 总结

npx 的出现，让 npm 命令的运行更加 easy，极大地提高开发效率。使用 npx，完全可以将全局安装的 npm 命令卸载掉。甚至完全可以抛弃 node 的版本维护工具，如[nvm](http://nvm.sh/)，[n](https://npm.im/n)，[nave](https://npm.im/nave)。 另外，使用 npx 提供命令行工具的回退方案，可以将 npx 直接集成到现有的命令行工具中，使用起来更加顺手哦~。~
