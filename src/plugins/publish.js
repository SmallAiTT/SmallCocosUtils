/**
 * Created by small on 13-11-14.
 */

var path = require("path");
var core4cc = require("./../core4cc.js");
var exec = require('child_process').exec;
var fs = require("fs");
var cfgDir = "cfg";
var projName, projDir, ccDir, modulesDir, tempDir, resCfg, publishJs;
var cocosInfo = {};
var jsCache = {};
var jsIgnoreMap = {
};
var mergeCache4Dependencies = {};
var cfg4Publish = require("../../cfg/cfg").publish;

/**
 * Desc: 合并依赖。
 * @param modulesDir
 * @param dependencies
 * @param jsToMergeArr
 */
function mergeDependencies(modulesDir, dependencies, jsToMergeArr){
    for(var i = 0, li = dependencies.length; i < li; i++){
        var dependency = dependencies[i];
        var moduleName = dependency.name;
        var pInfo = require(path.join(modulesDir, moduleName, "cocos.json"));
        mergeDependencies(modulesDir, core4cc.getDependencies(pInfo.dependencies), jsToMergeArr);
        if(mergeCache4Dependencies[moduleName]) continue;
        mergeCache4Dependencies[moduleName] = true;
        jsToMergeArr.push(path.join(modulesDir, moduleName, cfgDir, "jsRes.js"));
        jsToMergeArr.push(path.join(modulesDir, moduleName, cfgDir, "resCfg.js"));
    }
}

/**
 * Desc: 创建temp文件夹以及temp内容。
 */
function createTemp(){
    if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);//创建temp目录

    var ccContent = fs.readFileSync(path.join(ccDir, "core/src/cc.js")).toString();
    fs.writeFileSync(path.join(tempDir, "cc.js"), ccContent.replace(/\/\/@defineStart[\w\W\s\S\d\D]*\/\/@defineEnd/, ""));

    var jsToMergeArr = [];
    jsToMergeArr.push(path.join(projDir, cfgDir, "res.js"));
    jsToMergeArr.push(path.join(ccDir, "core", cfgDir, "jsRes.js"));
    jsToMergeArr.push(path.join(ccDir, "core", cfgDir, "resCfg.js"));
    mergeDependencies(modulesDir, core4cc.getDependencies(cocosInfo.dependencies), jsToMergeArr);

    jsToMergeArr.push(path.join(projDir, cfgDir, "jsRes.js"));
    jsToMergeArr.push(path.join(projDir, cfgDir, "resCfg.js"));
    core4cc.merge2Module(jsToMergeArr, path.join(tempDir, "resCfg.js"), [], "resCfg");
};

/**
 * Desc: 获取索要加载依赖的资源。
 * @param resCfg
 * @param cfgName
 * @param result
 * @returns {Array|*}
 */
function getLoadRes(resCfg, cfgName, result){
    result = result || [];
    var cfg = resCfg[cfgName];
    if(cfg){
        if(cfg.ref){
            for(var i = 0, li = cfg.ref.length; i < li; i++){
                var itemi = cfg.ref[i];
                getLoadRes(resCfg, itemi, result);
            }
        }
        if(cfg.res){
            for(var i = 0, li = cfg.res.length; i < li; i++){
                var itemi = cfg.res[i];
                result.push(itemi);
            }
        }
    };
    return result;
}
/**
 * Desc: 创建为发布用得resCfg。
 * @param resCfg
 */
function createResCfg4Publish(resCfg){
    var ws = fs.createWriteStream(path.join(tempDir, "resCfg4Publish.js"));
    var jsResTemp = {};
    for(var i = 0, li = resCfg.gameModules.length; i < li; i++){
        var itemi = resCfg.gameModules[i];
        var results = itemi.match(/\[\%[\w_\d]+\%\]/);
        var moduleName = results[0].substring(2, results[0].length - 2);
        var map = jsResTemp[moduleName];
        if(!map) {
            map = jsResTemp[moduleName] = [];
        }
        map.push(core4cc.getKeyName(path.basename(itemi)));
    }
    var jsResCount = 0;
    for (var key in jsResTemp) {
        if(!key) continue;
        var arr = jsResTemp[key];
        if(!arr) continue;
        ws.write("var js_" + key + "={");
        for(var i = 0, li = arr.length; i < li; i++){
            ws.write(arr[i] + ":'_" + jsResCount + "'");
            if(i < li - 1) ws.write(",");
            jsResCount++;
        }
        ws.write("};\r\n");
    }
    ws.write("cc.res4GameModules = {};\r\n");
    for(var i = 0, li = resCfg.gameModules.length; i < li; i++){
        var itemi = resCfg.gameModules[i];
        var result = getLoadRes(resCfg, itemi);
        var results = itemi.match(/\[\%[\w_\d]+\%\]/);
        var moduleName = results[0].substring(2, results[0].length - 2);
        ws.write("cc.res4GameModules[js_" + moduleName + "." + core4cc.getKeyName(path.basename(itemi)) + "]=[\r\n");
        for(var j = 0, lj = result.length; j < lj; j++){
            var itemj = result[j];
            ws.write("res." + core4cc.getKeyName(path.basename((itemj))));
            if(j < lj - 1) ws.write(",")
            ws.write("\r\n")
        }
        ws.write("]\r\n");
    }
    ws.end();
};

