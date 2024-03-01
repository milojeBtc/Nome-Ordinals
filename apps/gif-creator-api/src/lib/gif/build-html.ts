import { minify } from "html-minifier";

export const buildGifHTML = <
    ordinalImageData extends {
        duration: number;
        tx_id: string;
        ordinal_index: number;
    },
>(
    title: string,
    files: ordinalImageData[],
) => {
    const firstImage = `${files[0].tx_id}i${files[0].ordinal_index}`;
    const imagesList = JSON.stringify(
        files.map((f) => ({
            id: `"${f.tx_id}i${f.ordinal_index}"`,
            time: f.duration,
        })),
    );

    return minify(
        `
<html>
<head>
    <title>${title}</title>
</head>
<body>
    <img id="gif" style="width:100%;" src="/content/${firstImage}" />
    <script src="/content/f6ed1320befc0932761caad4e7f457e52a9af5e182af105933663fac5fa6c385i0"></script>
    <script>
        let ou = URL.createObjectURL
        function mb(src) {
            return new Promise((res) => {
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                let base_image = new Image();
                base_image.crossOrigin = "Anonymous";
                base_image.src = src;
                base_image.onload = () => {
                    let {width, height} = base_image;
                    canvas.width = width;
                    canvas.height = height
                    context.drawImage(base_image,0,0, width, height, 0, 0, width, height);
                    res(canvas);
                }
            });
        }
        
        fetch("/content/31092f07be03ab4a2e9a663dfdfd22742476508332ec0ae8dd30dc44d6ccc410i0")
            .then(res => res.blob())
            .then(async blob => {
                let images = ${imagesList},
                gif = new GIF({
                    workerScript: ou(blob),
                });
                
                for (let image of images) {
                    gif.addFrame(await mb("/content/" + image.id), {
                        delay: image.time
                    });
                }
                gif.on('finished', (blob) => {
                    document.querySelector("#gif").src = ou(blob);
                }).render();
            });
    </script>
</body>
</html>
`,
        {
            minifyCSS: true,
            minifyJS: true,
            preserveLineBreaks: false,
            collapseWhitespace: true,
        },
    );
};
