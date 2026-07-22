import imagemin from 'imagemin';
import webp from 'imagemin-webp';

const [inputPath, outputDir] = process.argv.slice(-2);

await imagemin([inputPath], {
  destination: outputDir,
  plugins: [webp({ resize: { height: 250, width: 250 } })],
});
