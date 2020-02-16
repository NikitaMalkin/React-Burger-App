import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-burger-app-ba22d.firebaseio.com/'
});

export default instance;