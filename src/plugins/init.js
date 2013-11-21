var fs = require("fs");
var path = require("path");
var url = require("url");
var core4cc = require("../core4cc.js");
var cfg = require("../../cfg/cfg.js");

var URL_CORE_ZIP = path.join(cfg.host, cfg.port, cfg.downloads, "core.zip");

/**
 * Desc: 通用格式化方法
 * @param filePath
 * @param info
 */
function pubFrmt(filePath, info){
    var content = fs.readFileSync(filePath).toString();
    content = content.replace(/\[\%name\%\]/g, info.name);
    content = content.replace(/\[\%ccDir\%\]/g, info.ccDir);
    fs.writeFileSync(filePath, content);
}

/**
 * Desc: 文件格式化工具。
 * @type {{}}
 */
var fileFrmt = {};
fileFrmt["index.html"] = pubFrmt;
fileFrmt["release.html"] = pubFrmt;
fileFrmt["resCfg.js"] = pubFrmt;
fileFrmt["index.html"] = pubFrmt;
fileFrmt["package.json"] = pubFrmt;
fileFrmt["main.js"] = pubFrmt;

/**
 * Desc: 赋值文件到指定文件夹
 * @param srcDir
 * @param targetDir
 * @param opts
 * @private
 */
function _copyFiles(srcDir, targetDir, opts){
    var files = fs.readdirSync(srcDir);
    for(var i = 0, li = files.length; i < li; i++){
        var file = files[i];
        if(fs.statSync(path.join(srcDir, file)).isDirectory()){//如果是目录则创建目录
            var dir = path.join(targetDir, file + "/");
            fs.mkdirSync(dir);
            _copyFiles(path.join(srcDir, file + "/"), dir, opts);//继续递归
        }else{
            var filePath = path.join(targetDir, file);
            fs.writeFileSync(filePath, fs.readFileSync(path.join(srcDir, file)));//如果是文件则复制过去
            if(fileFrmt[file]) {
                fileFrmt[file](filePath, opts);
            }
        }
    }
}

/**
 * Desc: 初始化工程。
 * @param projName
 * @param opts
 * @returns {*}
 */
function init(projName, opts){
    var tempDir = path.join(__dirname, "../../templates/", opts.tempName + "/");
    //判断模板是否存在
    if(!fs.existsSync(tempDir)) return console.error(tempDir + " not exists!");

    var projDir = path.join("./", opts.dir || projName);
    //目录已经存在就不允许再次创建
    if(fs.existsSync(projDir)) return console.error(projDir + " exists! Can not create again!");
    fs.mkdirSync(projDir);//创建项目目录

    opts.name = projName;

    opts.ccDir = "node_modules/cocos2d-html5/";
    _copyFiles(tempDir, projDir, opts);

//    _checkCC(path.join(projDir, opts.ccDir), function(err){
//        if(err) console.error(err);
//    })
};

/**
 * Desc: 坚持cocos的基本是否存在。
 * @param ccDir
 * @param cb
 * @private
 */
function _checkCC(ccDir, cb){
    if(!fs.existsSync(ccDir)){//TODO  如果不存在则创建
        fs.mkdirSync(ccDir)
    }
    var modulesDir = path.join(ccDir, "modules");
    if(!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir);
    var coreDir = path.join(ccDir, "core");
    if(!fs.existsSync(coreDir)){
        fs.mkdirSync(coreDir)
        core4cc.download(coreDir, URL_CORE_ZIP, function(err){
            if(err) return cb(err);
            var fileName = url.parse(URL_CORE_ZIP).pathname.split('/').pop();
            core4cc.unzip(path.join(coreDir, fileName), coreDir, function(){
                if(err) return cb(err);
                fs.unlinkSync(path.join(coreDir, fileName));
                cb(null);
            });
        })
    }
};


module.exports = init;