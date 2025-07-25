import { Types } from 'mongoose';

export interface IBlog {
  _id?: Types.ObjectId | string;
  title: string;
  slug?: string;
  content: string;
  coverImage?: {
    url: string;
    public_id: string;
  };
  images?: { url: string; public_id: string }[];
  tags?: string[];
  author: Types.ObjectId | string;
  //userId: Types.ObjectId | string;
  //isPublished?: boolean;
  likes?: (Types.ObjectId | string)[];
  status: 'draft' | 'published' | 'archived';
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
