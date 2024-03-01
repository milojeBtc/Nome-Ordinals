import GIF from "gif.js";

async function makeImageElement(image: File): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const imageInstance = new Image();
    imageInstance.src = URL.createObjectURL(image);
    imageInstance.onload = () => {
      resolve(imageInstance);
    };
  });
}
async function makeImageCanvas({
  image,
}: {
  image: HTMLImageElement;
  maxWidth?: number;
  maxHeight?: number;
}): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, width, height, 0, 0, width, height);
    URL.revokeObjectURL(image.src);
    resolve(canvas);
  });
}

export function buildGif({
  frames,
  onProgress,
}: {
  frames: Array<{
    imageFile: File;
    duration: number;
  }>;
  onProgress: (progress: number) => void;
}): Promise<Blob> {
  return new Promise(async (resolve) => {
    const imagesList = await Promise.all(
      frames.map(({ imageFile }) => makeImageElement(imageFile))
    );

    const largestHeight = Math.max(...imagesList.map((image) => image.height));

    const largestWidth = Math.max(...imagesList.map((image) => image.width));

    const canvasList = await Promise.all(
      imagesList.map((image) =>
        makeImageCanvas({
          image,
          maxWidth: largestWidth,
          maxHeight: largestHeight,
        })
      )
    );

    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: `${
        import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL
      }/gif.worker.js`,
      // width: largestWidth,
      // height: largestHeight,
    });

    frames.forEach((frame, index) => {
      gif.addFrame(canvasList[index], { delay: frame.duration * 1000 });
    });
    gif.on("progress", onProgress).on("finished", resolve).render();
  });
}
