import styles from "./menu.module.scss"
import { useContext } from 'react';
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';


const Menu = ({menuclass}) => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className={menuclass}>
            <div className={styles.menuSettings}>
                <div className={styles.themeswitch}>
                    Theme
                    <div className={styles.switchsvg}>
                        <input onClick={toggleTheme} type="checkbox" id="switch" /><label htmlFor="switch">th</label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu