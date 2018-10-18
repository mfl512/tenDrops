
cc.Class({
    extends: cc.Component,

    properties: {

    },


    start() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },


});
