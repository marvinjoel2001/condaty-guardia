import {useContext} from 'react';
import {AuthContext, AuthContextType} from '../contexts/AuthContext';

interface AuthContextResponse extends AuthContextType {
  allowed: boolean;
}

const useAuth = (
  ability: string | null = null,
  action: string | null = null,
): AuthContextResponse => {
  const data: any = useContext(AuthContext);
  let allowed = true;
  if (ability && !data.userCan(ability, action)) allowed = false;
  return {...data, allowed};
};

export default useAuth;
