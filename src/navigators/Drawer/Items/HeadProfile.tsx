import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import {ThemeType} from '../../../../mk/styles/themes';
import {User} from '../../../types/user-types';

type Props = {
    user: User | null;
};

export const HeadProfile = ({user}: Props) => {
    const navigation: any = useNavigation();

    return (
        <ItemList
            title={getFullName(user || {})}
            onPress={() => navigation.navigate('Profile')}
            style={theme.container}
            subtitle={'Guardia'}
            left={
            <Avatar
                hasImage={Number(user?.has_image)}
                name={getFullName(user || {})}
                style={theme.avatar}
                onClick={() => navigation.navigate('Profile')}
                src={user ? getUrlImages('/GUARD-' + user.id + '.webp?d=' + user.updated_at) : ''}
                w={62}
                h={62}
            />
        }
        />
    );
};

export default HeadProfile;

const theme: ThemeType = {
    container: {
        backgroundColor: 'transparent'
    },
    avatar: {
        width: 64,
        height: 64,
        alignSelf: 'center',
        marginVertical: 10,
    }
}