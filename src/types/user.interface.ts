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
  avatar?: IImage;
  passwordHash?: string;
  isVerified?: boolean;
}

