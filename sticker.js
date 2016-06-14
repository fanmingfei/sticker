// (function(window, imagesList) {
var emojiUtil = {},
    editUtil = {};

emojiUtil.toCodePoint = function(unicodeSurrogates, sep) {
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
emojiUtil.findSurrogatePair = function(point) {
    var offset = point - 0x10000,
        lead = 0xd800 + (offset >> 10),
        trail = 0xdc00 + (offset & 0x3ff);
    return [lead.toString(16), trail.toString(16)];
};

emojiUtil.checkSuport = function(code) {
    var codeArr = emojiUtil.findSurrogatePair(code);
    codeArr.unshift('');
    code = unescape(codeArr.join('%u'));
    var node = document.createElement('canvas');
    if (!node.getContext || !node.getContext('2d') || typeof node.getContext('2d').fillText !== 'function') {
        return false;
    }
    var ctx = node.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '32px Arial';
    ctx.fillText(code, 0, 0);
    return ctx.getImageData(16, 16, 1, 1).data[0] !== 0;
};
emojiUtil.parseImgToString = function(value) {
    return value.replace(/<img src=\".+?\" data-name=\"(.+?)\" data-emoji=\".+?\">/g, '[$1]');
};
emojiUtil.removeHsntEmoji = function(value) {
    var patt = /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g;
    var code, emojiImg = [''],
        emojiObj;

    var newValue = value.replace(patt, function(emoji) {
        code = emojiUtil.toCodePoint(emoji);
        emojiImg = imagesList.filter(function(d) {
            return d.emoji == code;
        });
        if (emojiImg.length == 0) {
            return '';
        } else {
            return emoji;
        }
    });
    if (emojiImg.length == 0) {
        return {
            has: 1,
            value: newValue
        };
    } else {
        return {
            has: 0
        };
    }
};
/**
 * 转换emoji成为图片或文本模式
 * @param  {[type]} value [description]
 * @param  {[type]} type  [description]
 * @return {[type]}       [description]
 */
// emojiUtil.parseEmojiToAgent = function(value, type) {
//     var _this = this;
//     var patt = /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g;
//     var code, emojiImg = [],
//         emojiObj;

//     var newValue = value.replace(patt, function(emoji) {
//         code = emojiUtil.toCodePoint(emoji);
//         emojiImg = imagesList.filter(function(d) {
//             return d.emoji == code;
//         });
//         if (emojiImg.length > 0) {
//             emojiObj = emojiImg[0];
//         } else {
//             emojiImg[0] = ''; // 因为通过判断emojiImg长度来替换字符串，为了替换掉没有的emoji为空。
//             return '';
//         }
//         // return emoji;
//         // 如果替换成图片 或者 文字 
//         if (_this.textType == 1) {
//             return '<img src="' + _this.imagesPath + emojiObj.url + '" data-name="' + emojiObj.name + '" data-emoji="' + emojiObj.emoji + '" data-type="sticker" width="30" height="30">';
//         } else {
//             return '[' + emojiObj.name + ']';
//         }
//     });
//     return newValue;
// };

editUtil.insertHtmlAtCaret = function(elem, html) {
    var sel, range;
    elem.focus();
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(),
                node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
};
editUtil.getCursorPostion = function(ctrl) { //获取光标位置函数
    var CaretPos = 0; // IE Support
    var value = ctrl.value || ctrl.innerHTML;
    if (document.selection) {
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -value.length);
        CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
        CaretPos = ctrl.selectionStart;
    return (CaretPos);
};

editUtil.insertTextAtArea = function(elem, value) {

    pos = editUtil.getCursorPostion(elem);
    s = elem.value;
    elem.value = s.substring(0, pos) + value + s.substring(pos);
    editUtil.setCaret(elem, pos + value.length);
    elem.focus();
};
editUtil.setCaret = function(elem, pos) {
    if (elem.setSelectionRange) { //W3C
        setTimeout(function() {
            elem.setSelectionRange(pos, pos);
            elem.focus();
        }, 0);
    } else if (elem.createTextRange) { //IE
        var textRange = elem.createTextRange();
        textRange.moveStart("character", pos);
        // textRange.moveEnd("character", pos+1);
        textRange.collapse(true);
        textRange.select();
    }
};

function Sticker(textDom, stickerDom) {
    this.textDom = textDom;
    this.stickerDom = stickerDom;
    this.imagesList = imagesList;
    this.imagesPath = './sticker/';
    this.checkTimer = 0;

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
            lists[j].onclick = function() {
                if (_this.textType == 1) {
                    _this.insertImg(lists[j].getElementsByTagName('img')[0]);
                } else {
                    _this.insertText(lists[j].getElementsByTagName('img')[0]);
                }
            }
        })(i);
    }
};

