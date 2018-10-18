
cc.Class({
    extends: cc.Component,

    properties: {
        loadNode: cc.Node,
        startBtn: cc.Node,
    },


    start() {

    },

    onLoad:function(){
        this.loadNode.active = false;
        this.startBtn.activ = true;
    },

    clickStart:function(){
        this.loadNode.active = true;
        this.startBtn.active = false;
    },

    // update (dt) {},
});
