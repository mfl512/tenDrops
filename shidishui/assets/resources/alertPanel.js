cc.Class({
    extends: cc.Component,

    properties: {
        newLevelNode: cc.Node,
        gameOverNode: cc.Node,
        levelClearedNum: cc.Node,
        playAgain: cc.Node,
    },

    onLoad: function () {
        this.playAgain.on('mouseenter', this.runPlayAgainAction, this);
        this.playAgain.on('mouseleave', this.stopPlayAgainAction, this);
        this.playAgain.on('touchstart', this.runPlayAgainAction, this);
        this.playAgain.on('touchcancel', this.stopPlayAgainAction, this);
    },

    start() {

    },

    hideAllNode: function () {
        this.node.active = false;
    },

    runPlayAgainAction: function () {
        this.playAgain.stopAllActions();
        let action = cc.sequence(cc.rotateTo(0.15, -10), cc.rotateTo(0.3, 10), cc.rotateTo(0.15, -5), cc.rotateTo(0.3, 5), cc.rotateTo(0.15, 0));
        this.playAgain.runAction(action.clone());
    },

    stopPlayAgainAction: function () {
        this.playAgain.stopAllActions();
        let action = cc.rotateTo(0.15, 0);
        this.playAgain.runAction(action.clone());
    },

    animaAction: function (cb) {
        let action = cc.sequence(cc.scaleTo(0.15, 2.4), cc.scaleTo(0.15, 2), cc.scaleTo(0.15, 2.2),
            cc.scaleTo(0.15, 2), cc.scaleTo(0.2, 2.2), cc.scaleTo(0.2, 2), cc.scaleTo(0.2, 2.2),
            cc.scaleTo(0.25, 2), cc.callFunc(() => {
                if (cb) cb();
            }));
        this.node.runAction(action.clone());
    },

    newLevel: function () {
        this.node.active = true;
        this.animaAction(this.newLevelcb.bind(this));
        this.newLevelNode.active = true;
        this.gameOverNode.active = false;
    },

    newLevelcb: function () {
        cc.log(this);
        this.node.emit('NEXT_LEVEL');
        this.node.active = false;
    },

    gameOver: function (level) {
        this.playAudio('gameOver');
        this.node.active = true;
        this.gameOverNode.active = true;
        this.newLevelNode.active = false;
        let number1 = Math.floor((level - 1) / 10);
        let number2 = (level - 1) % 10;
        let url = ['./img/b' + number2];
        if (number1 !== 0) url.push('./img/b' + number1);
        cc.loader.loadResArray(url, cc.SpriteFrame, (error, res) => {
            if (error) return;
            this.levelClearedNum.getComponent(cc.Sprite).spriteFrame = res[0];
            this.levelClearedNum.children[0].active = false;
            if (res[1]) {
                this.levelClearedNum.children[0].active = true;
                this.levelClearedNum.children[0].getComponent(cc.Sprite).spriteFrame = res[1];
            }
        })
    },

    playAudio: function (name) {
        let urlName = 'audio/' + name;
        cc.loader.loadRes(urlName, (error, res) => {
            cc.audioEngine.play(res);
        })
    },

    onceAgain: function () {
        this.node.emit('ONCE_AGAIN');
        this.node.active = false;
    },

    clickThisNode:function(){
        this.playAudio('noClick');
    },
});
