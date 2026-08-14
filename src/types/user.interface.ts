interface IImage {
  _id: string;
  files_id?: string;
  data?: any;
  contentType?: string;
}

export interface ILoginResponse {
  _id: string;
  login: string;
  email: string;
  avatarId?: number;
  passwordHash?: string;
  isVerified?: boolean;
}

interface IUserStats {
  followersCount?: number;
  folowsCount?: number;
  postCount?: number;
}

export interface IUser  {
  _id: string;
  userId: string;
  login: string;
  email: string;
  avatarId?: string;
  avatar?: IImage;
  birthDate?: Date;
  friends?: IUser[];
  followers?: IUser[];
  isFollowed?: boolean;
  isFriend?: boolean;
  createdAt?: Date;
  stats?: IUserStats;
}
