import AsyncStorage from '@react-native-async-storage/async-storage';
import { GROUP_COLLECTION } from '@storage/storageConfig';
import { groupsGetAll } from './groupsGetAll';
import { AppError } from '@utils/AppError';

export async function groupCreate(newGroup: string){
    try{
        const storagedGroups = await groupsGetAll();

        const groupAlreadyExists = storagedGroups.includes(newGroup);

        if(groupAlreadyExists) {
            throw new AppError("Já existe um grupo cadastrado com este nome")
        }

        const storage= JSON.stringify([...storagedGroups, newGroup])
        await AsyncStorage.setItem(GROUP_COLLECTION, storage);
    }catch(error){
        throw error;
    }
}