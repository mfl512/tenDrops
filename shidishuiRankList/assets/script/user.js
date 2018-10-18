
cc.Class({
    extends: cc.Component,

    properties: {
        rankingNumberNode: cc.Node,
        userHead: cc.Node,        //微信头像
        userName: cc.Node,        //微信昵称
        score: cc.Node,       //游戏最高分
        level: cc.Node,       //最高通关数
    },


    start() {

    },

    setOptions: function (data) {
        this.rankingNumberNode.getComponent(cc.Label).string = data.rankingNumber;
        let url = '';
        cc.loader.load(url, cc.SpriteFrame, (error, spriteFrame) => {
            if (error) return;
            this.userHead.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        this.userName.getComponent(cc.Label).string = data.userName;
        this.score.getComponent(cc.Label).string = data.score;
        this.level.getComponent(cc.Label).string = data.level;
    },


});
