"use client"
import { toast } from "react-toastify";
import styles from "./Contact.module.scss"
import { useForm } from 'react-hook-form';



const Contact = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();


  const onSubmit = async (data) => {
    try {
      const response = await fetch('https://formspree.io/f/mleynlpr', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setValue("Name", "");
        setValue("Email", "");
        setValue("Message", "");
        toast.success("Message sent successful, Thank you for your contribution to Archi NG", {
          position: "top-center",
          autoClose: 3000
        })

      } else {
        toast.success("Sending message failed, try again", {
          position: "top-center",
          autoClose: 2500
        })
      }
    } catch (error) {
      console.error(error);
    }
  };




  return (
    <>
      <title>Contact Us | Archi NG</title>
      <meta name="description" content="Contact Us | Archi NG" />


      <div className={`${styles.container} content-container`}>
        <header>
          <h1>Contact Us</h1>
          <h6>Got questions, suggestions, or just want to say hello?</h6>
        </header>

        <main>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='inputdiv'>
              <label htmlFor="Name">Name<span>*</span></label>
              <input id="Name" type="text" name="Name"
                placeholder="Adanna Nwoku Elizabeth"
                {...register("Name", { required: true })} />
              {errors.Name && <span>Name field is required</span>}
            </div>

            <div className='inputdiv'>
              <label htmlFor="Email">Email<span>*</span></label>
              <input id="Email" type="email" name="Email"
                placeholder="Adanna@gmail.com"
                {...register("Email", { required: true })} />
              {errors.Email && <span>Email field is required</span>}
            </div>

            <div className='inputdiv'>
              <label htmlFor="Message">Your Message<span>*</span></label>
              <textarea name="Message" rows="5"
                placeholder="I hope this message finds you well. I just wanted to take a moment to express my sincere gratitude for creating such an incredible website.
                I've been using it for 6 months, and it has truly become an indispensable part of my online experience."
                {...register("Message", { required: true })}></textarea>
              {errors.Message && <span>Message field is required</span>}
            </div>


            <input aria-label="Send your message" name="subnit-button" type="submit" value={"Send your message"}/>
          </form>
        </main>


      </div>
    </>

  )
}

export default Contact