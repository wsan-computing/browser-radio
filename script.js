let urls;
let currentCh = 0;
let player = $("audio#player")[0];
let isPlaying = false;

const play = (ch) => {
  player.pause();
  player.src = urls[ch];
  $("span#ch-number").text(ch);
  player.play();
  $("button#play-pause").text("||");
  isPlaying = true;
};

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
      if(urls.length < 1){ 
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

  $("input#volume").change(e => {
    player.volume = e.target.value;
  });
});