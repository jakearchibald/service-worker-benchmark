{
  const loadImg = function loadImg(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(Error('Image load failed'));
      img.src = url;
    });
  };

  const canvasToBlob = function canvasToBlob(canvas, ...args) {
    return new Promise(r => canvas.toBlob(r, ...args));
  }

  const tileSize = 40;
  const width = 20;
  const height = 15;

  const fullWidth = tileSize * width;
  const fullHeight = tileSize * height;

  const output = document.querySelector('.output');
  output.style.width = `${fullWidth}px`;

  // TODO: replace this with live URL
  loadImg('cat.jpg').then(img => {
    let sourceTileSize;

    if (fullWidth / fullHeight > img.width / img.height) {
      sourceTileSize = img.width / fullWidth * tileSize;
    }
    else {
      sourceTileSize = img.height / fullHeight * tileSize;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const canvas = document.createElement('canvas');
        canvas.width = tileSize;
        canvas.height = tileSize;
        canvas.getContext('2d').drawImage(img, x * sourceTileSize, y * sourceTileSize, sourceTileSize, sourceTileSize, 0, 0, tileSize, tileSize);
        output.appendChild(canvas);
      }
    }

    document.querySelector('.save').addEventListener('click', () => {
      const zip = new JSZip();
      Promise.all(
        [...output.querySelectorAll('canvas')].map((canvas, i) => {
          return canvasToBlob(canvas).then(blob => zip.file(`${i}.png`, blob, {binary: true}));
        })
      ).then(() => zip.generateAsync({type: 'blob'})).then(blob => {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.download = 'images.zip';
        a.href = URL.createObjectURL(blob);
        a.click();
        document.body.removeChild(a);
      });
    });
  });

  document.querySelector('.base64').addEventListener('click', () => {
    const obj = {};

    Promise.all(
      Array(width * height).fill('').map((_, i) =>
        fetch(`../public/images/${i}.png`).then(r => r.blob()).then(blob => {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(blob); 
            reader.onloadend = () => resolve(reader.result);
          });
        })
      )
    ).then(strings => {
      for (const [i, str] of strings.entries()) {
        obj[`${i}.png`] = str;
      }

      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(obj, null, '  ');
      document.body.appendChild(pre);
    });
  });
}