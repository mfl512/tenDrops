
cc.Class({
    extends: cc.Component,

    properties: {
        frendsBtn: cc.Node,
        allUserBtn: cc.Node,
        kuang: cc.Node,

    },

    onLoad() {
        wx.onMessage(this.onMessage.bind(this));
    },

    start() {
    },

    getSelfUserInfo: function () {
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            success: data => {
                this._selfData = data.data[0];
                cc.log('获取自己的信息', this._selfData);
            }
        });
    },

    hideAll: function () {
        this.node.active = false;
    },

    onMessage: function (data) {
        wx.getFriendCloudStorage({
            keyList: ['scoreRank'],
            success: res => {
                cc.log('获取成功', res);
            }
        })
    },

    renderUsersInfo: function () {
       
    },


    //传入单个的数据
    showSingleOptions: function (data) {
        this.crowdNode.active = false;
        this.over.active = false;
        this.historyScoreNode.active = false;
        this.currentScoreNode.getComponent(cc.Label).string = data.score;

        wx.getUserCloudStorage({
            keyList: ['score'],
            success: res => {
                cc.log('获取桑牵童虎', res);
                if (res.KVDataList[0]) {
                    let historyScore = parseInt(res.KVDataList[0].value);
                    if (parseInt(historyScore) <= data.score) {
                        this.renderSingleDataIntoWX(data.score);
                    } else {
                        this.historyNode.getComponent(cc.Label).string = '历史最佳  ' + historyScore;
                        this.getFriendCloudStorage();
                    }
                } else {
                    this.renderSingleDataIntoWX(data.score);
                }
            },
            fail: res => {
                cc.log('获取失败');
                this.renderSingleDataIntoWX(data.score);
            }
        })
        // wx.removeUserCloudStorage({
        //     keyList:['score'],
        //     success:res=>{
        //         cc.log('删除记录成功');
        //     }
        // });

    },

    renderSingleOptions: function () {
        this.renderSingleList(1, this._data[this._selfIndex]);
        if (this._data[this._selfIndex - 1].KVDataList) this.renderSingleList(0, this._data[this._selfIndex - 1]);
        if (this._data[this._selfIndex + 1].KVDataList) this.renderSingleList(2, this._data[this._selfIndex + 1]);
    },

    //清除单个列表的数据
    clearSingleList: function () {
        let childNode = this.singleRankingList.children;
        for (let i = 0, max = childNode.length; i < max; i++) {
            childNode[i].children[0].getComponent(cc.Sprite).spriteFrame = null;
            childNode[i].children[0].children[0].getComponent(cc.Sprite).spriteFrame = null;
            childNode[i].children[1].getComponent(cc.Sprite).spriteFrame = null;
            childNode[i].children[2].getComponent(cc.Label).string = '';
            childNode[i].children[3].getComponent(cc.Label).string = '';
        }
    },

    renderSingleList: function (index, info) {
        let score = parseInt(info.KVDataList[0].value);
        if ((this._selfIndex + index) < 10) {
            this.singleRankingList.children[index].children[0].children[0].active = false;
            cc.loader.loadRes('./resources/' + (this._selfIndex + index), cc.SpriteFrame, (err, spriteFrame) => {
                if (err) return;
                this.singleRankingList.children[index].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame[0];
            });
        } else {
            this.singleRankingList.children[index].children[0].children[0].active = true;
            let url = ['./resources/' + Math.floor((this._selfIndex + index) / 10), './resources/' + ((this._selfIndex + index) % 10)]
            cc.loader.loadResArray(url, cc.SpriteFrame, (err, spriteFrame) => {
                cc.log(err);
                if (err) return;
                this.singleRankingList.children[index].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame[0];
                this.singleRankingList.children[index].children[0].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame[1];
            });
        }
        let url = info.avatarUrl;
        cc.loader.load({ url: url, type: 'png' }, (err, res) => {
            if (err) return;
            this.singleRankingList.children[index].children[1].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
        });
        this.singleRankingList.children[index].children[2].getComponent(cc.Label).string = info.nickname;
        this.singleRankingList.children[index].children[3].getComponent(cc.Label).string = score;
    },


    //传入群排行榜数据
    showCrowdOptions: function () {
        this.singleNode.active = false;
        this.historyScoreNode.active = false;
        this.over.active = false;
        wx.getFriendCloudStorage({
            keyList: ['score'],
            success: res => {
                console.log('获取成功', res);
                // 让子域更新当前用户的最高分，因为主域无法得到getUserCloadStorage;
                this._data = res.data;
                this.sortUserData();
                this.getSelfIndex();
                this.renderCrowdData();
                this.crowdNode.active = true;
                this.node.active = true;
            },
            fail: res => {
                console.log('获取失败', res);
            }
        });
    },

    renderCrowdData: function () {
        this.crowdRankingList.removeAllChildren();
        cc.loader.loadRes('./listItem', (err, res) => {
            if (err) return;
            let firstNum = Math.floor(this._selfIndex / 10);
            this._currentPage = firstNum;
            let max = (Math.floor(this._selfIndex / 10) + 1) <= Math.floor(this._data.length / 10) ? (firstNum + 1) * 10 : firstNum * 10 + this._data.length % 10;
            this._maxPage = Math.floor(this._data.length / 10);
            for (let i = firstNum; i < max; i++) {
                let isSelf = false;
                let newPrefab = cc.instantiate(res)
                if (i == this._selfIndex) isSelf = true;
                this.crowdRankingList.addChild(newPrefab);
                this.renderListNode(newPrefab, this._data[i], i, isSelf);
            }
        })
    },

    //渲染群排行榜数据信息
    renderListNode: function (ListNode, data, index, isSelf) {
        ListNode.children[0].getComponent(cc.Label).string = (index + 1);
        if (isSelf) ListNode.children[0].color = new cc.color(208, 235, 255), ListNode.children[0].scale = 1.2;
        let url = data.avatarUrl;
        cc.loader.load({ url: url, type: 'png' }, (err, res) => {
            cc.log(err);
            if (err) return;
            ListNode.children[1].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
        });
        ListNode.children[2].getComponent(cc.Label).string = data.nickname;
        ListNode.children[3].getComponent(cc.Label).string = parseInt(data.KVDataList[0].value);
    },


    //上一页
    prePage: function () {
        if (this._currentPage <= 0) return;
        this._currentPage--;
    },

    //下一页
    nextPage: function () {
        if (this._currentPage >= this._maxPage) return;
        this._currentPage++;
    },

    //游戏结束显示的页面（复活页面）
    showOverPage: function () {

    },

    test: function () {
        cc.log('颠倒了我');
    },
});
