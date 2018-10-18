const bubbleTypeNum = [8, 6, 10, 10, 6];
cc.Class({
    extends: cc.Component,

    properties: {
        kuang: cc.Node,
        dropKuang: cc.Node,     //小水滴框
        dropPrefab: cc.Prefab,       //小水滴预制
        mask: cc.Node,      //遮挡板（当有小水滴移动时，遮挡板出现，禁止点击）
        level: cc.Node,         //第几局
        surplusDropsNum: {
            type: cc.Node,
            default: [],
        },          //剩余水滴
        surplusDropsIcon: {
            type: cc.Node,
            default: [],
        },      //剩余水滴图片
        alertPanelNode: cc.Node,        //提示面板
        bg: cc.Node,
        totalScoreNode: cc.Node,
        _bubbleShuffleArr: [],     //打乱的一维气泡数组
        _bubbleNumArr: [],         //水滴数值数组（多维）
        _bubbleJSArr: [],       //水滴JS数组
        _gameLevel: 0,          //游戏局数
        _maxWidth: 6,           //格子宽度
        _maxHeight: 6,      //格子高度
        _bubblePrefabUrl: './bubble',      //气泡预制
        _dropPrefabUrl: './smallDrop',       //小水滴预制
        _dropNumber: 10,        //水滴数量
        _diractionArr: [],      //方位数组
        _originalPosition: [],       //第一个框的相对位置
        _interval: 107.5,
        _leftArr: [],
        _rightArr: [],
        _topArr: [],
        _bottomArr: [],
        _crackedDrip: 0,        //本次点击最终破裂的水滴
        _alertJS: null,
        _totalScore: 0,          //游戏分数

    },

    onLoad: function () {
        this._diractionArr = ['left', 'right', 'top', 'bottom'];
        this._originalPosition = [-269, 269];
        this.loadPrefab();
    },

    onDestroy: function () {
    },

    start() {
        // this.shuffleBubble();
        //第一个格子的初始位置 [-269,269] 间隔  107.5
        cc.loader.loadRes('./alertPanel', (error, res) => {
            if (error) return;
            let newPrefab = cc.instantiate(res);
            this.alertPanelNode.addChild(newPrefab);
            newPrefab.on('NEXT_LEVEL', this.newLeval, this);
            newPrefab.on('ONCE_AGAIN', this.onceAgain, this);
            this._alertJS = newPrefab.getComponent('alertPanel');
            this._alertJS.hideAllNode();
        })
    },

    setOptions: function () {

    },

    loadPrefab: function () {
        let tempNum = 0;
        cc.loader.loadRes(this._bubblePrefabUrl, (error, res) => {
            cc.log(error);
            if (error) return;
            for (let i = 0; i < this._maxWidth; i++) {
                this._bubbleJSArr[i] = [];
                for (let j = 0; j < this._maxHeight; j++) {
                    let newBubblePrefab = cc.instantiate(res);
                    newBubblePrefab.on('BUBBLE_DISPERSE', this.bubbleDisperse, this);
                    newBubblePrefab.on('BUBBLE_CHANGE_NUMBER', this.updateNumberArr, this);
                    newBubblePrefab.on('PLAY_AUDIO', this.playAudio, this);
                    newBubblePrefab.x = this._originalPosition[0] + j * this._interval;
                    newBubblePrefab.y = this._originalPosition[1] - i * this._interval;
                    let prefabJs = newBubblePrefab.getComponent('bubble');
                    prefabJs.clearSprite();
                    this._bubbleJSArr[i][j] = { js: prefabJs };
                    this.kuang.addChild(newBubblePrefab);
                    // this.kuang.children[tempNum].addChild(newBubblePrefab);
                    tempNum++;
                }
            };
            this.newLeval()
            this.bg.active = false;
        })
    },

    //创建一局新的数据
    shuffleBubble: function () {
        this._gameLevel++;
        this.level.getComponent(cc.Label).string = this._gameLevel;
        this._bubbleShuffleArr = [];
        let bubbleTypeNumTemp = [].concat(bubbleTypeNum);
        if (this._gameLevel > 10 && this._gameLevel < 50) {
            bubbleTypeNumTemp = this.increaseDifficulty(bubbleTypeNumTemp);
        }
        //生成
        let tempArr = []
        for (let i = 0; i < bubbleTypeNumTemp.length; i++) {
            for (let j = 0; j < bubbleTypeNumTemp[i]; j++) {
                tempArr.push(i);
            }
        };
        //打乱
        while (tempArr.length > 0) {
            this._bubbleShuffleArr.push((tempArr.splice(Math.floor(Math.random() * tempArr.length), 1))[0]);
        };
        cc.log(JSON.stringify(this._bubbleShuffleArr));
        this.buildBubblePrefab();
    },

    //增加难度
    increaseDifficulty: function (bubbleTypeNumTemp) {
        let newArr = [].concat(bubbleTypeNumTemp);
        newArr.splice(0, 1, bubbleTypeNumTemp[0] + 1);
        newArr.splice(1, 1, bubbleTypeNumTemp[0] + 1);
        newArr.splice(2, 1, bubbleTypeNumTemp[0] + 1);
        newArr.splice(3, 1, bubbleTypeNumTemp[0] - 1);
        newArr.splice(4, 1, bubbleTypeNumTemp[0] - 1);
        return newArr
    },

    //创建气泡预制
    buildBubblePrefab: function () {
        let tempNum = 0;
        for (let i = 0; i < this._bubbleJSArr.length; i++) {
            this._bubbleNumArr[i] = [];
            for (let j = 0; j < this._bubbleJSArr[i].length; j++) {
                this._bubbleJSArr[i][j].js.setOptions({ num: this._bubbleShuffleArr[tempNum], arrX: i, arrY: j, index: tempNum });
                this._bubbleNumArr[i][j] = this._bubbleShuffleArr[tempNum];
                tempNum++;
            }
        }
    },

    //消除所有气泡
    clearAllBubble: function () {
        setTimeout(() => {
            for (let i = 0, iMax = this._bubbleJSArr.length; i < iMax; i++) {
                for (let j = 0, jMax = this._bubbleJSArr[i].length; j < jMax; j++) {
                    this._bubbleJSArr[i][j].js.hideNode();
                }
            }
        }, 100)
    },

    //开始新一局
    newLeval: function () {
        if (this._bubbleJSArr.length == 0) return;
        this.mask.active = false;
        this.shuffleBubble();
        this.updateDropNumber({});
    },

    onceAgain: function () {
        this._dropNumber = 10;
        this._gameLevel = 0;
        this._totalScore = 0;
        this.totalScoreNode.getComponent(cc.Label).string = this._totalScore;
        this.newLeval();
    },

    //增加水滴 向四周碰撞
    bubbleDisperse: function (data) {
        // cc.log(data);
        this.updateDropNumber({ isBomb: true })
        this._leftArr[data.sNumber] = [data.indexX, data.indexY];
        this._rightArr[data.sNumber] = [data.indexX, data.indexY];
        this._topArr[data.sNumber] = [data.indexX, data.indexY];
        this._bottomArr[data.sNumber] = [data.indexX, data.indexY];
        this.createMoveSmallDrop(data);
        this.judgeIsCanClick();
        for (let i = 0; i < this._diractionArr.length; i++) {
            this.moveDrop(this._diractionArr[i], data.sNumber, { x: data.indexX, y: data.indexY });
        };
        if (CC_WECHATGAME) {          //小游戏环境
            wx.vibrateShort();
        }
    },

    //g更新当前剩余水滴数   是否是点击   是否是新的一局 是否爆炸
    updateDropNumber: function (data) {
        //如果是点击的 则减去一滴水 且把this._crackedDrip置为初始值;
        if (data.isClick) this._dropNumber--;
        if (data.isClick) {
            this._crackedDrip = 0;
            this._clickCrackedDrip = 0;
        }
        //水滴爆炸
        if (data.isBomb) {
            this._crackedDrip++;
            this._clickCrackedDrip++;
            this._totalScore = this._totalScore + Math.pow(2, this._clickCrackedDrip);
            this.totalScoreNode.getComponent(cc.Label).string = this._totalScore;
        };

        //如果每次都破裂三个的倍数都要送一滴水
        if ((this._crackedDrip != 0 && this._crackedDrip % 3 == 0) || data.newLevelAddOne) {
            this._dropNumber++;
            this._crackedDrip = 0;
            this.playAudio('addDrop');
        };
        if (this._dropNumber > 0) {
            cc.loader.loadResArray(['./img/' + this._dropNumber, './img/a' + this._dropNumber], cc.SpriteFrame, (error, resArr) => {
                if (error) return;
                this.surplusDropsIcon[0].getComponent(cc.Sprite).spriteFrame = resArr[0];
                this.surplusDropsIcon[1].getComponent(cc.Sprite).spriteFrame = resArr[1];
            })
        } else {
            this.surplusDropsIcon[0].getComponent(cc.Sprite).spriteFrame = null;
            this.surplusDropsIcon[1].getComponent(cc.Sprite).spriteFrame = null;
        }
        let numberOne = Math.floor(this._dropNumber / 10) == 0 ? null : Math.floor(this._dropNumber / 10);
        let numberTwo = this._dropNumber % 10;
        let urlArr = ['./img/n' + numberTwo];
        if (numberOne) urlArr.push(('./img/n' + numberOne));
        cc.loader.loadResArray(urlArr, cc.SpriteFrame, (error, resArr) => {
            if (error) return;
            this.surplusDropsNum[0].getComponent(cc.Sprite).spriteFrame = resArr[0];
            this.surplusDropsNum[1].active = false;
            if (resArr[1]) {
                this.surplusDropsNum[1].active = true;
                this.surplusDropsNum[1].getComponent(cc.Sprite).spriteFrame = resArr[1];
            }
        });
        if (data.isClick && data.typeNumber != 4 && this._dropNumber <= 0) {
            cc.log('data.typeNumber', data.typeNumber);
            this._alertJS.gameOver(this._gameLevel);
            this.clearAllBubble();
            this.mask.active = true;
        }
    },

    cloudDate:function(){
        // wx.
    },

    //创建向外移动的小水滴
    createMoveSmallDrop: function (data) {
        let rotation = [180, 0, 270, 90];
        let moveDireaction = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        let centerPosition = [this._originalPosition[0] + this._interval * data.indexY, this._originalPosition[1] - this._interval * data.indexX];
        for (let i = 0; i < 4; i++) {
            let newPrefab = new cc.instantiate(this.dropPrefab);
            newPrefab.on('CHECK_IS_SHOW_OR_HIDE_MASK', this.judgeIsCanClick, this);
            newPrefab.on('PLAY_AUDIO', this.playAudio, this);
            this.dropKuang.addChild(newPrefab);
            newPrefab.rotation = rotation[i];
            newPrefab.x = centerPosition[0] + moveDireaction[i][0];
            newPrefab.y = centerPosition[1] + moveDireaction[i][1];
            this._bubbleJSArr[data.indexX][data.indexY][this._diractionArr[i]] = newPrefab.getComponent('smallDrop');
        }
    },

    //移动水滴
    moveDrop: function (diraction, sNumber, originArr) {
        let index;
        let diractionArr = [];
        switch (diraction) {
            case 'left':
                index = 0;
                this._leftArr[sNumber][1]--;
                diractionArr = this._leftArr[sNumber];
                break;
            case 'right':
                index = 1;
                this._rightArr[sNumber][1]++;
                diractionArr = this._rightArr[sNumber];
                break;
            case 'top':
                index = 2;
                this._topArr[sNumber][0]--;
                diractionArr = this._topArr[sNumber];
                break;
            case 'bottom':
                index = 3;
                this._bottomArr[sNumber][0]++;
                diractionArr = this._bottomArr[sNumber];
                break;
            default:
                break;
        }
        this.judgeChangeOrNot(diractionArr, index, sNumber, originArr);
    },

    //判断移动后的小水滴位置是否存在且是否可以叠加  
    //参数分别代表的含义 ： 小水滴节点在数组中的坐标   具体哪个方向（左右上下）  在一维大数组中的位置序号  释放小水滴的节点的位置  
    judgeChangeOrNot: function (diractionArr, index, sNumber, originArr) {
        if (!diractionArr || !(index || index === 0)) return;
        let moveDireaction = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        let moveDirName = [this._leftArr, this._rightArr, this._topArr, this._bottomArr];
        let currentPosition = this._bubbleJSArr[diractionArr[0]] ? this._bubbleJSArr[diractionArr[0]][diractionArr[1]] : false;       //是否有格子存在
        let isCanAddDrop = currentPosition ? this._bubbleJSArr[diractionArr[0]][diractionArr[1]].js.canAddDrop : false;      //是否还可以增加水滴
        if (currentPosition && isCanAddDrop) {
            //格子存在 且可以叠加
            let action = cc.sequence(cc.moveBy(0.2, moveDireaction[index][0] * this._interval / 2, moveDireaction[index][1] * this._interval / 2), cc.callFunc(() => {
                let isCanAddDropAgain = this._bubbleJSArr[diractionArr[0]][diractionArr[1]].js.canAddDrop;
                if (isCanAddDropAgain) {
                    this._bubbleJSArr[originArr.x][originArr.y][this._diractionArr[index]].node.destroy();
                    this._bubbleJSArr[diractionArr[0]][diractionArr[1]].js.dropChangeShap();
                } else {
                    this.moveDrop(this._diractionArr[index], sNumber, originArr);
                }
            }));
            this._bubbleJSArr[originArr.x][originArr.y][this._diractionArr[index]].node.runAction(action);
        } else if (currentPosition && !isCanAddDrop) {
            //格子存在 但是不能叠加
            let action = cc.sequence(cc.moveBy(0.2, moveDireaction[index][0] * this._interval, moveDireaction[index][1] * this._interval), cc.callFunc(() => {
                this.moveDrop(this._diractionArr[index], sNumber, originArr);
            }));
            this._bubbleJSArr[originArr.x][originArr.y][this._diractionArr[index]].node.runAction(action);
        } else {
            //格子不存在 碰撞消失
            let action = cc.sequence(cc.moveBy(0.2, moveDireaction[index][0] * this._interval, moveDireaction[index][1] * this._interval), cc.delayTime(0.2), cc.callFunc(() => {
                this._bubbleJSArr[originArr.x][originArr.y][this._diractionArr[index]].node.destroy();
            }));
            this._bubbleJSArr[originArr.x][originArr.y][this._diractionArr[index]].node.runAction(action);
        }
    },

    //改变数据数组中的数据值 
    updateNumberArr: function (data) {
        this.updateDropNumber({ isClick: data.isClick, typeNumber: data.typeNumber });
        let updateNumber = this._bubbleNumArr[data.x][data.y];
        this._bubbleNumArr[data.x][data.y] = this.returnNewNumber(updateNumber);
        // cc.log(JSON.stringify(this._bubbleNumArr));
        this.judgeIsGameOver();
    },

    //返回处理后的数组数据
    returnNewNumber: function (num) {
        let newNum = num;
        if (num < 4) {
            newNum = num + 1;
        } else {
            newNum = 0;
        }
        return newNum;
    },

    //判断游戏是否结束(判断数值数组中的所有值都为0 )
    judgeIsGameOver: function () {
        let total = 0;
        for (let i = 0, len = this._bubbleNumArr.length; i < len; i++) {
            for (let j = 0, jLen = this._bubbleNumArr[i].length; j < jLen; j++) {
                total = total + this._bubbleNumArr[i][j];
                if (total > 0) break;
            }
        };
        if (total == 0) {
            //表明所有水滴都已经消除玩，进入下一局
            this._nextWating = true;
        }
    },

    //表明所有水滴都已经消除玩，进入下一局
    nextLevelFunc: function () {
        this._alertJS.newLevel();
        this.updateDropNumber({ newLevelAddOne: true });
        this.mask.active = true;
        this._nextWating = false;
    },

    //判断当前点击是否还有小水滴在移动   由此得到是否可以继续点击
    judgeIsCanClick: function () {
        clearTimeout(this._time);
        this._time = setTimeout(() => {
            this.mask.active = !(this.dropKuang.children.length == 0);
            if (this._nextWating && this.mask.active == false) this.nextLevelFunc();
            // cc.log('剩余子节点个数', this.dropKuang.children.length, this.dropKuang.children);
            if (this.mask.active == false && this._dropNumber <= 0) {
                cc.log('GAME OVER');
                this.mask.active = true;
                this._alertJS.gameOver(this._gameLevel);
                this.clearAllBubble();
            }
        }, 10)
    },

    canNotClick: function () {
        this.playAudio('noClick')
    },


    playAudio: function (name) {
        let urlName = 'audio/' + name;
        cc.loader.loadRes(urlName, (error, res) => {
            cc.audioEngine.play(res);
        })
    },

});
