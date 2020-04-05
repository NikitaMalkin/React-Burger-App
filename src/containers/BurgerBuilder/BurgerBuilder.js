import React, { Component } from 'react';
import { connect } from 'react-redux';

import Aux from '../../hoc/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actionTypes from '../../store/actions';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {
    state = {
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount () {
        // axios.get('https://react-burger-app-ba22d.firebaseio.com/ingredients.json')
        //     .then(response => {
        //         this.setState({ingredients: response.data});
        //     })
        //     .catch(error => {
        //         this.setState({error: true});
        //     });
    }

    updatePurchaseState (ingredients) {
        const sum = Object.keys(ingredients)
            .map(ingredientKey => {
                return ingredients[ingredientKey];
            })
            .reduce((sum, el) => { return sum+el}, 0);
        
            this.setState({purchasable: sum>0});
    };

addIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    const newCount = oldCount + 1;
    
    const updatedIngredients = { ...this.state.ingredients };
    updatedIngredients[type] = newCount;

    const priceAddition = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice + priceAddition;

    this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
    this.updatePurchaseState(updatedIngredients);
}

removeIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    var newCount = oldCount - 1;
    if (newCount < 0)
       { 
           newCount = 0;
       }

    const updatedIngredients = { ...this.state.ingredients };
    updatedIngredients[type] = newCount;

    const priceDeduction = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    var newPrice = oldPrice - priceDeduction;
    if (newPrice < 4)
    {
        newPrice = 4;
    }

    this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
    this.updatePurchaseState(updatedIngredients);
}

orderButtonClickHandler = () => {
    this.setState({purchasing: true});
}

purchaseCancelHandler = () => {
    this.setState({purchasing : false});
}

purchaseContinueHandler = () => {
    const queryParams = [];
    for (let i in this.state.ingredients)
    {
        queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
    }

    queryParams.push('price=' + this.state.totalPrice);

    const queryString = queryParams.join('&');

    this.props.history.push({
        pathname: '/checkout',
        search: '?' + queryString
    });
}

    render () {

        const disabledInfo = { ...this.props.ings };

        for (let key in disabledInfo) 
        {
            if (disabledInfo[key] === 0)
            {
                disabledInfo[key] = true;
            }
            else
            {
                disabledInfo[key] = false;
            }
        }

        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner/>;

        if (this.props.ings !== null) 
        {
            burger = (
                <Aux>
                    <Burger ingredients={this.props.ings}/>
                    <BuildControls 
                        ingredientAdded = {this.props.onIngredientAdded} 
                        ingredientRemoved = {this.props.onIngredientRemoved}
                        disabled={disabledInfo} 
                        price={this.state.totalPrice}
                        purchasable={this.state.purchasable}
                        orderButtonClicked={this.orderButtonClickHandler}/>
                </Aux>
            );

            orderSummary = <OrderSummary 
                ingredients={this.props.ings}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                totalPrice={this.state.totalPrice}/>
        }

        if (this.state.loading)
        {
            orderSummary = <Spinner/>;
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.ingredients
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch({type: actionTypes.ADD_INGREDIENT, ingredientName: ingName}),
        onIngredientRemoved: (ingName) => dispatch({type: actionTypes.REMOVE_INGREDIENT, ingredientName: ingName})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));