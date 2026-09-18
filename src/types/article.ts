import type { IComment } from './comment.js';
import type { IUser } from './user.js';

export type TChipData = {
  _id: string;
  value: string;
  useCount?: number;
};

export interface IImage {
  _id: string;
  files_id?: string;
  data?: any;
  contentType?: string;
}


export interface IArticle {
  _id: string;
  title: string;
  text: string;
  tags: TChipData[];
  imageId?: string;
  image?: IImage;
  userId: IUser;
  viewsCount: number;
  likes: number;
  dateStr: string;
  createdAt: Date;
  comments: IComment[];
  rating: number;
  userRating: number;
}
