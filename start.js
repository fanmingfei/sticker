    var sticker = new Sticker(textDom, stickerDom);
    sticker.init();
    var sticker1 = new Sticker(textDom1, stickerDom1);
    sticker1.init();


    submit.addEventListener('click', function () {
         a = (sticker.getValue());
    });
    submit1.addEventListener('click', function () {
         a = (sticker1.getValue());
    });