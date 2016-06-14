    var sticker = new Sticker(textDom, stickerDom);
    sticker.init();
    var sticker1 = new Sticker(textDom1, stickerDom1);
    sticker1.init();


    submit.onclick=function () {
        alert (sticker.getValue());
    }
    submit1.onclick = function () {
        alert (sticker1.getValue());
    }
