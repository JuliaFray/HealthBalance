import { IArticle } from '#types/article.interface.js';
import { IUser } from '#types/user.interface.js';

export interface IComment {
  _id?: string;
  userId?: IUser;
  postId?: IArticle;
  text: string;
  rating?: number;
  userRating?: number;
  createdAt?: Date;
}
