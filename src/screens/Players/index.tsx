import { Alert, FlatList, TextInput } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useState, useEffect, useRef } from 'react'

import { Header } from '@components/Header'
import { Highlight } from '@components/Highlight'
import { Filter } from '@components/Filter'
import { Input } from '@components/Input'
import { ButtonIcon } from '@components/ButtonIcon'
import { PlayerCard } from '@components/PlayerCard'
import { ListEmpty } from '@components/ListEmpty'
import { Button } from '@components/Button'

import { Container, Form, HeaderList, NumberOfPlayers } from './styles'

import { AppError } from '@utils/AppError'


import { playerAddByGrup } from '@storage/player/playerAddByGroup'
import { playersGetByGroup } from '@storage/player/playersGetByGroup'
import { playersGetByGroupAndTeam } from '@storage/player/playerGetByGroupAndTeam'
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO'

type RouteParams = {
    group: string;
}



export function Players() {
    const [newPlayerName, setNewPlayerName] = useState('');

    const [team, setTeam] = useState("Time A");
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

    const route = useRoute();
    const { group } = route.params as RouteParams;

    const newPlayerNameInputRef = useRef<TextInput>(null)

    async function handlewAddPlayer() {
        if (newPlayerName.trim().length === 0) {
            return Alert.alert("Nova pessoa", "Informe o nome da pessoa")
        }

        const newPlayer = {
            name: newPlayerName,
            team,
        }

        try {
            await playerAddByGrup(newPlayer, group)

            newPlayerNameInputRef.current?.blur()
            setNewPlayerName('');
            fetchPlayersByTeam();
            
        } catch (error) {
            if (error instanceof AppError){
                Alert.alert("Nova pessoa", error.message)
            }else{
                console.log(error)
                Alert.alert("Nova pessoa", "Não foi possivel adicionar a pessoa!")
            }
        }
    }

    async function fetchPlayersByTeam(){
        try{
            const playersByTeam = await playersGetByGroupAndTeam(group, team);
            setPlayers(playersByTeam);
        }catch(error){
            console.log(error)
            Alert.alert("Pessoas", "Não foi possivel carregar as pessoas do time selecionado!")
        }
    }
    
    useEffect(() => {
        fetchPlayersByTeam();
    }, [team])

    return (
        <Container>
            <Header showBackButton />

            <Highlight
                title={group}
                subtitle="adicione a galera e separe os times"
            />

            <Form>
                <Input
                    inputRef={newPlayerNameInputRef}
                    placeholder="Nome do participante"
                    onChangeText={setNewPlayerName}
                    value={newPlayerName}
                    autoCorrect={false}
                    onSubmitEditing={handlewAddPlayer}
                    returnKeyType='done'
                />
                <ButtonIcon
                    icon="add"
                    onPress={handlewAddPlayer}
                />
            </Form>

            <HeaderList>
                <FlatList
                    data={["Time A", "TimeB"]}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <Filter
                            title={item}
                            isActive={item === team}
                            onPress={() => setTeam(item)}
                        />
                    )}
                    horizontal
                />
                <NumberOfPlayers>
                    {players.length}
                </NumberOfPlayers>
            </HeaderList>

            <FlatList
                data={players}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <PlayerCard
                        name={item.name}
                        onRemove={() => { }}
                    />
                )}
                ListEmptyComponent={() => (
                    <ListEmpty
                        message="Não há pessoas neste time"
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    { paddingBottom: 50 }, players.length === 0 && { flex: 1 }
                ]}
            />

            <Button
                title="Remover turma"
                type="SECONDARY"
            />
        </Container>
    )
}