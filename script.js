let urls;
let currentCh = 0;
let player = $("audio#player")[0];
let isPlaying = false;

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
      player.src = urls[currentCh];
      $("span#ch-number").text(currentCh);
      player.play();
      $("button#play-pause").text("||");
      isPlaying = true;
    }
  });

  $("button#previous").click(() => {
    currentCh = (currentCh - 1 < 0) ? urls.length - 1 : currentCh - 1;
    player.pause();
    player.src = urls[currentCh];
    $("span#ch-number").text(currentCh);
    player.play();
  });

  $("button#next").click(() => {
    currentCh = (currentCh + 1) % urls.length;
    player.pause();
    player.src = urls[currentCh];
    $("span#ch-number").text(currentCh);
    player.play();
  });

  $("input#volume").change(e => {
    player.volume = e.target.value;
  });
});