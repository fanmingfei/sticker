(function(window, imagesList) {
    var util = {};
    util.addValue = function(obj, value) {
        pos = getCursortPosition(obj);
        s = obj.value;
        obj.value = s.substring(0, pos) + value + s.substring(pos);
    };
    util.toCodePoint = function(unicodeSurrogates, sep) {
        var
            r = [],
            c = 0,
            p = 0,
            i = 0;
        while (i < unicodeSurrogates.length) {
            c = unicodeSurrogates.charCodeAt(i++); //返回位置的字符的 Unicode 编码

            if (p) {
                r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16)); //计算4字节的unicode
                p = 0;
            } else if (0xD800 <= c && c <= 0xDBFF) {
                p = c; //如果unicode编码在oxD800-0xDBff之间，则需要与后一个字符放在一起
            } else {
                r.push(c.toString(16)); //如果是2字节，直接将码点转为对应的十六进制形式
            }
        }
        return r.join(sep || '-');
    };

    function Sticker(textDom, stickerDom) {
        this.textDom = textDom;
        this.stickerDom = stickerDom;
        this.imagesList = imagesList;
        this.imagesPath = './sticker/';

        if (textDom.tagName.toLowerCase() == 'div') {
            this.textType = 1; // 是 div 
        } else {
            this.textType = 2; // input 或者 textarea
        }

    }

    Sticker.prototype.renderSticker = function() {
        var html = '',
            _this = this;
        _this.imagesList.forEach(function(val) {
            html += '<li><img src="' + _this.imagesPath + val.url + '" data-name="' + val.name + '" data-emoji="' + val.emoji + '" data-type="sticker"></li>';
        });
        _this.stickerDom.innerHTML = html;
    };

    Sticker.prototype.bindStickerList = function() {
        var _this = this;
        var lists = _this.stickerDom.getElementsByTagName('li');
        for (var i = 0; i < lists.length; i++) {
            (function(j) {
                lists[j].addEventListener('click', function() {
                    if (_this.textType == 1) {
                        _this.insertImg(lists[j].getElementsByTagName('img')[0]);
                    } else {
                        _this.insertText(lists[j].getElementsByTagName('img')[0]);
                    }
                });
            })(i);
        }
    };

    Sticker.prototype.insertImg = function(img) {
        var _this = this;
        img = img.cloneNode();
        img.width = 30;
        img.height = 30;
        _this.textDom.appendChild(img);
    };

    Sticker.prototype.insertText = function(img) {
        var _this = this;
        _this.textDom.value += '[' + img.getAttribute('data-name') + ']';
    };

    Sticker.prototype.getValue = function() {
        var _this = this;
        if (_this.textType == 1) {
            return _this.parseValue(_this.textDom.innerHTML);
        } else {
            return _this.textDom.value;
        }
    };

    Sticker.prototype.parseValue = function(value) {
        return value.replace(/<img src=\".+?\" data-name=\"(.+?)\" data-emoji=\".+?\">/g, '[$1]');
    };


    Sticker.prototype.init = function() {
        var _this = this;
        _this.renderSticker();
        _this.bindStickerList();
    };

    window.Sticker = Sticker;

})(window, imagesList);