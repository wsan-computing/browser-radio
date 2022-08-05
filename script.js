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
  $("li.manifest-item").removeClass("selected");
  $(`li#${currentCh}ch`).addClass("selected");

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
      $("li.manifest-item").remove();
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
        let li = $('<li>', {
          id: `${i}ch`,
          class: 'manifest-item',
          onclick: `play(${i})`,
          text: `${i}ch ${url}`
        });
        $("ul#manifests").append(li);
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

  $("button#next").click(() => {
    currentCh = (currentCh + 1) % urls.length;
    play(currentCh);
  });

  $("button#channels").click(() => {
    let manifests = $("div#manifests");
    manifests.removeClass("init");
    manifests.removeClass("slideout");
    manifests.addClass("slidein");
    /*
    if ($("div#manifests").css("display") == "none") {
      $("div#manifests").show();
    } else {
      $("div#manifests").hide();
    }
    */
  });

  $("button#hide-channels").click(() => {
    $("div#manifests").removeClass("slidein");
    $("div#manifests").addClass("slideout");
    //$("div#manifests").hide();
  });

  $("input#volume").on("input", e => {
    player.volume = e.target.value;
  });

  $(player).on({
    play:  () => $("button#play-pause").text("||"),
    pause: () => $("button#play-pause").text("▶︎"),
    ended: () => $("button#play-pause").text("▶︎"),
	});

  //$("div#manifests").hide();
});
