
cc.Class({
    extends: cc.Component,

    properties: {
        anima: cc.Node,
        spriteRes: {
            type: cc.SpriteFrame,
            default: [],
        },
        _indexX: Number,        //在数值数组中的位置
        _indexY: Number,
        _index: Number,
        _typeNumber: Number,
        canAddDrop: false,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.anima.on('TOUCH_START', this.playAnima, this);
        this.anima.on('mouseenter', this.playAnima, this);
    },

    start() {

    },

    playAnima: function () {
        if (this.canAddDrop) {
            let animaName = ['', 'oneAnima', 'twoAnima', 'threeAnima', 'fourAnima']
            let anima = this.anima.getComponent(cc.Animation);
            anima.play(animaName[this._typeNumber]);
            anima.on('finished', () => {
                this.renderSprite();
            })
        }
    },

    setOptions: function (data) {
        this.clearSprite();
        this.node.active = true;
        this._indexX = data.arrX;
        this._indexY = data.arrY;
        this._index = data.index;
        this._typeNumber = data.num;
        if (data.num != 0) this.renderSprite();
        this.canAddDrop = this._typeNumber == 0 ? false : true;
    },

    renderSprite: function () {
        this.anima.getComponent(cc.Sprite).spriteFrame = this.spriteRes[this._typeNumber - 1];
    },

    clearSprite: function () {
        this.anima.getComponent(cc.Sprite).spriteFrame = null;
    },

    hideNode: function () {
        this.clearSprite();
        let anima = this.anima.getComponent(cc.Animation);
        anima.stop();
    },

    dropChangeShap: function (event, data) {
        // cc.log(this._indexX, this._indexY, this._typeNumber);
        this.node.emit('BUBBLE_CHANGE_NUMBER', { x: this._indexX, y: this._indexY, isClick: data, typeNumber: this._typeNumber });
        if (this._typeNumber < 4) {
            this.increaseDrop(data);
        } else {
            this.bombDrop(data);
        }
    },

    //水滴变大
    increaseDrop: function () {
        this._typeNumber++;
        this.canAddDrop = true;
        let animaName = ['', '', 'twoGroup', 'threeGroup', 'fourGroup'];
        if (this._typeNumber > 1) {
            let anima = this.anima.getComponent(cc.Animation);
            anima.play(animaName[this._typeNumber]);
            anima.on('finished', () => {
                anima.stop();
                this.renderSprite();
            });
        } else {
            this.renderSprite();
        }

        //data为true表明是点击变大  false表明是别人碰撞变大  声音不同
        let audioName = 'increaseDrop' + this._typeNumber;
        // if (data) audioName = 'increaseDrop1';
        this.node.emit('PLAY_AUDIO', audioName);
    },

    //水滴爆炸
    bombDrop: function (data) {
        this.canAddDrop = false;
        this._typeNumber = 0;
        let anima = this.anima.getComponent(cc.Animation);
        anima.play('fourBomb');
        this.node.emit('BUBBLE_DISPERSE', { indexX: this._indexX, indexY: this._indexY, isClick: data, sNumber: this._index });
        this.node.emit('PLAY_AUDIO', 'bubbleBomb');
        anima.on('finished', () => {
            anima.stop();
            this.clearSprite();
        })
    },

});
