// ============================================================
// sources.js — список каналов
// ============================================================

const sources = [
    // === 🎬 RUTUBE ===
    { type: 'iframe', url: 'https://rutube.ru/play/embed/20872670', name: 'Rutube: пример 1' },
    { type: 'iframe', url: 'https://rutube.ru/play/embed/0e69b45e4ee399c38af30d6be2f87ab5', name: 'Rutube: пример 2' },
    { type: 'iframe', url: 'https://rutube.ru/play/embed/90a62a421a55411f711b694a163d4356', name: 'Rutube: пример 3' },
    { type: 'iframe', url: 'https://rutube.ru/play/embed/e8cf2d8185ef0995e8beb8109bed95db', name: 'Rutube: пример 4' },
    { type: 'iframe', url: 'https://rutube.ru/play/embed/7163336', name: 'Rutube: пример 5' },
    { type: 'iframe', url: 'https://rutube.ru/play/embed/104215', name: 'Rutube: пример 6' },

    // === 🇷🇺 РОССИЙСКИЕ (HTTPS HLS) ===
    { type: 'hls', url: 'https://zabava-htlive.cdn.ngenix.net/hls/CH_RUSSIA24/variant.m3u8', name: 'Россия 24' },
    { type: 'hls', url: 'https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia24-hd/index.m3u8', name: 'Россия 24 HD' },
    { type: 'hls', url: 'https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia1-hd/index.m3u8', name: 'Россия 1 HD' },
    { type: 'hls', url: 'https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/kultura-hd/index.m3u8', name: 'Россия Культура' },
    { type: 'hls', url: 'https://tvchannelstream1.tvzvezda.ru/cdn/tvzvezda/playlist_hdhigh.m3u8', name: 'Звезда' },
    { type: 'hls', url: 'https://stream.smotrim.ru/hls/karusel/playlist_3.m3u8', name: 'Карусель' },
    { type: 'hls', url: 'https://bl.uma.media/live/317850/HLS/4614144_3/2/1/playlist.m3u8', name: 'ТНТ' },
    { type: 'hls', url: 'https://live-vestinn.cdnvideo.ru/vestinn/vestinn/playlist.m3u8', name: 'Россия 24 (Н.Новгород)' },

    // === 🌍 МЕЖДУНАРОДНЫЕ ===
    { type: 'hls', url: 'https://rt-glb.rttv.com/dvr/rtnews/playlist.m3u8', name: 'RT News' },
    { type: 'hls', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8', name: 'NASA TV' },
    { type: 'hls', url: 'https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8', name: 'Bloomberg TV' },
    { type: 'hls', url: 'https://tv.balkanweb.com/news24/livestream/playlist.m3u8', name: 'News 24 (Albania)' },
    { type: 'hls', url: 'https://ireplay.tv/test/blender.m3u8', name: 'Blender Open Movies 24/7' },
    { type: 'hls', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', name: 'Big Buck Bunny 4K' },
    { type: 'hls', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', name: 'Tears of Steel 4K' },
    { type: 'hls', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', name: 'Sintel (Akamai)' },
    { type: 'hls', url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', name: 'Akamai Live Test' },
    { type: 'hls', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8', name: 'Apple HEVC Example' }
];