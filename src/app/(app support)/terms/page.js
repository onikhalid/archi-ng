import Link from "next/link"
import styles from "./Terms.module.scss"


const Terms = () => {
    return (
        <>
            <title>Terms and Conditions | Archi NG</title>


            <div className={`${styles.container} content-container`}>
                <header>
                    <h1>Terms and Conditions</h1>
                </header>

                <main>
                    <section>
                        Welcome to Archi NG&apos;s "Terms and Conditions" page. Before using our platform, please carefully read and understand the following terms and conditions
                        as they govern your use of the Archi NG website and services.
                    </section>

                    <section>
                        <section>
                            <h5>1. Acceptance of Terms</h5>
                            <p>By accessing or using the Archi NG website (referred to as "the Platform" hereafter), you agree to comply with and be bound by these terms and conditions. If you do not agree with any of these terms, please refrain from using the Platform.</p>
                        </section>



                        <section>
                            <h5>2. Use of the Platform</h5>

                            <div>
                                <h6>2.1. User Conduct</h6>
                                <ul>
                                    <li>Comply with all applicable laws and regulations.</li>
                                    <li>Refrain from using derogatory, offensive, or harmful language in articles, case studies, comments, or any other form of communication on the Platform.</li>
                                    <li>Refrain from posting images, including images of buildings and yourself, that you do not have the appropriate rights or licenses to share.</li>
                                </ul>
                            </div>

                            <div>
                                <h6>2.2. Intellectual Property</h6>
                                <p>You acknowledge that all content on the Platform, including but not limited to articles, case studies, images, and designs, are the intellectual property of Archi NG or its respective contributors. You may not reproduce, distribute, or use any content from the Platform without proper authorization.</p>
                            </div>
                        </section>



                        <section>
                            <h5>3. App COntent - Case Studies and Articles</h5>

                            <div>
                                <h6>3.1. Content Upload</h6>
                                <p>Users are encouraged to share case studies and articles related to architecture, design, and related topics. By uploading content, you affirm that you have the right to share the content and that it does not violate any copyright or intellectual property rights.</p>
                            </div>

                            <div>
                                <h6>3.2. Moderation</h6>
                                <p>Archi NG reserves the right to review, edit, or remove any content that violates these terms and conditions, without prior notice.</p>
                            </div>
                        </section>



                        <section>
                            <h5>4. Privacy</h5>

                            <div>
                                <h6>4.1. Privacy Policy</h6>
                                <p>Your use of the Platform is also governed by our <Link href={'/policy'}>Privacy Policy</Link>. Please review this policy to understand how we collect, use, and protect your personal information.</p>
                            </div>
                        </section>



                        <section>
                            <h5>5. Penalties for Violations</h5>

                            <div>
                                <h6>5.1. Violations of these terms and conditions may result in the following penalties:</h6>
                                <ul>
                                    <li>Removal of articles, case studies, or other content that violates our guidelines.</li>
                                    <li>Suspension or deletion of user accounts.</li>
                                    <li>Legal action, if necessary, to protect the rights and interests of Archi NG and its users.</li>
                                </ul>
                            </div>
                        </section>



                        <section>
                            <h5>6. Disclaimer of Liability</h5>

                            <div>
                                <h6>6.1. Use of the Platform is at Your Own Risk</h6>
                                <p>Archi NG is provided "as is" and "as available." We make no warranties, either express or implied, regarding the accuracy, reliability, or availability of the Platform. We shall not be liable for any direct or indirect damages arising from the use or inability to use the Platform.</p>
                            </div>
                        </section>



                        <section>
                            <h5>7. Changes to Terms and Conditions</h5>

                            <div>
                                <h6>7.1. Modification of Terms</h6>
                                <p>Archi NG reserves the right to modify these terms and conditions at any time. It is your responsibility to regularly review these terms to stay informed of any changes.</p>
                            </div>
                        </section>



                        <section id="privacy-policy">
                            <h5>8. Contact Us</h5>

                            <div>
                                <h6>8.1. Questions and Concerns</h6>
                                <p>If you have any questions, concerns, or feedback regarding these terms and conditions, please <a href="mailto:arching.app@gmail.com">contact us</a>.</p>
                            </div>
                        </section>

                        <p>By using the Archi NG Platform, you acknowledge that you have read, understood, and agreed to these terms and conditions. Your continued use of the Platform constitutes your acceptance of these terms.</p>

                    </section>
                </main>

            </div>
        </>
    )
}

export default Terms