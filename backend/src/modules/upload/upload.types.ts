export type UploadedArtworkFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type UploadedArtworkImage = {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  size: number;
  bucket: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
};
