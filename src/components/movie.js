import axios from 'axios';
import { useEffect, useState } from 'react';
import '../App.css';

const API_KEY = '278924d5';
const BASE_URL = 'https://www.omdbapi.com/';

function MovieList() {
    const [query, setQuery] = useState('avengers');
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTerm, setFilteredTerm] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [folders, setFolders] = useState({});
    const [viewMode, setViewMode] = useState('main');
    const [activeFolder, setActiveFolder] = useState(null);
    const [isFavoriteOpen, setIsFavoriteOpen] = useState(false);

    const fetchMovies = async (searchQuery) => {
        try {
            const response = await axios.get(`${BASE_URL}?s=${searchQuery}&apikey=${API_KEY}`);
            setData(response.data?.Search || []);
        } catch (error) {
            console.error('API error:', error);
        }
    };

    useEffect(() => {
        fetchMovies(query);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilteredTerm(searchTerm.trim());
        if (viewMode === 'main') {
            setActiveFolder(null);
        }
    };

    const addToFavorites = async (id) => {
        if (favorites.find(f => f.imdbID === id)) return;
        try {
            const response = await axios.get(`${BASE_URL}?i=${id}&apikey=${API_KEY}`);
            setFavorites(prev => [...prev, response.data]);
        } catch (err) {
            console.error('Movie fetch error:', err);
        }
    };

    const removeFromFavorites = (id) => {
        setFavorites(favorites.filter(m => m.imdbID !== id));
    };

    const handleCreateFolder = () => {
        if (!folderName.trim()) {
            alert("Please enter a folder name.");
            return;
        }
        if (folders[folderName]) {
            alert("Folder with this name already exists.");
            return;
        }

        setFolders(prev => ({
            ...prev,
            [folderName]: [...favorites],
        }));

        setFavorites([]);
        setFolderName('');
        setShowFolderForm(false);
    };

    useEffect(() => {
        if (favorites.length === 0 && showFolderForm) {
            setShowFolderForm(false);
        }
    }, [favorites, showFolderForm]);

    useEffect(() => {
        const nonEmptyFolders = Object.entries(folders).reduce((acc, [name, movies]) => {
            if (movies.length > 0) acc[name] = movies;
            return acc;
        }, {});

        if (Object.keys(nonEmptyFolders).length !== Object.keys(folders).length) {
            setFolders(nonEmptyFolders);
            if (activeFolder && !nonEmptyFolders[activeFolder]) {
                setActiveFolder(null);
                setViewMode('main');
            }
        }
    }, [folders]);

    const handleDeleteFolder = (name) => {
        const updated = { ...folders };
        delete updated[name];
        setFolders(updated);
        if (activeFolder === name) {
            setActiveFolder(null);
            setViewMode('main');
        }
    };

    const displayedMovies = (() => {
        const searchTermLower = filteredTerm.toLowerCase();
        if (viewMode === 'folders' && activeFolder && folders[activeFolder]) {
            return folders[activeFolder].filter(movie =>
                movie.Title.toLowerCase().includes(searchTermLower)
            );
        }
        return data.filter(movie =>
            movie.Title.toLowerCase().includes(searchTermLower)
        );
    })();

    return (
        <>
            <div className='topSection'>
                <form onSubmit={handleSearch} className='input'>
                    <input
                        type='search'
                        placeholder='Search'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type='submit'>Search</button>
                </form>

                <button
                    className='favorite-toggle-btn'
                    onClick={() => setIsFavoriteOpen(prev => !prev)}
                >
                    {isFavoriteOpen ? 'Hide Favorites' : `Favorites (${favorites.length})`}
                </button>

                {(isFavoriteOpen || window.innerWidth > 900) && viewMode === 'main' && (
                    <div className={`favoriteList ${isFavoriteOpen ? 'open' : ''}`}>
                        <h3>Favorites</h3>
                        <ul>
                            {favorites.length === 0 ? (
                                <li style={{ fontStyle: 'italic', color: 'gray' }}>
                                    No favorites added yet.
                                </li>
                            ) : (
                                favorites.map((movie) => (
                                    <li key={movie.imdbID}>
                                        {movie.Title} ({movie.Year})
                                        <button onClick={() => removeFromFavorites(movie.imdbID)}>X</button>
                                    </li>
                                ))
                            )}
                        </ul>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            {favorites.length > 0 && !showFolderForm && (
                                <button onClick={() => setShowFolderForm(true)} className='folder-btn'>Create List</button>
                            )}
                            {showFolderForm && favorites.length > 0 && (
                                <div className='folder-form'>
                                    <input
                                        type='text'
                                        placeholder='Folder name'
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                    />
                                    <button onClick={handleCreateFolder}>Confirm</button>
                                </div>
                            )}
                            {Object.keys(folders).length > 0 && (
                                <button className='view-list' onClick={() => setViewMode('folders')}>View List</button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className='bigContainer'>
                <div className='cont'>
                    {displayedMovies.length > 0 ? (
                        displayedMovies.map(movie => (
                            <div key={movie.imdbID} className='cont-page'>
                                <img src={movie.Poster} alt={movie.Title} style={{ width: '180px' }} />
                                <div>
                                    <h2>{movie.Title}</h2>
                                    <p>Year: {movie.Year}</p>
                                    <div className="button-group">
                                        {viewMode === 'main' && (
                                            <button
                                                onClick={() => addToFavorites(movie.imdbID)}
                                                className={`favorite-btn ${favorites.some(m => m.imdbID === movie.imdbID) ? 'added' : ''}`}
                                                disabled={favorites.some(m => m.imdbID === movie.imdbID)}
                                            >
                                                {favorites.some(m => m.imdbID === movie.imdbID) ? 'Added' : 'Add'}
                                            </button>
                                        )}
                                        <a
                                            href={`https://www.imdb.com/title/${movie.imdbID}/`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <button>IMDb</button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No movies found</div>
                    )}
                </div>

                {viewMode === 'folders' && (
                    <div className='lists'>
                        <button onClick={() => { setViewMode('main'); setActiveFolder(null); }}>⬅ Back</button>
                        <h3>My Lists</h3>
                        {Object.keys(folders).length === 0 && <p>No lists created</p>}
                        {Object.keys(folders).map((name) => (
                            <div key={name} className='folder'>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button onClick={() => setActiveFolder(name)}>{name}</button>
                                    <button onClick={() => handleDeleteFolder(name)} style={{ marginLeft: '10px' }}>🗑</button>
                                </div>
                                {activeFolder === name && (
                                    <ul>
                                        {folders[name].map((movie) => (
                                            <li key={movie.imdbID} style={{ marginBottom: '10px' }}>
                                                <strong>{movie.Title}</strong> ({movie.Year})
                                                <a
                                                    href={`https://www.imdb.com/title/${movie.imdbID}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    <button>IMDb</button>
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        const updated = folders[name].filter(m => m.imdbID !== movie.imdbID);
                                                        setFolders(prev => ({
                                                            ...prev,
                                                            [name]: updated,
                                                        }));
                                                    }}
                                                    style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default MovieList;