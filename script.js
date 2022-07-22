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
  $("button#play-pause").text("||");
  isPlaying = true;
};

const logTime = () => {
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
  let ms = now.getMilliseconds();
  return h + ':' + m + ':' + s + '.' + ms;
}

$(() => {
  $("input#input-manifest").change(e => {
    let data = $(e.target).prop("files")[0];

    let reader = new FileReader();
		reader.readAsText(data);
		reader.onload = function (){
      urls = reader.result
                  .replace(/\r/g, '')
                  .split(/\n/g)
									.filter((val) => {return val.length > 0 && val[0] != '#';});  // 空行とコメント(#から始まる)を削除
    }
  });

  $("button#play-pause").click(() => {
    if(isPlaying) {
      $("button#play-pause").text("▶︎");
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

  $("input#volume").on("input", e => {
    player.volume = e.target.value;
  });

  $(player).on({
    play: () =>  $("textarea#log").val($("textarea#log").val() + logTime() + " player started.\n"),
    pause: () => $("textarea#log").val($("textarea#log").val() + logTime() + " player paused.\n"),
    ended: () => $("textarea#log").val($("textarea#log").val() + logTime() + " player ended.\n"),
    error: () => $("textarea#log").val($("textarea#log").val() + logTime() + " something error occured.\n"),
    abort: () => $("textarea#log").val($("textarea#log").val() + logTime() + " aborted.\n"),
    stalled: () => $("textarea#log").val($("textarea#log").val() + logTime() + " stalled.\n"),
    suspend: () => $("textarea#log").val($("textarea#log").val() + logTime() + " suspended.\n"),
    waiting: () => $("textarea#log").val($("textarea#log").val() + logTime() + " waiting...\n"),
    emptied: () => $("textarea#log").val($("textarea#log").val() + logTime() + " emptied.\n"),
	});
});