    var sticker = new Sticker(textDom, stickerDom);
    sticker.init();
    var sticker1 = new Sticker(textDom1, stickerDom1);
    sticker1.init();


    submit.addEventListener('click', function () {
        alert (sticker.getValue());
    });
    submit1.addEventListener('click', function () {
        alert (sticker1.getValue());
    });