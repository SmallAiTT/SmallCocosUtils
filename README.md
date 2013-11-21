cocos
=====

A tool to help developers coding cocos2d-html5 easily.


## 安装
* 安装`nodejs`
* clone `cocos`到本地，`cd`到`cocos`根目录，执行`npm link .`

## 创建cocos2d-html5项目
`cd`到工程所要存放的目录下，例如想建工程名为`HelloWorld`的项目，执行以下命令：
```bash
cd the/dir/you/want/to/put/your/project/
cocos init HelloWorld
```
执行完命令之后，将会在当前文件夹生产一个名为HelloWorld和cocos的文件夹。一个是工程文件夹，一个是引擎文件夹。

## 添加图片等资源文件
将图片资源放在`res`目录下，然后`cd`到`HelloWorld`目录下，执行
```bash
cocos genRes
```
如果没有cd到相应的工程目录下，请在命令后面加上`工程相对于当前目录的路径`，例如，如果在HelloWorld的父目录下，则执行
```bash
cocos genRes HelloWorld
```
此时，在`src/cfg/res.js`中，将会生成资源路径的配置文件。注意：文件名要唯一。

## 安装cocos模块
在工程根目录的cocos.json中的dependencies中加入工程所依赖的模块名称以及版本（目前只为了做demo，故没有进行版本的判断），如：`"m1" : "*"`。
命令执行规则同genRes，执行：
```bash
cocos install
```
此时，会发现cocos/modules目录中多了一个m1的文件夹。依赖模块安装完成。

## 添加js代码
在`src`中添加工程代码，`test`文件夹中添加工程测试代码。然后同上，执行
```bash
cocos genJsRes
```
此时，在`src/cfg/jsRes.js`中，将会生成js的路径配置文件。生成的对象的命名规则为`js_`+`项目名`。注意：文件名要唯一。

## 进行`resCfg`配置
此步骤在 https://github.com/SmallAiTT/ModuleDemo 中有详细介绍，就不重复写了。

## 修改`main.js`，运行工程。
同上。

## 发布
执行以下命令进行工程发布，规则通genRes:
```bash
cocos publish
```


## 注：目前自动创建工程时所需要用到的cocos的core模块以及其他依赖模块（有两个依赖模块：m1, m2，其中m2依赖于m1）都是从我本地的服务器下载的。脚本的相应配置文件都在`cocos的nodejs模块`的`cfg/cfg.js`中。
