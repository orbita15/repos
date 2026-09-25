// sources.js — список источников для плеера rutup.html

const sources = [

  // ============================================
  // 20 видео Rutube (iframe)
  // ============================================
  { type: "iframe", url: "https://rutube.ru/play/embed/caafe83ff1c6ed38d394635b83ece578/", name: "Rutube: пример 1" },
  { type: "iframe", url: "https://rutube.ru/play/embed/7716bd3e665725c3c008ae7ab4ff02e2/", name: "Rutube: пример 2" },
  { type: "iframe", url: "https://rutube.ru/play/embed/9345f034c87f70acf921f5f22a7506ac/", name: "Rutube: пример 3" },
  { type: "iframe", url: "https://rutube.ru/play/embed/2fbeeb29d70119c30125d74ba0adcfe6/", name: "Rutube: пример 4" },
  { type: "iframe", url: "https://rutube.ru/play/embed/2bc3a7c159051e7629ffa0ab0a7155a6/", name: "Rutube: пример 5" },
  { type: "iframe", url: "https://rutube.ru/play/embed/34e8e458ca8b90c915d78f9881330596/", name: "Rutube: пример 6" },
  { type: "iframe", url: "https://rutube.ru/play/embed/515553734eeeab1f959bdaf0d3700ff2/", name: "Rutube: пример 7" },
  { type: "iframe", url: "https://rutube.ru/play/embed/858edaebb31e5a9346abf81f32efc758/", name: "Rutube: пример 8" },
  { type: "iframe", url: "https://rutube.ru/play/embed/11efd0115551fdd293c31ee691dxxx2e/", name: "Rutube: пример 9" },
  { type: "iframe", url: "https://rutube.ru/play/embed/babf94efe741b7e3e9a352675693046a/", name: "Rutube: пример 10" },
  { type: "iframe", url: "https://rutube.ru/play/embed/0d2a0afb5972b5ba85153346040acc19/", name: "Rutube: пример 11" },
  { type: "iframe", url: "https://rutube.ru/play/embed/dd5387660356c4f6b1ff1208d33a5f2e/", name: "Rutube: пример 12" },
  { type: "iframe", url: "https://rutube.ru/play/embed/515553734eeeab1f959bdaf0d3700ff2/", name: "Rutube: пример 13" },
  { type: "iframe", url: "https://rutube.ru/play/embed/caafe83ff1c6ed38d394635b83ece578/?p=IBgzQQrKH4qB1bqm_91x7Q", name: "Rutube: пример 14" },
  { type: "iframe", url: "https://rutube.ru/play/embed/7716bd3e665725c3c008ae7ab4ff02e2/?getPlayOptions=pg_rating,is_adult&skinColor=7cb342&t=6040", name: "Rutube: пример 15" },
  { type: "iframe", url: "https://rutube.ru/play/embed/9345f034c87f70acf921f5f22a7506ac/", name: "Rutube: пример 16" },
  { type: "iframe", url: "https://rutube.ru/play/embed/2fbeeb29d70119c30125d74ba0adcfe6/", name: "Rutube: пример 17" },
  { type: "iframe", url: "https://rutube.ru/play/embed/2bc3a7c159051e7629ffa0ab0a7155a6/", name: "Rutube: пример 18" },
  { type: "iframe", url: "https://rutube.ru/play/embed/34e8e458ca8b90c915d78f9881330596/", name: "Rutube: пример 19" },
  { type: "iframe", url: "https://rutube.ru/play/embed/858edaebb31e5a9346abf81f32efc758/", name: "Rutube: пример 20" },

  // ============================================
  // 20 китайских каналов (HLS / m3u8)
  // ============================================
  { type: "hls", url: "http://182.140.125.47:808/hls/1/index.m3u8", name: "CCTV-1 综合" },
  { type: "hls", url: "http://74.91.26.218:82/live/cctv1hd.m3u8", name: "CCTV-1 (720p)" },
  { type: "hls", url: "http://74.91.26.218:82/live/cctv2hd.m3u8", name: "CCTV-2 财经" },
  { type: "hls", url: "http://121.24.98.226:8090/hls/9/index.m3u8", name: "CCTV-1 综合 (江苏源)" },
  { type: "hls", url: "http://121.24.98.226:8090/hls/38/index.m3u8", name: "江苏卫视" },
  { type: "hls", url: "https://0472.org/hls/cgtn.m3u8", name: "CGTN 英语" },
  { type: "hls", url: "https://0472.org/hls/cgtnd.m3u8", name: "CGTN 纪录" },
  { type: "hls", url: "https://0472.org/hls/cgtnx.m3u8", name: "CGTN 西语" },
  { type: "hls", url: "https://0472.org/hls/cgtnf.m3u8", name: "CGTN 法语" },
  { type: "hls", url: "https://0472.org/hls/cgtna.m3u8", name: "CGTN 阿语" },
  { type: "hls", url: "https://0472.org/hls/cgtne.m3u8", name: "CGTN 俄语" },
  { type: "hls", url: "https://global.cgtn.cicc.media.caton.cloud/master/cgtn-espanol.m3u8", name: "CGTN Español" },
  { type: "hls", url: "https://amg01314-cgtn-amg01314c2-rakuten-us-1319.playouts.now.amagi.tv/cgtn-fr-rakuten/playlist.m3u8", name: "CGTN Français" },
  { type: "hls", url: "https://english-livetx.cgtn.com/hls/yypdjlctzb_hd.m3u8", name: "CGTN Documentary" },
  { type: "hls", url: "https://live.funhillrm.com/5/sd/live.m3u8", name: "北京新闻" },
  { type: "hls", url: "https://stream.hrbtv.net/shpd/sd/live.m3u8", name: "哈尔滨生活" },
  { type: "hls", url: "https://stream.hrbtv.net/xwzh/sd/live.m3u8", name: "哈尔滨新闻综合" },
  { type: "hls", url: "http://61.244.22.5/ch3/ch3.live/chunklist_w1228316132.m3u8", name: "澳门卫视" },
  { type: "hls", url: "http://38.64.72.148/hls/modn/list/2015/chunklist0.m3u8", name: "东森新闻美洲台" },
  { type: "hls", url: "http://38.64.72.148/hls/modn/list/4013/playlist.m3u8", name: "台视新闻" },
];