import { parseScreenshotText } from './screenshotParser.js';

let workerPromise = null;

const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('nld', 1, {
        logger: () => {},
      });
      return worker;
    })();
  }
  return workerPromise;
};

const preprocessImage = (file, maxWidth = 1200) => new Promise((resolve, reject) => {
  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    URL.revokeObjectURL(url);
    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to preprocess image'));
      },
      'image/png',
      0.92
    );
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Failed to load image'));
  };

  img.src = url;
});

export const recognizeSwimScreenshot = async (file, onProgress) => {
  const worker = await getWorker();
  const blob = await preprocessImage(file);

  const { data: { text } } = await worker.recognize(blob, {
    rotateAuto: true,
  }, {
    text: true,
    blocks: false,
    hocr: false,
    tsv: false,
  });

  if (onProgress) onProgress(100);

  const parsed = parseScreenshotText(text);
  return {
    ocrText: text,
    ...parsed,
  };
};

export const terminateOcrWorker = async () => {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
};
