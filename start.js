    var sticker = new Sticker(textDom, stickerDom);
    sticker.init();
    var sticker1 = new Sticker(textDom1, stickerDom1);
    sticker1.init();


    submit.onclick=function () {
        var value = sticker.getValue();
        var newValue = Sticker.parseAgentToEmojiOrImg(value);
        var li = document.createElement('li');
        li.innerHTML = newValue;
        chatBox.appendChild(li);
    };
    submit1.onclick = function () {
        var value = sticker1.getValue();
        var newValue = Sticker.parseAgentToEmojiOrImg(value);
        var li = document.createElement('li');
        li.innerHTML = newValue;
        chatBox1.appendChild(li);
    };
