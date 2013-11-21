module.exports = {
    host : "192.168.16.80",
    port : "",
    downloads : "download4cocos",//下载文件的路径

    genRes : {
        output : "cfg/res.js",
        fileTypes : [
            "png", "jpg", "bmp", "jpeg", "gif", "mp3", "ogg", "wav", "mp4", "plist",
            "xml", "fnt", "tmx", "tsx", "ccbi", "font", "txt", "vsh", "fsh", "json"
        ],
        dirCfgs : ["res->res"]
    },

    genJsRes : {
        output : "cfg/jsRes.js",
        fileTypes : ["js"],
        dirCfgs : ["src", "test"]
    },

    publish : {
        output : "projects/proj.html5/mini.js",
        miniCfg : "-nm -c -d __PUBLISH=true -b",
        delTemp : false
    }
};