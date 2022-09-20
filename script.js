let urls = [];
let currentCh;
let player = $("audio#player")[0];
let isPlaying = false;
let hls = null;

// https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
const  storageAvailable = (type) => {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

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
  localStorage.setItem('ch', ch);
};

$(() => {
  if (storageAvailable('localStorage')) {
    console.log('localStorage is available.');

    let ch = localStorage.getItem('ch');
    let volume = localStorage.getItem('volume');

    currentCh = (ch == null) ? 0 : ch;
    if(ch != null) $("span#ch-number").text(ch);
    player.volume = (volume == null) ? 1 : volume;
    $("input#volume").val(player.volume);
    
    let i = 0;
    if (localStorage.getItem(0) != null) {
      urls = [];
      do {
        let url = localStorage.getItem(i);
        let item = $('<div>', {
          id: `${i}ch`,
          class: 'manifest-item',
          onclick: `play(${i})`,
          text: `${i}ch ${url}`
        });
        $("div#manifests").append(item);
        urls[i] = url;
        i++;
      } while (localStorage.getItem(i) != null);
    }
  } else {
    console.log('localStorage is unavailable.');
  }

  $("input#input-manifest").change(e => {
    if (urls != undefined) {
      localStorage.clear();
      $("div.manifest-item").remove();
    }
    $("button#previous").prop('disabled', false);
    $("button#next").prop('disabled', false);

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
        localStorage.setItem(i, url);
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

  $("button#next").click(() => {
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
    localStorage.setItem('volume', e.target.value);
  });

  $(player).on({
    play:  () => $("button#play-pause").text("||"),
    pause: () => $("button#play-pause").text("▶︎"),
    ended: () => $("button#play-pause").text("▶︎"),
	});

  if(urls.length <= 0) {
    $("button#previous").prop('disabled', true);
    $("button#next").prop('disabled', true);
  }
});