Sticker.prototype.insertImg = function(img) {
    var _this = this;
    img = img.cloneNode();
    img.width = 30;
    img.height = 30;
    editUtil.insertHtmlAtCaret(_this.textDom, img.outerHTML);
};

Sticker.prototype.insertText = function(img) {
    var _this = this;
    editUtil.insertTextAtArea(_this.textDom, '[' + img.getAttribute('data-name') + ']');
};

Sticker.prototype.getValue = function() {
    var _this = this;
    if (_this.textType == 1) {
        return emojiUtil.parseImgToString(_this.textDom.innerHTML);
    } else {
        return _this.textDom.value;
    }
};


Sticker.prototype.removeHsntEmoji = function() {
    var _this = this;
    var newValue;
    if (_this.textType == 1) {
        if (window.getSelection) {
            var sel = window.getSelection();
            var range = sel.getRangeAt(0);
            var num = range.startOffset - 2 < 0 ? 0 : range.startOffset - 2;
            var range1 = range.cloneRange();

            newValue = emojiUtil.removeHsntEmoji(range.startContainer.data || '');
            if (newValue.has) {
                range.startContainer.data = newValue.value;
                range1.deleteContents();
                range1.setStart(range.startContainer, num);
                range1.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range1);
            }

        } else {
            var oldPostion = editUtil.getCursorPostion(_this.textDom);
            var value = _this.textDom.value || _this.textDom.innerHTML;
            var newValue = emojiUtil.removeHsntEmoji(value);
            if (newValue.has) {
                var defferent = newValue.length - value.length;
                var range = document.body.createTextRange();
                range.moveToElementText(_this.textDom);
                range.moveStart('character', oldPostion-defferent);
                range.collapse(true);
                range.select();
            }
        }

    } else {
        var value = _this.textDom.value || _this.textDom.innerHTML || '';
        newValue = emojiUtil.removeHsntEmoji(value || '');
        var pos = editUtil.getCursorPostion(_this.textDom);
        if (newValue.has) {
            _this.textDom.value = newValue.value;
            editUtil.setCaret(_this.textDom, pos - 2);
        }
    }
};


Sticker.prototype.parseAgentToImage = function() {
    var _this = this;
    var patt = /\[(.+?)\]/g;
    var value = _this.textDom.value || _this.textDom.innerHTML;
    var newValue = value.replace(patt, function(text) {
        var name = text.split('[')[1].split(']')[0];
        var images = imagesList.filter(function(d) {
            return d.name == name;
        });
        var image = images[0];
        if (!image) {
            return text; // 如果找到 返回之前的内容
        }
        if (image.emoji) {
            var canUseEmoji = emojiUtil.checkSuport('0x' + image.emoji);
            if (canUseEmoji) {
                var codeArr = emojiUtil.findSurrogatePair('0x' + image.emoji);
                codeArr.unshift('');
                var code = unescape(codeArr.join('%u'));
                return code; //如果找到emoji 并且支持 就返回emoji
            }
        }
        if (_this.textType == 1) {
            return '<img src="' + _this.imagesPath + image.url + '" data-name="' + image.name + '" data-emoji="' + image.emoji + '" data-type="sticker">';
        } else {
            return text;
        }
    });
    console.log(newValue);
};
Sticker.prototype.parseAgentToEmoji = function() {
    var _this = this;
    var patt = /\[(.+?)\]/g;
    var value = _this.textDom.value || _this.textDom.innerHTML;
    var newValue = value.replace(patt, function(text) {
        var name = text.split('[')[1].split(']')[0];
        var images = imagesList.filter(function(d) {
            return d.name == name && d.emoji;
        });
        var image = images[0];
        if (!image) {
            return text; // 如果找到 返回之前的内容
        }
        if (image.emoji) {
            var canUseEmoji = emojiUtil.checkSuport('0x' + image.emoji);
            if (canUseEmoji) {
                var codeArr = emojiUtil.findSurrogatePair('0x' + image.emoji);
                codeArr.unshift('');
                var code = unescape(codeArr.join('%u'));
                return code; //如果找到emoji 并且支持 就返回emoji
            }
        }
        if (_this.textType == 1) {
            return '<img src="' + _this.imagesPath + image.url + '" data-name="' + image.name + '" data-emoji="' + image.emoji + '" data-type="sticker">';
        } else {
            return text;
        }
    });
};



Sticker.prototype.startCheck = function() {
    var _this = this;
    _this.textDom.onfocus = function() {
        _this.checkTimer = setInterval(function() {
            _this.removeHsntEmoji();
        }, 200);
    }

    _this.textDom.onblur = function() {
        clearInterval(_this.checkTimer);
    }
};

Sticker.prototype.init = function() {
    var _this = this;
    _this.renderSticker();
    _this.bindStickerList();
    _this.startCheck();
};

Sticker.parseEmojiToAgent = emojiUtil.parseEmojiToAgent;

window.Sticker = Sticker;

// })(window, imagesList);