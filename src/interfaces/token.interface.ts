export interface TokenInterface {
  _id: string; // We are gonna use this in the middleware 'isAuth'
  roles: string[];
  // merchantUserId: string;
  // exp: number;
  // apiCredentialsProvided: boolean;
}
