/* eslint-disable */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
// code is showing but dislike and like logic not working
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API_URL } from './Utils';
import { setError, setLikedPersons } from '../reducers/User';
import NavBarNew from './LogedInNavNew';
import placeholder from '../images/placeholder.png';
import './/css/potentialmatches.css';


export const Potential = () => {
  const [matchingList, setMatchingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState([]);
  const [dislikedUsers, setDislikedUsers] = useState([]);
  const userId = useSelector((store) => store.user.userId);
  let accessToken = useSelector((store) => store.user.accessToken);
  accessToken = !accessToken && localStorage.getItem('accessToken'); // If no accessToken, get it from localStorage instead of store (to prevent logout on page refresh) 
  const currentUser = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("current user", currentUser)
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        };

        const response = await fetch(API_URL(`potentialMatches/${userId}`), options);
        const data = await response.json(); 

        if (data.success) {
         const filteredUsers = data.response.users;
         setMatchingList(filteredUsers);
          dispatch(setError(null));
        } else {
          dispatch(setError(data.error));
        }
      } catch (error) {
        dispatch(setError(error));
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchUsers();
    }
  }, [dispatch, userId, accessToken, likedUsers]);

  const handleLikePerson = (user) => {
 
    const likePersonUserId = user._id;

    console.log('likePersonUserId', likePersonUserId);
    console.log('API URL:', API_URL(`like/${userId}`));

    fetch(API_URL(`like/${userId}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken
      },
      body: JSON.stringify({
        likedUserId: likePersonUserId
      })
    })
    .then((res) => {
      console.log('API Response:', res);
      return res.json();
    })
      .then((json) => {
        console.log('Response:', json);
        if (json.accessToken) {
          dispatch(setLikedPersons(json.likedPersons));
          setLikedUsers([...likedUsers, user._id])
        } else if (json.error) {
          console.error('API error:', json.error);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  
  const filteredMatchingList = matchingList.filter(
    (user) =>
      !likedUsers.includes(user.id) && !dislikedUsers.includes(user.id)
  );
  console.log('filteredMatchingList', filteredMatchingList);
  return (
    <div className="nav">
      <NavBarNew />
      <main className="main-container">
        <div className="box-container">
      
<div className="header-container">
<h1>{`Here are your potential ${currentUser.role === 'mentee' ? 'mentors' : 'mentees'}`}</h1>
</div>
          {loading ? (
            'Loading your potential matches..'
          ) : (
            <div className="card-container">
               
              {filteredMatchingList.length === 0 ? (
                <p>No more potential matches available.</p>
              ) : (
                filteredMatchingList.map((user) => (
                  <div
                    className="person-cardfinal"
                    key={user.username}>
                    <div className="photo-containerfinal">
                      <img
                        src= {placeholder}
                        alt="placeholder" />
                    </div>
                    <div className="profile-infofinal">
                      <div className="name-containerfinal">
                      <p>{user.username} // {user.role}</p>
                      </div>
                      <div className="bio-containerfinal">
                      <p>{user.bio}</p>
                      </div>
                      <div className="preferences">
                      <p>Preferences: </p>
                      {user.preferences.map((pref, index) => (
                        <p key={index}>{pref}</p>
                      ))}
                      </div>
                    </div>
                    <section className="button-container">
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => handleLikePerson(user)}>
                        Accept
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() =>
                          setDislikedUsers([...dislikedUsers, user._id])
                        }
                      >
                        Decline
                      </button>
                    </section>
                  </div>

                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};