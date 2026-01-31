export class WebPConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebPConversionError";
  }
}

export const convertToWebP = (
  file: File,
  quality: number = 0.8,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/webp") return resolve(file);

    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target?.result as string;
    };
    image.onload = () => {
      // Canvas 생성
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      // Canvas에 이미지 그리기
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new WebPConversionError("Canvas 생성 실패"));
      ctx.drawImage(image, 0, 0);

      // WebP로 변환 및 압축
      canvas.toBlob(
        (blob) => {
          if (blob && blob.type === "image/webp")
            resolve(new File([blob], "image.webp", { type: "image/webp" }));
          else reject(new WebPConversionError("WebP 변환 실패"));
        },
        "image/webp",
        quality,
      );
    };

    image.onerror = () => reject(new WebPConversionError("이미지 로드 실패"));
    reader.onerror = () => reject(new WebPConversionError("파일 읽기 실패"));
    reader.readAsDataURL(file);
  });
};
