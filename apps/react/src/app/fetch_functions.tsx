import { User, UserChats } from '@repo/db';
import axios from 'axios';

export async function fetchProfile(token : string | null): Promise<User> {
    const profile = await fetch('api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,      
      },
    })
  
    .catch((error) => {
      throw `Unauthorized ${error}`;
    });
    const user = await profile.json();
    if (user.statusCode !== 401)
      return user;
    throw `Unauthorized ${user.statusCode}`;
}
  
/**
 * Fetch Get function to send a get request to the Backend
 * @param url
 * @returns 
 */
export async function fetchGet<T> (url: string): Promise<T> {
    try {
        const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        });

        if (response.status !== 200) {
            return new Promise<T>((resolve, reject) => {
                reject('Fetch unauthorized: ');
            });
        }
        const data : T = await response.json();
        return data;
    } catch (error) {
        return new Promise<T>((resolve, reject) => {
            reject('Fetch Error: ' + error);
        });
    }
}


/**
 *  Fetch Post function to send a post request to the Backend
 * @param url
 * @param body
 * @returns 
 */
export async function fetchPost<B, T> (url: string, body: B): Promise<T> {
    try {
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
        })

        if(response.status !== 200)
        throw `Unauthorized ${response.status}`;

        const data = await response.json();
        return data;
    } catch (error) {
        throw 'Fetch Error: ' + error;
    }
}

export async function fetchPostImage(url: string, body: FormData) {
    try {
        if (!body)
            throw new Error('No image provided');
        const response = await axios.post(url, body, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
        });
        if(response.status !== 201)
            throw `Unauthorized ${response.status}`;
        return response.data;
    } catch (error) {
        throw 'Fetch Error: ' + error;
    }
}

/**
 * Fetch Put function to send a put request to the Backend
 * @param url
 * @param body
 * @returns 
 */
export async function fetchDelete<T> (url: string): Promise<T> {
    try {
        const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        });

        if (response.status !== 200)
        throw `Unauthorized ${response.status}`;
        const data : T = await response.json();
        return data;
    } catch (error) {
        throw `Fetch Error ${error}`;
    }
}

export async function fetchChats(token : string | null): Promise<UserChats[]> {
    const messages = await fetch('api/chats', {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    .catch((error) => {
        throw `Unauthorized ${error}`;
    });
    const chats = await messages.json();
    if (chats.statusCode !== 401)
        return chats;
    throw `Unauthorized ${chats.statusCode}`;
}