cc.loadGame(function(){

    var c = {
        COCOS2D_DEBUG: 2,
        showFPS : true,
        loadExtension: true,
        frameRate : 60,
        tag : "gameCanvas",
        //test : js.[%name%].Layer_js,//单例测试，注释掉则跳转至游戏界面
        renderMode:1       //Choose of RenderMode: 0(default), 1(Canvas only), 2(WebGL only)
    };
    document['ccConfig'] = c;

    var cocos2dApp = cc.Application.extend({
        config : c,
        ctor : function(){
            this._super();
            cc.COCOS2D_DEBUG = this.config.COCOS2D_DEBUG;
            cc.setup(this.config.tag);    //设置ID相当于
            cc.AppController.shareAppController().didFinishLaunchingWithOptions();
        },

        applicationDidFinishLaunching : function(){
            //初始化导演
            var director = cc.Director.getInstance();

            var searchPaths = [];
            searchPaths.push("../../res/");
            cc.FileUtils.getInstance().setSearchPaths(searchPaths);
            //设置分辨率
            //cc.EGLView.getInstance().setDesignResolutionSize(320, 480, cc.RESOLUTION_POLICY.SHOW_ALL);

            //打开FPS的显示
            director.setDisplayStats(this.config.showFPS);
            //设置FPS，默认为 1.0/60
            director.setAnimationInterval(1.0 / this.config.frameRate);


            if(!__PUBLISH && this.config.test) cc.test(this.config.test);//
            else{
                //TODO enter point for game
                cc.log("++++++++++++++++enter point for game++++++++++++");
                /*
                cc.loadGameModule(js.[%name%].Layer_js, function(resArr){
                    cc.LoaderScene.preload(resArr, function(){
                        var scene = cc.Scene.create();
                        scene.addChild(tt.Layer.create({}));
                        cc.Director.getInstance().replaceScene(scene);
                    });
                });
                */
            }
            return true;
        }

    });

    new cocos2dApp();

});