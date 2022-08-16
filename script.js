let urls;
let currentCh = 0;
let player = $("audio#player")[0];
let isPlaying = false;
let hls = null;

const play = (ch) => {
  if (!player.paused) player.pause();
  if (hls) {
    hls.destroy();
    hls = null;
  }

  currentCh = ch;
  $("div.manifest-item").removeClass("selected");
  $(`div#${currentCh}ch`).addClass("selected");

  let isHLSPlaylist = urls[ch].split('.').pop().startsWith('m3u');
	if (isHLSPlaylist && !player.canPlayType('application/vnd.apple.mpegurl')) {
		if (Hls.isSupported()) {
			hls = new Hls();
			hls.loadSource(urls[ch]);
			hls.attachMedia(player);
		} else {
			alert("Hls.js is not supported.");
		}
	} else {
			player.src = urls[ch];
	}
  $("span#ch-number").text(ch);
  player.play();
  isPlaying = true;
};

$(() => {
  $("input#input-manifest").change(e => {
    if (urls != undefined) {
      $("div.manifest-item").remove();
    }

    let data = $(e.target).prop("files")[0];
    let reader = new FileReader();
		reader.readAsText(data);
		reader.onload = function (){
      urls = reader.result
                  .replace(/\r/g, '')
                  .split(/\n/g)
                  .filter((val) => {return val.length > 0 && val[0] != '#';});  // 空行とコメント(#から始まる)を削除
      for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let item = $('<div>', {
          id: `${i}ch`,
          class: 'manifest-item',
          onclick: `play(${i})`,
          text: `${i}ch ${url}`
        });
        $("div#manifests").append(item);
      }
    }
  });

  $("button#play-pause").click(() => {
    if(isPlaying) {
      player.pause();
      isPlaying = false;
    } else {
      if(!urls || urls.length < 1){
        alert("no manifest");
        return;
      }
      play(currentCh);
    }
  });

  $("button#previous").click(() => {
    currentCh = (currentCh - 1 < 0) ? urls.length - 1 : currentCh - 1;
    play(currentCh);
  });

  $("img#prev-svg").click(() => {
    currentCh = (currentCh - 1 < 0) ? urls.length - 1 : currentCh - 1;
    play(currentCh);
  });

  $("button#next").click(() => {
    currentCh = (currentCh + 1) % urls.length;
    play(currentCh);
  });

  $("img#next-svg").click(() => {
    currentCh = (currentCh + 1) % urls.length;
    play(currentCh);
  });

  $("div#channels").click(() => {
    $("div#channels").toggleClass('active');
    let chMenu = $("div#ch-menu");
    if (chMenu.hasClass("init") || chMenu.hasClass("slideout")) {
      chMenu.removeClass("init");
      chMenu.removeClass("slideout");
      chMenu.addClass("slidein");
    } else {
      chMenu.removeClass("slidein");
      chMenu.addClass("slideout");
    }
  });
  /*
  $("button#hide-channels").click(() => {
    $("div#chMenu").removeClass("slidein");
    $("div#chMenu").addClass("slideout");
  });
  */
  $("input#volume").on("input", e => {
    player.volume = e.target.value;
  });

  $(player).on({
    play:  () => $("button#play-pause").text("||"),
    pause: () => $("button#play-pause").text("▶︎"),
    ended: () => $("button#play-pause").text("▶︎"),
	});

});
