import React from 'react';

import burger from '../../assets/images/burger.png';
import classes from './Logo.css';

const logo = (props) => (
    <div className={classes.Logo}
        style={{height: props.height}}>
        <img src={burger} alt="Nikita's Burger Company"/>
    </div>
);

export default logo;
