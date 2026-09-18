import type { IArticle } from './article.js';
import type { IUser } from './user.js';

export interface IComment {
  _id?: string;
  userId?: IUser;
  postId?: IArticle;
  text: string;
  rating?: number;
  userRating?: number;
  createdAt?: Date;
}
