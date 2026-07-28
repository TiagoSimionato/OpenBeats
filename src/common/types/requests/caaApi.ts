type CoverImage = {
  front?: boolean;
  image: string;
  thumbnails: {
    1200: string;
    250: string;
    500: string;
    large?: string;
    small?: string;
  };
};

export type CoverResponse = {
  images?: CoverImage[];
};
