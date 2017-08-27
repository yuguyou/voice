const voiceData = {
  src: './audio/WangOu.wav',
  timeList: [
    [0.0, 7.6, ''],
    [7.8, 8.6, 'WangNing'],
    [8.8, 14.2, ''],
    [14.4, 21.4, 'WangNing'],
    [21.6, 23.8, 'OuYangXiaDan'],
    [24.0, 48.4, 'WangNing'],
    [48.6, 49.8, ''],
    [50.0, 53.8, 'OuYangXiaDan'],
    [54.0, 54.8, 'LiZiMeng'],
    [55.0, 69.4, 'XOuYangXiaDan'],
    [69.6, 73.6, 'WangNing'],
    [73.8, 82.8, 'OuYangXiaDan'],
    [83.0, 88.0, 'WangNing'],
    [88.2, 97.4, 'XOuYangXiaDan'],
    [97.6, 100.4, ''],
    [100.6, 117.2, 'WangNing'],
    [117.4, 118.0, ''],
    [118.2, 126.98, 'WangNing'],
  ],
};

/*
audio.onloadedmetadata = "myFunction()" 加载完成时执行
audio.duration 返回当前音频的长度（以秒计）
defaultPlaybackRate 设置或返回音频的默认播放速度
ended 返回音频的播放是否已结束
currentTime 设置或返回音频中的当前播放位置（以秒计）
*/
function VoicePlayer(voiceData) {
  const _s = this;
  this.config = {
    container: document.getElementsByClassName("v-animation")[0],
    timeScale: 1,
  };

  this.animation = {
    width: this.config.container.clientWidth,
    height: this.config.container.clientHeight,
    data: {},
    element: {},
    actions: {},
  };

  this.animation.element.board = document.getElementsByClassName("v-a-board")[0];

  let rId;

  this.voiceInit = () => {
    _s.audio = document.createElement("audio");
    _s.audio.src = voiceData.src;
    _s.audio.onloadedmetadata = () => {
      _s.config.timeScale = _s.audio.duration / _s.animation.width;
      dataResolve();

      const timeList = _s.animation.data.timeList;
      playbarRender(timeList);
      labelsRender(timeList);
    };
  };

  this.animation.actions.start = () => {
    _s.audio.play();
    rId = window.requestAnimationFrame(playbarAnimation);
  };

  this.animation.actions.pause = () => {
    _s.audio.pause();
    window.cancelAnimationFrame(rId);
  };

  function playbarAnimation() {
    const currentTime = _s.audio.currentTime;
    const currentCursorX = currentTime / _s.config.timeScale - 2;
    _s.animation.element.cursor.setAttribute( "x", currentCursorX);
    window.requestAnimationFrame(playbarAnimation);
  }

  function dataResolve() {
    const timeScale = _s.config.timeScale;
    const timeList = voiceData.timeList;
    const newTimeList = [];
    const captionColor = {};
    let line;
    let caption;
    for (let i = 0; i < timeList.length; i++) {
      line = timeList[i];
      caption = line[2];
      if (caption) {
        captionColor[caption] = captionColor[caption] || getRandomColor();
        newTimeList.push({
          caption,
          start: line[0] / timeScale,
          end: line[1] / timeScale,
        });
      }
    }

    _s.animation.data.captionColor = captionColor;
    _s.animation.data.timeList = newTimeList;
  }

  function labelsRender(timeList) {
    const board = _s.board;
    const label = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
    const captionColor = _s.animation.data.captionColor;
    const labels = [];

    let labelIndex = 0;
    timeList.forEach(data => {
      const group = document.createElementNS( "http://www.w3.org/2000/svg", "g" );

      labelIndex = labelIndex + 1;
      const labelHeight = 25;
      const y = 200.5 - ((labelIndex % 5 ) + 2) * (labelHeight + 4);
      const color = captionColor[data.caption];
      const react = createRect({
        x: data.start,
        y: y,
        width: '100px',
        height: `${labelHeight}px`,
        strokeStyle: color,
        fillStyle: 'rgba(255,255,255,0.8)',
        strokeWidth: '1',
      });

      const line = creatLine({
        x1: data.start,
        y1: y,
        x2: data.start,
        y2: 200,
        strokeStyle: color,
        strokeWidth: '1',
      });

      const text = creatText({
        x: data.start + 6,
        y: y + 12,
        fontSize: '12px',
        fillStyle: color,
        textContent: data.caption,
      });

      group.appendChild(line);
      group.appendChild(react);
      group.appendChild(text);
      labels.push(group);
    });

    labels.reverse();
    labels.forEach(l => label.appendChild(l));
    _s.animation.element.board.appendChild(label);
  }

  function playbarRender(timeList) {
    const board = _s.board;
    const playbar = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
    const playbarBackground = createRect({
        x: 0,
        y: 200.5,
        width: _s.animation.width,
        height: '16px',
        strokeStyle: '#cccccc',
        strokeWidth: '1',
        fillStyle: '#cccccc',
      });
      playbar.appendChild(playbarBackground);

    const captionColor = _s.animation.data.captionColor;
    timeList.forEach(data => {
      const color = captionColor[data.caption];
      const line = createRect({
        x: data.start,
        y: 200.5,
        width: data.end - data.start,
        height: '16px',
        strokeStyle: color,
        strokeWidth: '1',
        fillStyle: color,
      });
      playbar.appendChild(line);
    });

    const cursor = createRect({
      x: 0,
      y: 198.5,
      width: '2px',
      height: '20px',
      strokeStyle: '#000000',
      strokeWidth: '1',
      fillStyle: '#000000',
    });
    playbar.appendChild(cursor);

    _s.animation.element.playbar = playbar;
    _s.animation.element.cursor = cursor;
    _s.animation.element.board.appendChild(playbar);
  }


  function createRect(param) {
    const {x, y, width, height, strokeStyle, strokeWidth, fillStyle} = param;
    const rect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );
    rect.setAttribute( "x", x );
    rect.setAttribute( "y", y );
    rect.setAttribute( "width", width );
    rect.setAttribute( "height", height );
    rect.setAttribute( "style", `fill:${fillStyle};stroke-width:${strokeWidth};stroke:${strokeStyle}` );

    return rect;
  }

  function creatLine(param) {
    const {x1, y1, x2, y2, strokeStyle, strokeWidth} = param;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line" );
    line.setAttribute("x1", x1 );
    line.setAttribute("x2", x2 );
    line.setAttribute("y1", y1 );
    line.setAttribute("y2", y2 );
    line.setAttribute("style", `stroke-width:${strokeWidth};stroke:${strokeStyle};z-index:0`);

    return line;
  }

  function creatText(param) {
    const {x, y, fontSize, fillStyle, textContent} = param;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text" );
    text.setAttribute('x', x);
    text.setAttribute("y", y);
    text.setAttribute('dy', '.3em');
    text.setAttribute("font-size", fontSize);
    text.setAttribute( "style", `fill: ${fillStyle}`);
    text.innerHTML = textContent;

    return text;
  }

  //随机生成颜色
  function getRandomColor() {
    return `#${('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6)}`;
  }
}


const voice = new VoicePlayer(voiceData);
voice.voiceInit();
window.voiceAction = voice.animation.actions;
