// sources.js — только российские каналы

const sources = [

  // ============================================
  // Федеральные каналы (HLS)
  // ============================================
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_1TVSD/variant.m3u8", name: "Первый канал" },
  { type: "hls", url: "https://serv30.vintera.tv/restream/1_old/playlist.m3u8", name: "Первый канал (2)" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_RUSSIA1/variant.m3u8", name: "Россия 1" },
  { type: "hls", url: "https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8", name: "Россия 1 HD" },
  { type: "hls", url: "https://stream8.cinerama.uz/1020/index.m3u8", name: "Россия 1 (2)" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_RUSSIA24/variant.m3u8", name: "Россия 24" },
  { type: "hls", url: "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia24-hd/index.m3u8", name: "Россия 24 HD" },
  { type: "hls", url: "https://stream8.cinerama.uz/1021/index.m3u8", name: "Россия 24 (2)" },
  { type: "hls", url: "http://77.232.131.211/Rossiya24/index.m3u8", name: "Россия 24 (3)" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_RUSSIAK/variant.m3u8", name: "Россия К (Культура)" },
  { type: "hls", url: "https://stream8.cinerama.uz/1048/index.m3u8", name: "Россия К (2)" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_NTV/variant.m3u8", name: "НТВ" },
  { type: "hls", url: "https://cdn.ntv.ru/ntv-msk_hd/index.m3u8", name: "НТВ HD" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_5TV/variant.m3u8", name: "Пятый канал" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_MATCHTV/variant.m3u8", name: "Матч ТВ" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_KARUSEL/variant.m3u8", name: "Карусель" },
  { type: "hls", url: "https://stream8.cinerama.uz/1034/index.m3u8", name: "Карусель (2)" },
  { type: "hls", url: "https://zabava-htlive.cdn.ngenix.net/hls/CH_OTR/variant.m3u8", name: "ОТР" },
  { type: "hls", url: "https://flussonic.mkpnet.ru/tv-22ed9087cd194d2b/video.m3u8", name: "ОТР (2)" },

  // ============================================
  // Другие федеральные и тематические
  // ============================================
  { type: "hls", url: "https://tvchannelstream1.tvzvezda.ru/cdn/tvzvezda/playlist_hdhigh.m3u8", name: "Звезда HD" },
  { type: "hls", url: "https://tvchannelstream1.tvzvezda.ru/cdn/tvzvezda/playlist_hdlow.m3u8", name: "Звезда SD" },
  { type: "hls", url: "https://hls-igi.cdnvideo.ru/igi/igi_hq/playlist.m3u8", name: "Известия" },
  { type: "hls", url: "https://hls-igi.cdnvideo.ru/igi/igi_sq/playlist.m3u8", name: "Известия (720p)" },
  { type: "hls", url: "https://live-ratnik.cdnvideo.ru/ratnik/ratnik.sdp/playlist.m3u8", name: "Ратник" },
  { type: "hls", url: "https://live.prd.dlive.tv/hls/live/viva-russia.m3u8", name: "VIVA Russia" },
  { type: "hls", url: "http://uiptv.do.am/1ufc/118056781/playlist.m3u8", name: "Вместе-РФ HD" },

  // ============================================
  // Региональные каналы
  // ============================================
  { type: "hls", url: "https://sitv.ru/hls/stv.m3u8", name: "С1 (Сургут)" },
  { type: "hls", url: "https://sitv.ru/hls/stv1024.m3u8", name: "С1 (Сургут) 1024" },
  { type: "hls", url: "https://sitv.ru/hls/s861024.m3u8", name: "Телеканал 86 (Сургут)" },
  { type: "hls", url: "http://www.gtk.tv/hls/gtyar.m3u8", name: "Городской телеканал (Ярославль)" },
  { type: "hls", url: "http://live.guberniatv.cdnvideo.ru/guberniatv/guberniatv.sdp/playlist.m3u8", name: "Губерния (Самара)" },
  { type: "hls", url: "https://live-trc33.cdnvideo.ru/trc33/trc33.sdp/playlist.m3u8", name: "Губерния 33 (Владимир)" },
  { type: "hls", url: "https://dagestan.mediacdn.ru/cdn/dagestan/playlist.m3u8", name: "Дагестан" },
  { type: "hls", url: "http://infochhdcdn.trkeurasia.ru/orsk-infochhd/infochhd/playlist.m3u8", name: "Евразия (Орск)" },
  { type: "hls", url: "http://hls-eniseytv.cdnvideo.ru/eniseytv/stream1/playlist.m3u8", name: "Енисей" },
  { type: "hls", url: "http://serv25.vintera.tv:8081/test/k16/playlist.m3u8", name: "К16 (Саров)" },
  { type: "hls", url: "https://live.katun24.ru:8082/katun/katun/index.m3u8", name: "Катунь 24 (Барнаул)" },
  { type: "hls", url: "http://146.158.0.56:80/8kanal/index.m3u8", name: "8 канал" },
  { type: "hls", url: "http://194.190.78.91/pskov/rewind-10800.m3u8", name: "Первый Псковский" },
  { type: "hls", url: "http://5.164.24.83/tula/1tv_low/index.m3u8", name: "Первый Тульский" },
  { type: "hls", url: "http://video.govoritmoskva.ru:8080/live/rufmbk-1/index.m3u8", name: "Радио Говорит Москва" },
  { type: "hls", url: "https://pilotfm.ru/cam/hls/pilothd.m3u8", name: "Радио Пилот" },
  { type: "hls", url: "http://chanson-video.hostingradio.ru:8080/hls/chansonabr/live.m3u8", name: "Радио Шансон" },

  // ============================================
  // Rutube (iframe)
  // ============================================
  { type: "iframe", url: "https://rutube.ru/play/embed/caafe83ff1c6ed38d394635b83ece578/", name: "Rutube: пример 1" },
  { type: "iframe", url: "https://rutube.ru/play/embed/7716bd3e665725c3c008ae7ab4ff02e2/", name: "Rutube: пример 2" },
  { type: "iframe", url: "https://rutube.ru/play/embed/9345f034c87f70acf921f5f22a7506ac/", name: "Rutube: пример 3" },

];