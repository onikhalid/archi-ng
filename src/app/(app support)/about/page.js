import Link from "next/link"
import styles from "./About.module.scss"

const About = () => {
  return (
    <>
      <title>About Us | Archi NG</title>


      <div className={`${styles.container} content-container`}>
        <header>
          <h1>About Us</h1>
        </header>

        <main>
          <section>
            Welcome to Archi NG - Your Gateway to Nigerian Architecture,

            <span className={styles.accent}> Discover. Document. Design.</span>
            <br />

            At Archi NG, we are on a mission to bridge the gap between architectural knowledge and creativity in Nigeria. A project by a passionate architecture student, our journey began with a vision to enrich the architectural
            landscape of Nigeria by providing a comprehensive repository of well-documented Nigerian buildings.
          </section>



          <section>
            <h3>Our Story</h3>
            <div>
              Archi NG was born out of a deep-seated need in the architectural community. As an architecture student who experienced firsthand the challenges of sourcing relevant case studies for design projects.
              While there was an abundance of well-documented international buildings available online, the same couldn't be said for Nigerian architecture. This scarcity led to countless hours spent traveling sometimes long distances
              to personally document these structures.

              It was during one of these journeys that the idea of Archi NG took shape. Recognizing the importance of easy access to comprehensive architectural data, Archi NG was conceived as a solution to address the inadequate
              documentation of buildings and architecture in Nigeria.
            </div>
          </section>


          <section>
            <h3>Our Mission</h3>
            <div>
              At Archi NG, our primary mission is to empower architects, students, and enthusiasts with the tools and knowledge they need to excel in the field of architecture. We believe that by making well-documented Nigerian
              buildings readily available, we can foster innovation, inspire creativity, and elevate the quality of architectural designs in our country.
            </div>
          </section>


          <section>
            <h3>What You'll Find here</h3>
            <ul>
              <li>
                <span>Comprehensive Database:</span> Archi NG is your one-stop resource for crowd-sourced/community-sourced meticulously documented Nigerian buildings. From historic landmarks to contemporary marvels, our database spans across various architectural styles and periods.
              </li>
              <li>
                <span>Educational Resources:</span> We are committed to education. Explore our collection of articles, case studies, and design guides, carefully curated to help you expand your architectural knowledge.
              </li>

              <li>
                <span>Community Engagement:</span> Join our growing community of architects and architecture enthusiasts. Share your insights, collaborate on projects, and stay updated with the latest industry trends.
              </li>

            </ul >
          </section>


          <section>
            <h3>Join Us in Shaping Nigerian Architecture</h3>
            <div>
              Archi NG is more than just a website; it's a movement. We invite you to be a part of this journey in reshaping the architectural landscape of Nigeria. Whether you're an architect seeking inspiration, a student looking
              for valuable resources, or simply someone who appreciates the beauty of Nigerian architecture, Archi NG welcomes you with open arms. <Link href={'/auth'}>Join us today</Link>
              <br />
              Thank you for visiting Archi NG. Together, we can transform the way we perceive and create architecture in Nigeria.
            </div>
          </section>

          <section>
            <h3>Contact Us</h3>
            <div>


              Got questions, suggestions, or just want to say hello? Feel free to  <Link href={'/contact'}>contact us</Link> anytime. We'd love to hear from you!
            </div>
          </section>

        </main>
      </div>
    </>
  )
}

export default About