declare module 'utif' {
  const UTIF: {
    decode(buffer: ArrayBuffer): any[];
    decodeImage(buffer: ArrayBuffer, image: any, images: any[]): void;
    toRGBA8(image: any): Uint8Array;
  };
  export default UTIF;
}
