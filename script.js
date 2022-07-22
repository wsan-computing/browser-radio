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

const addLog = (event, description) => {
  console.log(event);
  console.log(event.originalEvent.isTrusted)
  description = event.originalEvent.isTrusted
            ? description + " trusted."
            : description + " NOT trusted.";
  $("textarea#log").val($("textarea#log").val() + logTime() + " " + description + "\n");
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
    play:  (e) => addLog(e, "player started."),
    pause: (e) => addLog(e, "player paused."),
    ended: (e) => addLog(e, "player ended."),
    error: (e) => addLog(e, "something error occured."),
    abort: (e) => addLog(e, "aborted."),
    stalled: (e) => addLog(e, "stalled."),
    suspend: (e) => addLog(e, "suspended."),
    waiting: (e) => addLog(e, "waiting..."),
    emptied: (e) => addLog(e, "emptied."),
	});
});