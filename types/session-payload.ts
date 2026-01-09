import { TUser } from './user';

type TSessionPayload = {
  user?: Pick<TUser, 'id' | 'roles'>;
};

export default TSessionPayload;
