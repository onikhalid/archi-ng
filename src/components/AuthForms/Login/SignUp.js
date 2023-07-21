import styles from './SignUp.module.scss'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';


export const SignupForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        try {
            const { email, password } = data;
            const result = await createUserWithEmailAndPassword(auth, email, password)
            const user = result.user
            console.log(user)

            const userDocRef = doc(db, 'users', user.uid)
            const userDocSnap = await getDoc(userDocRef)

            if (!userDocSnap.exists()) {
                const unknownUserPhotoURL = 'https://firebasestorage.googleapis.com/v0/b/archi-nigeria.appspot.com/o/profile_pictures%2Funknown_user%2FUnknown%20Profile%20Picture.png?alt=media&token=be2b9913-ab2d-4bb3-8f7c-822e5db30009'
                const userData = {
                    id: user.uid,
                    name: user.displayName === null ? `Architect_${user.uid}` : user.displayName,
                    profilePicture: user.photoURL === null ? unknownUserPhotoURL : user.photoURL
                }
                await setDoc(userDocRef, userData)
                route.push("/auth/complete-details")
            }



            console.log('Signed up successfully!')
        } catch (error) {
            console.log('Error signing up:', error)
        }
    };





    return (

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <h4>Sign Up with Email</h4>
            <div className={styles.inputdiv}>
                <label>Email</label>
                <input type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <span>{errors.email.message}</span>}
            </div>
            <div className={styles.inputdiv}>
                <label>Password</label>
                <input type="password" {...register('password', {
                    required: 'Password is required',
                    minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long',
                    },
                    pattern: {
                        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                        message: 'Password can only contain numbers and letters and must contain at least one letter and one number',
                    },
                })} />
                {errors.password && <span>{errors.password.message}</span>}

            </div>
            <button type="submit">Sign Up</button>
        </form>
    );
};















export const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const router = useRouter()


    const onSubmit = async (data) => {
        try {
            const { email, password } = data;
            const user = await signInWithEmailAndPassword(auth, email, password)
            console.log(user)

            const userDocRef = doc(db, 'users', user.user.uid)
            const userDocSnap = await getDoc(userDocRef)

            const datz = userDocSnap.data()
            console.log(datz)
            if (datz.hasOwnProperty('bio')) {
                router.push('/')
            }
            else {
                router.push('/auth/complete-profile')
            }

            console.log('Logged in successfully!');
        }

        catch (error) {
            if (error.code === 'auth/user-not-found') {
                toast.error('Invalid Email', {
                    position: 'top-center',
                    autoClose: 3000,
                })
            } else if (error.code === 'auth/wrong-password') {
                toast.error('Invalid Password', {
                    position: 'top-center',
                    autoClose: 3000,
                })
            }

            else {
                console.log('Error logging in:', error);
            }
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <h4>Login with Email</h4>
            <div className={styles.inputdiv}>
                <label>Email</label>
                <input type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <span>{errors.email.message}</span>}
            </div>
            <div className={styles.inputdiv}>
                <label>Password</label>
                <input type="password" {...register('password', { required: 'Password is required' })} />
                {errors.password && <span>{errors.password.message}</span>}
            </div>
            <button type="submit">Login</button>
        </form>
    );
};



