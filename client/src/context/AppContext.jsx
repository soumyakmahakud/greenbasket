import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});


    //Fetch Seller Status
    const fetchSeller = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth');
            if (data.success) {
                setIsSeller(true)
            } else {
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    //Fetch User Auth Status , User Data and Cart Items
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/is-auth')
            if (data.success) {
                setUser(data.user)
                setCartItems(data.user.cartItems)
            }
        } catch (error) {
            setUser(null)
        }
    }

    //Fetch All Products
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list')
            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Add Product to Cart
    const addToCart = (itemsId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemsId]) {
            cartData[itemsId] += 1;
        } else {
            cartData[itemsId] = 1
        }
        setCartItems(cartData);
        toast.success("Add to cart")
    }


    //Update Cart Item Quantity
    const updateCartItem = (itemsId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemsId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }
    //Remove Product from Cart
    const removeFromCart = (itemsId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemsId]) {
            cartData[itemsId] -= 1
            if (cartData[itemsId] === 0) {
                delete cartData[itemsId]
            }
        }
        toast.success("Remove From Cart")
        setCartItems(cartData)
    }

    // Get Cart Item Counts
    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    // get cart Total Amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemsInfo = products.find((product) => product._id === items)
            if (cartItems[items] > 0) {
                totalAmount += itemsInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchUser()
        fetchSeller()
        fetchProducts()
    }, [])


    //Update database Cart Items
    useEffect(() => {
        const updateCart = async () => {
            try {
                console.log("Updating cart with items:", cartItems);
                const { data } = await axios.post('/api/cart/update', { cartItems})
                if(!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        if(user){
            updateCart()
        }
    }, [cartItems]);

    const value = { navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, setCartItems }
    return <AppContext value={value}>
        {children}
    </AppContext>
}

export const useAppContext = () => {
    return useContext(AppContext)
}