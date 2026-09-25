// sources.js — список источников для плеера rutup.html

const sources = [

  // ============================================
  // Российские каналы (HLS)
  // ============================================
  { type: "hls", url: "http://tvchannelstream1.tvzvezda.ru/cdn/tvzvezda/playlist_hdhigh.m3u8", name: "Звезда HD" },
  { type: "hls", url: "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia24-hd/index.m3u8", name: "Россия 24 HD" },

  // ============================================
  // 30 японских каналов (HLS / m3u8)
  // ============================================

  // --- Токио (эфирные) ---
  { type: "hls", url: "http://tsb-mega.i9.ee/stream/nhkg_avc_1080p|user-agent=VLC", name: "NHK G (総合)" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd02.m3u8?token=guoziyun&gid=hdgd02&channel=zhongying|user-agent=VLC", name: "NHK E (教育)" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd03.m3u8?token=guoziyun&gid=hdgd03&channel=zhongying|user-agent=VLC", name: "NTV (日本テレビ)" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd06.m3u8?token=guoziyun&gid=hdgd06&channel=zhongying|user-agent=VLC", name: "TV Asahi (テレビ朝日)" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd04.m3u8?token=guoziyun&gid=hdgd04&channel=zhongying|user-agent=VLC", name: "TBS" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd05.m3u8?token=guoziyun&gid=hdgd05&channel=zhongying|user-agent=VLC", name: "Fuji TV (フジテレビ)" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd07.m3u8?token=guoziyun&gid=hdgd07&channel=zhongying|user-agent=VLC", name: "TV Tokyo (テレビ東京)" },
  { type: "hls", url: "http://58.82.168.138:5002/hdgd08.m3u8?token=guoziyun&gid=hdgd08&channel=zhongying|user-agent=VLC", name: "TOKYO MX1" },

  // --- Кансай (эфирные) ---
  { type: "hls", url: "https://nl.utako.moe/Tokyo_MX2/index.m3u8", name: "TOKYO MX2" },
  { type: "hls", url: "https://nl.utako.moe/TBS/index.m3u8", name: "TBS (utako)" },
  { type: "hls", url: "https://nl.utako.moe/TV_Tokyo/index.m3u8", name: "TV Tokyo (utako)" },
  { type: "hls", url: "https://fujitv4.mov3.co/hls/fujitv.m3u8", name: "Fuji TV (mov3)" },
  { type: "hls", url: "https://ntv5.mov3.co/hls/ntv.m3u8", name: "Nippon TV (mov3)" },
  { type: "hls", url: "https://akariko.netgenx.site/stream/jp/tv_tokyo/stream-output.m3u8?mode=hls", name: "TV Tokyo (netgenx)" },
  { type: "hls", url: "https://akariko.netgenx.site/stream/jp/fuji_tv/stream-output.m3u8?mode=hls", name: "Fuji TV (netgenx)" },

  // --- NHK World / международные ---
  { type: "hls", url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index_4M.m3u8", name: "NHK World Japan" },
  { type: "hls", url: "https://masterpl.hls.nhkworld.jp/hls/w/live/smarttv.m3u8", name: "NHK World Japan (smart)" },
  { type: "hls", url: "https://media-tyo.hls.nhkworld.jp/hls/w/live/master.m3u8", name: "NHK World Japan (720p)" },
  { type: "hls", url: "https://cdn.nhkworld.jp/www11/nhkworld-tv/pre/hlscomp.m3u8", name: "NHK World Premium" },
  { type: "hls", url: "https://newssimul-stream.nhk.jp/hls/live/2010561/nhknewssimul/master.m3u8", name: "NHK Kishou Saigai" },

  // --- BS (спутниковые) ---
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=bs11", name: "NHK BS" },
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=bs04", name: "BS TBS" },
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=bs03", name: "BS Asahi" },
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=bs05", name: "BS Fuji" },
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=bs07", name: "BS TV Tokyo" },
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=bs02", name: "BS NTV" },

  // --- CS / тематические ---
  { type: "hls", url: "http://202.60.106.14:8080/1335/playlist.m3u8", name: "Golf Network" },
  { type: "hls", url: "https://d2p4mrcwl6ly4.cloudfront.net/out/v1/8d50f69fdbbf411a8d302743e4263716/CGNWebLiveJP.m3u8", name: "CGNTV Japan" },
  { type: "hls", url: "https://tbs5.mov3.co/hls/tbs.m3u8", name: "TBS (mov3)" },
  { type: "hls", url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=gd02", name: "JOAB-DTV (NHK E альт.)" },

];