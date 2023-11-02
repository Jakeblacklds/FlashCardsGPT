
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkAuthentication = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user !== null;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('user');
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
