export interface Group {
  name: string;
  password: string;
  admin: string;
  members?: string[];
  id?: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export interface NewGift {
  description: string;
  link: string;
  reservation: string;
}

export interface User extends NewUser {
  id: string;
  gifts: Gift[];
}

export interface Gift extends NewGift {
  id: string;
}

export interface UserUpdate {
  name: string;
  gifts: Gift[];
}
