import React, { useState, useEffect, useCallback } from 'react';
import Sheet from './Sheet';
import axios from 'axios';

const Characters = () => {
    // This is a small implementation, but data management could be held with other strategies, for example Redux store
    const [charactersList, setCharactersList] = useState([]);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                // Ideally, API endpoint should be stored in a env variable and accessed here with process.env
                const response = await axios.get('https://recruiting.verylongdomaintotestwith.ca/api/{xicapinica}/character');
                if (response.data?.body) setCharactersList([response.data.body]);
            } catch (error) {
                console.error('Error fetching the characters:', error);
            }
        };

        fetchCharacters();
    }, []);

    const handleAddCharacter = useCallback(() => {
        const newCharacter = {};
        setCharactersList(prevList => [...prevList, newCharacter]);
    }, []);

    const saveCharacter = useCallback(async (character) => {
        try {
            const response = await axios.post(
                'https://recruiting.verylongdomaintotestwith.ca/api/{xicapinica}/character',
                character,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert(`Character successfully saved!`);
        } catch (error) {
            console.error('Error saving character:', error);
            throw error;
        }
    }, []);

    return (
        <>
            <div style={{ padding: '20px' }}>
                <button onClick={handleAddCharacter}>{'Add character'}</button>
            </div>
            <div>
                {charactersList.map((character, index) => (
                    <div
                        key={index}
                        style={{
                            border: '4px solid #282c34',
                            maxWidth: '960px',
                            margin: '0 auto',
                            marginBottom: '20px'
                        }}
                    >
                        <Sheet characterData={character} number={index + 1} onSave={saveCharacter} />
                    </div>
                ))}
            </div>
        </>
    );
};

export default Characters;
