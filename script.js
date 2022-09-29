let channels = {};
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

  let isHLSPlaylist = channels[ch].split('.').pop().startsWith('m3u');
	if (isHLSPlaylist && !player.canPlayType('application/vnd.apple.mpegurl')) {
		if (Hls.isSupported()) {
			hls = new Hls();
			hls.loadSource(channels[ch]);
			hls.attachMedia(player);
		} else {
			alert("Hls.js is not supported.");
		}
	} else {
			player.src = channels[ch];
	}
  $("span#ch-number").text(ch);
  player.play();
  isPlaying = true;
  localStorage.setItem('browser-radio-current-ch', ch);
};

$(() => {
  if (storageAvailable('localStorage')) {
    console.log('localStorage is available.');

    let ch = localStorage.getItem('browser-radio-current-ch');
    let volume = localStorage.getItem('browser-radio-volume');

    currentCh = (ch == null) ? 0 : parseInt(ch, 10);
    if(ch != null) $("span#ch-number").text(ch);
    player.volume = (volume == null) ? 1 : volume;
    $("input#volume").val(player.volume);

    try {
      let channelsJsonString = localStorage.getItem('browser-radio-channels');
      if (!channelsJsonString) throw 'ChannelsYetDefinedError';
      channels = JSON.parse(localStorage.getItem('browser-radio-channels'));
      Object.keys(channels).forEach(i => {
        let item = $('<div>', {
          id: `${i}ch`,
          class: 'manifest-item',
          onclick: `play(${i})`,
          text: `${i}ch ${channels[i]}`
        });
        $("div#manifests").append(item);
      });
    } catch (e) {
      if (e == 'ChannelsYetDefinedError') {
        console.log("No channels registered yet.");
      } else {
        console.log(e);
        console.log("An error occured during JSON parsing.");
      }
    }
  } else {
    console.log('localStorage is unavailable.');
  }

  $("input#input-manifest").change(e => {
    if (Object.keys(channels).length) {
      localStorage.removeItem('browser-radio-current-ch');
      localStorage.removeItem('browser-radio-channels')
      $("div.manifest-item").remove();
      currentCh = 0;
      channels = {};
      $("span#ch-number").text(currentCh);
    }
    $("button#previous").prop('disabled', false);
    $("button#next").prop('disabled', false);

    let data = $(e.target).prop("files")[0];
    let reader = new FileReader();
		reader.readAsText(data);
		reader.onload = () => {
      let urls = reader.result
                  .replace(/\r/g, '')
                  .split(/\n/g)
                  .filter((val) => {return val.length > 0 && val[0] != '#';});  // 空行とコメント(#から始まる)を削除
      for (let i = 0; i < urls.length; i++) {
        let url = channels[i] = urls[i];
        let item = $('<div>', {
          id: `${i}ch`,
          class: 'manifest-item',
          onclick: `play(${i})`,
          text: `${i}ch ${url}`
        });
        $("div#manifests").append(item);
      }
      localStorage.setItem('browser-radio-channels', JSON.stringify(channels));
    }
  });

  $("button#play-pause").click(() => {
    if(isPlaying) {
      player.pause();
      isPlaying = false;
    } else {
      if(Object.keys(channels).length < 1){
        alert("no manifest");
        return;
      }
      play(currentCh);
    }
  });

  $("button#previous").click(() => {
    currentCh = (currentCh - 1 < 0) ? Object.keys(channels).length - 1 : currentCh - 1;
    play(currentCh);
  });

  $("button#next").click(() => {
    currentCh = (currentCh + 1) % Object.keys(channels).length;
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
    localStorage.setItem('browser-radio-volume', e.target.value);
  });

  $(player).on({
    play:  () => $("button#play-pause").text("||"),
    pause: () => $("button#play-pause").text("▶︎"),
    ended: () => $("button#play-pause").text("▶︎"),
	});

  if (Object.keys(channels).length <= 0) {
    $("button#previous").prop('disabled', true);
    $("button#next").prop('disabled', true);
  }
});
