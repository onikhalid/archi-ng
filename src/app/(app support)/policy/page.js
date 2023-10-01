import Link from "next/link"
import styles from "./Policy.module.scss"


const Policy = () => {
    return (
        <>
            <title>Privacy Policy | Archi NG</title>
            <meta name="description" content="Privacy Policy | Archi NG" />


            <div className={`${styles.container} content-container`}>
                <header>
                    <h1>Privacy Policy</h1>
                    <p>Effective Date: <time datetime="2023-09-04">September 4, 2023</time></p>

                </header>

                <main>
                    <section>
                        <h3>Information We Collect</h3>
                        <article>
                            <h5>User-Provided Information</h5>
                            <p>When you register for an account, submit content, or interact with the Platform, we may collect personal information such as your name, email address, and other information you voluntarily provide.</p>
                        </article>

                        <article>
                            <h5>Automatically Collected Information</h5>
                            <p>We may also collect certain information automatically when you use the Platform, including but not limited to your IP address, browser type, operating system, and usage data.</p>
                        </article>
                    </section>

                    <section>
                        <h3>How We Use Your Information</h3>
                        <article>
                            <h5>Providing and Improving Services</h5>
                            <p>We use your personal information to provide you with access to the Platform, enhance your user experience, and improve our services.</p>
                        </article>

                        <article>
                            <h5>Communication</h5>
                            <p>We may use your email address to send you important updates, notifications, or promotional materials related to Archi NG. You can opt out of marketing communications at any time.</p>
                        </article>

                        <article>
                            <h5>Aggregate Data</h5>
                            <p>We may aggregate and anonymize data to analyze usage patterns and trends on the Platform. This aggregated data does not identify individual users.</p>
                        </article>
                    </section>

                    <section>
                        <h3>Sharing Your Information</h3>
                        <article>
                            <h5>Third-Party Service Providers</h5>
                            <p>We may share your information with third-party service providers who assist us in providing and maintaining the Platform. These service providers are bound by confidentiality agreements and are prohibited from using your information for any other purpose.</p>
                        </article>

                        <article>
                            <h5>Legal Requirements</h5>
                            <p>We may disclose your information when required by law, such as in response to a subpoena, court order, or government request.</p>
                        </article>
                    </section>
                </main>

                <footer>
                    <section>
                        <h3>Data Security</h3>
                        <p>We employ industry-standard security measures to protect your personal information. However, please be aware that no method of data transmission over the internet or electronic storage is entirely secure.</p>
                    </section>

                    <section>
                        <h3>Your Choices</h3>
                        <article>
                            <h5>Access and Update</h5>
                            <p>You may access and update your personal information by logging into your account settings.</p>
                        </article>

                        <article>
                            <h5>Opt-Out</h5>
                            <p>You can opt out of receiving marketing communications from us by following the instructions provided in those communications or by contacting us directly.</p>
                        </article>
                    </section>

                    <section>
                        <h3>Children&apos;s Privacy</h3>
                        <article>
                            <p>The Platform is not intended for children under the age of 13. We do not knowingly collect or solicit personal information from children under 13. If you believe that a child under 13 has provided us with personal information, please contact us, and we will promptly delete such information.</p>
                        </article>
                    </section>

                    <section>
                        <h3>Changes to this Privacy Policy</h3>
                        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal or regulatory reasons. Any modifications will be posted on this page with a revised effective date.</p>
                    </section>

                    <section>
                        <h3>Contact Us</h3>
                        <p>If you have questions, concerns, or requests related to your privacy or this Privacy Policy, please <Link href={'/contact'}>contact us</Link>.</p>
                    </section>
                </footer>
            </div>
        </>
    )
}

export default Policy