/**
 * Desc: 加载资源配置。
 * @param cfgName
 * @param jsArr
 */
function loadResCfg(cfgName, jsArr){
    if(jsCache[cfgName]) return;
    var cfg = resCfg[cfgName];
    if(cfg && cfg.ref){
        for(var i = 0, li = cfg.ref.length; i < li; i++){
            var itemi = cfg.ref[i];
            loadResCfg(itemi, jsArr);
        }
    }
    if(typeof  cfgName == "string" && cfgName.length > 3 && cfgName.indexOf(".js") == cfgName.length - 3){
        if(jsArr.indexOf(cfgName) < 0) jsArr.push(cfgName);
    }
    jsCache[cfgName] = true;
}

/**
 * Desc: 加载模块的基础部分。
 * @param dependencies
 * @param jsArr
 */
function loadModuleBase(dependencies, jsArr){
    for(var i = 0, li = dependencies.length; i < li; i++){
        var itemi = dependencies[i];
        var moduleName = itemi.name;
        var pInfo = require(path.join(modulesDir, moduleName, "cocos.json"));
        loadModuleBase(core4cc.getDependencies(pInfo.dependencies), jsArr);
        loadResCfg(moduleName, jsArr);
    }
}

/**
 * Desc: 加载游戏功能模块。
 * @param gameModules
 * @param jsArr
 */
function loadGameModules(gameModules, jsArr){
    for(var i = 0, li = gameModules.length; i < li; i++){
        var itemi = gameModules[i];
        loadResCfg(itemi, jsArr);
    }
};

/**
 * Desc: 获取要压缩的js列表。
 * @returns {Array}
 */
function getJsArr(){
    var jsArr = [];
    jsArr.push(path.join(tempDir, "cc.js"));
    jsArr.push('[%' + projName + '%]/cfg/res.js');
    jsArr.push(path.join(tempDir, "resCfg4Publish.js"));
    loadResCfg("core", jsArr);//core 模块
    loadModuleBase(core4cc.getDependencies(cocosInfo.dependencies), jsArr);//当前项目依赖模块
    loadResCfg(projName, jsArr);//项目基本
    loadGameModules(resCfg.gameModules, jsArr);//游戏功能模块
    jsArr.push('[%' + projName + '%]/projects/proj.html5/main.js');
    return jsArr;
};

/**
 * Desc: 进行js压缩。
 * @param jsArr
 */
function miniJs(jsArr){
    var execCode = "uglifyjs ";
    for(var i = 0, li = jsArr.length; i < li; i++){
        var itemi = jsArr[i];
        if(jsIgnoreMap[itemi]) {
            continue;
        }
        var results = itemi.match(/\[\%[\w_\d]+\%\]/);
        if(results && results.length > 0){
            var moduleName = results[0].substring(2, results[0].length - 2);
            var dir = moduleName == "core" ? ccDir : modulesDir;
            dir = path.join(dir, moduleName);
            if(moduleName == projName) dir = projDir;
            dir = path.normalize(dir + "/");
            var jsPath = itemi.replace(/\[\%[\w_\d]+\%\]/, dir);
//            console.log(path.normalize(jsPath));
            execCode += path.normalize(jsPath) + " "
        }else{
//            console.log(path.normalize(itemi));
            execCode += path.normalize(itemi) + " ";
        }
    }
    execCode += " -o " + publishJs + " " + (cfg4Publish.miniCfg || "-nm -c -d __PUBLISH=true -b");
//    console.log(execCode);
    exec(execCode, function(err, data, info){
        if(err) console.error(info);
        else console.log(info);
        if(cfg4Publish.delTemp) fs.rmdirSync(tempDir);
    });
}

module.exports = function(dir, opts){
    if(arguments.length == 1){
        opts = dir;
        dir = "";
    }
    //初始化基础目录路径
    projDir = path.join(process.cwd(), dir);//工程目录
    cocosInfo = require(path.join(projDir, "cocos.json"));//读取cocos配置信息
    console.log(cocosInfo.ccDir);
    ccDir = path.join(projDir, cocosInfo.ccDir);
    modulesDir = path.join(ccDir, "modules");
    tempDir = path.join(projDir, "temp4Publish");

    projName = cocosInfo.name;
    publishJs = path.join(projDir, cfg4Publish.output);//发布的js路径

    createTemp();//创建temp文件夹
    resCfg = require(path.join(tempDir, "resCfg.js"));//获取整合后的资源配置
    createResCfg4Publish(resCfg);//创建为发布用得resCfg

    var jsArr = getJsArr();//获取js列表

    miniJs(jsArr);//开始混淆压缩
};