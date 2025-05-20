import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'

const url = 'https://www.omdbapi.com/?s=avengers&apikey=278924d5';

function MovieList() {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get(url).then(({ data }) => {
            setData(data);
        });
    }, []);

    if (!data) return <div>Yüklənir...</div>;
    if (!data.Search === undefined) return <div>Film tapılmadı</div>;

    return (<>
        <div className='input'>
            <input type='search' placeholder='search'></input>
            <button>Axtar</button>
        </div>
        <div className='bigContainer'>
        <div className='cont'>
            {data.Search.map(movie => (
                <div key={movie.imdbID} className='cont-page'>
                    <img src={movie.Poster} alt={movie.Title} style={{ width: '180px' }} />
                    <div>
                        <h2 style={{ fontSize: '30px' }}>{movie.Title}</h2>
                        <p>İl: {movie.Year}</p>
                        <button>Add to</button>
                    </div>
                </div>
            ))}
        </div>
         <div className='favoriteList'>
                
            </div>
        </div>
    </>
    );
}

export default MovieList;
