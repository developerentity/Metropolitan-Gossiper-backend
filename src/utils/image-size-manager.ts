import Jimp from "jimp";

export const imageSizeManager = {
  async contain(buffer: Buffer, width: number, height: number) {
    const image = await Jimp.read(buffer);
    image.contain(1080, 1920);

    return await image.getBufferAsync(Jimp.MIME_PNG);
  },
};
