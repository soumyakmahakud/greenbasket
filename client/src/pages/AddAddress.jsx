import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

//Input Field Component
const InputFuield = ({ type, placeholder, name, handleChange, address }) => (
    <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-grey-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
    />
)

const AddAddress = () => {

    const { axios, user, navigate } = useAppContext()

    const [address, setAddresses] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddresses((prevAddress) => ({
            ...prevAddress,
            [name]: value
        }))

    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        console.log(user);
        
        if (!user || !user._id) {
            toast.error("User not logged in or user ID is missing.");
            return;
        }
        try {
            const { data } = await axios.post('/api/address/add', { address }, { withCredentials: true })

            if (data.success) {
                navigate('/cart')
                toast.success(data.message)
            } else {
                toast.error(data.message)
                console.log(data);
            }
        } catch (error) {
            toast.error(error.message)
        }

    }

    useEffect(() => {
    if (user === null) return; // Wait until fetched

    if (!user || !user._id) {
        toast.error("You must be logged in to add address.");
        navigate('/cart');
    }
}, [user]);

    return (
        <div className='mt-16 pb-16'>
            <p className='text-2xl md:text-3xl text-grey-500'>Add Shipping <span className='font-semibold text-primary'>Address</span></p>
            <div className='flex flex-col-rverse md:flx-row justify-between mt-10'>
                <div className='flex-1 max-w-md'>
                    <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputFuield handleChange={handleChange} address={address} name="firstName" type='text' placeholder="First Name" />
                            <InputFuield handleChange={handleChange} address={address} name="lastName" type='text' placeholder="Last Name" />
                        </div>
                        <InputFuield handleChange={handleChange} address={address} name="email" type='email' placeholder="Email Address" />
                        <InputFuield handleChange={handleChange} address={address} name="street" type='text' placeholder="Street" />

                        <div className='grid grid-cols-2 gap-4'>
                            <InputFuield handleChange={handleChange} address={address} name="city" type='text' placeholder="City" />
                            <InputFuield handleChange={handleChange} address={address} name="state" type='text' placeholder="State" />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputFuield handleChange={handleChange} address={address} name="zipcode" type='texnumbert' placeholder="Zip code" />
                            <InputFuield handleChange={handleChange} address={address} name="country" type='text' placeholder="Country" />
                        </div>
                        <InputFuield handleChange={handleChange} address={address} name="phone" type='text' placeholder="Phone" />

                        <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase'>
                            Save Address
                        </button>
                    </form>
                </div>
                <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt='Add Address' />
            </div>
        </div>
    )
}

export default AddAddress
