var fs = require("fs");
var path = require("path");
var core4cc = require("../core4cc.js");
var cfg = require("../../cfg/cfg.js");

var downloadsDirUrl = path.join(cfg.host, cfg.port, cfg.downloads);


/**
 * Desc: 安装cocos模块。
 * @param projDir
 * @param opts
 */
function install(projDir, opts){
    if(arguments.length == 1){
        opts = projDir;
        projDir = "";
    }
    projDir = path.join(process.cwd(), projDir);
    var cocosJsonPath = path.join(projDir, "cocos.json");
    var cocosCfg = require(cocosJsonPath);
    _checkDependencies(path.join(projDir, cocosCfg.ccDir, "modules"), core4cc.getDependencies(cocosCfg.dependencies), 0, function(err){
        if(err) return console.error(err);
        console.log("update success!");
    });
}

function _checkDependencies(modulesDir, dependencies, index, cb){
    if(index >= dependencies.length){
        return cb(null);
    }
    var dependency = dependencies[index];
    var moduleDir = path.join(modulesDir, dependency.name);
    if(fs.existsSync(moduleDir)) return _checkDependencies(modulesDir, dependencies, index+1, cb);
    fs.mkdirSync(moduleDir);
    core4cc.download(moduleDir, path.join(downloadsDirUrl, dependency.name + ".zip"), function(err){
        if(err) return cb(err);
        var moduleZip = path.join(moduleDir, dependency.name + ".zip");
        core4cc.unzip(moduleZip, moduleDir, function(err){
            if(err) return cb(err);
            fs.unlinkSync(moduleZip);
            var cocosCfg = require(path.join(moduleDir, "cocos.json"));
            _checkDependencies(modulesDir, core4cc.getDependencies(cocosCfg.dependencies), 0, function(){
                _checkDependencies(modulesDir, dependencies, index+1, cb);
            });
        });
    });
}

module.exports = install;