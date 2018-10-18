
cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Node,
    },


    start() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    //递进来要移动的方向
    setOptions: function (data) {

    },

    onCollisionEnter: function (other, self) {
        // cc.log('碰撞到了', other.node.name, self.node.name);
        if (other.node.name == 'collisionBox') {
            this.node.stopAllActions();
            let anima = this.sprite.getComponent(cc.Animation);
            anima.play('smallDropBomb');
            anima.on('finished', this.onFinish, this);
            this.node.emit('PLAY_AUDIO', 'bubbleSplat');
        }
    },
    // onCollisionExit:function(){
    //     // cc.log('碰撞结束');
    // },

    onFinish: function () {
        this.node.destroy();
    },

    onDestroy: function () {
        this.node.emit('CHECK_IS_SHOW_OR_HIDE_MASK');
    },
});
