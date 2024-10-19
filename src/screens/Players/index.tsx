import { Alert, FlatList, TextInput } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
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
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup'
import { playersGetByGroupAndTeam } from '@storage/player/playerGetByGroupAndTeam'
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO'
import { groupRemoveByName } from '@storage/group/groupRemoveByName'
import { Loading } from '@components/Loading'

type RouteParams = {
    group: string;
}



export function Players() {
    const [isLoading, setIsLoading] = useState(true);
    const [newPlayerName, setNewPlayerName] = useState('');

    const [team, setTeam] = useState("Time A");
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

    const navigation = useNavigation();
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
            if (error instanceof AppError) {
                Alert.alert("Nova pessoa", error.message)
            } else {
                console.log(error)
                Alert.alert("Nova pessoa", "Não foi possivel adicionar a pessoa!")
            }
        }
    }

    async function handlePlayerRemove(playerName: string) {
        try {

            await playerRemoveByGroup(playerName, group)
            fetchPlayersByTeam();

        } catch (error) {
            console.log(error)
            Alert.alert("Remover pessoa", "Não foi possivel remover esta pessoa.")

        }
    }

    async function groupRemove() {
        try {

            await groupRemoveByName(group);
            navigation.navigate('groups')

        } catch (error) {
            console.log(error)
            Alert.alert("Remover grupo", "Não foi possivel remover este grupo.")

        }
    }

    async function handleGroupRemove() {
        Alert.alert(
            "Remover",
            "Deseja remover essa turma?",
            [
                { text: "Não", style: 'cancel' },
                { text: "Sim", onPress: () => groupRemove() }
            ]
        )
    }

    async function fetchPlayersByTeam() {
        try {
            setIsLoading(true);

            const playersByTeam = await playersGetByGroupAndTeam(group, team);
            setPlayers(playersByTeam);
        } catch (error) {
            console.log(error)
            Alert.alert("Pessoas", "Não foi possivel carregar as pessoas do time selecionado!")
        } finally {
            setIsLoading(false);
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
            {
                isLoading ? <Loading /> :
            <FlatList
                data={players}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <PlayerCard
                        name={item.name}
                        onRemove={() => handlePlayerRemove(item.name)}
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
        }


            <Button
                title="Remover turma"
                type="SECONDARY"
                onPress={handleGroupRemove}
            />
        </Container>
    )
}