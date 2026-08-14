import { IComment } from '#types/comment.interface.js';
import { IUser } from '#types/user.interface.js';

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
