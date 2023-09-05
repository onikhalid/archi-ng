import Link from "next/link"
import styles from "./FAQs.module.scss"


const FAQ = () => {
  return (
    <>
      <title>Frequently Asked Questions | Archi NG</title>

      <div className={`${styles.container} content-container`}>
        <header>
          <h1>FAQs</h1>
        </header>

        <main>
          <section>
            <h3>About Archi NG</h3>
            <article>
              <h5>1. What is Archi NG?</h5>
              <p>Archi NG is an online platform dedicated to the documentation and promotion of Nigerian architecture. It serves as a repository of well-documented Nigerian buildings, educational resources, and a community for architects and enthusiasts.</p>
            </article>

            <article>
              <h5>2. How did the idea for Archi NG originate?</h5>
              <p>The idea for Archi NG was born out of the founder's experience as an architecture student. Faced with a lack of readily available documentation of Nigerian buildings for case studies, the founder saw the need to create a platform that addresses the inadequate documentation of architecture in Nigeria.</p>
            </article>

            <article>
              <h5>3. Who is the founder of Archi NG?</h5>
              <p>Archi NG was founded by Khalid Oni, an architecture student who is passionate about promoting Nigerian architecture and providing valuable resources to the architectural community.</p>
            </article>
          </section>

          <section>
            <h3>Using Archi NG</h3>
            <article>
              <h5>4. How can I contribute to Archi NG?</h5>
              <p>You can contribute to Archi NG by sharing well-documented case studies, articles, and images related to Nigerian architecture. Simply <Link href={'/auth'}>create an account</Link>, and you can start sharing your insights and knowledge with the community.</p>
            </article>

            <article>
              <h5>5. Is Archi NG only for architects?</h5>
              <p>No, Archi NG is open to anyone with an interest in Nigerian architecture. Whether you're an architect, student, or someone who appreciates the beauty of architecture, you are welcome to explore, learn, and contribute to the platform.</p>
            </article>
          </section>

          <section>
            <h3>Community and Engagement</h3>
            <article>
              <h5>6. How can I engage with the Archi NG community?</h5>
              <p>You can engage with the Archi NG community by participating in discussions, commenting on articles and case studies, and connecting with fellow architecture enthusiasts. Join our platform to be a part of this growing community.</p>
            </article>
          </section>
        </main>

        <footer>
          <p>If you have more questions or need further assistance, please don't hesitate to <Link href={'/contact'}>contact us</Link>.</p>
        </footer>
      </div>
    </>
  )
}

export default FAQ