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
  friends: [];
  gifts: Gift[];
  timestamp: string;
}

export interface Gift extends NewGift {
  id: string;
}

export interface UserUpdate {
  name: string;
  friends: [];
  gifts: Gift[];
}
