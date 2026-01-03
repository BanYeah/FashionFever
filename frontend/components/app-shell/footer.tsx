import Link from 'next/link';
import styles from './footer.module.css';

interface GlobalFooterProps {
  varient: "default" | "dressUp" | "2Tab" | "3Tab";
  description?: string;
  onTab?: number;
  tabs?: string[];
  tabLinks?: string[];
}

export default function GlobalFooter({ 
  varient, 
  description, 
  onTab = 0, 
  tabs, 
  tabLinks 
}: GlobalFooterProps) {
  
  const renderContent = () => {
    switch (varient) {
      case "default":
        return <p className={styles.defaultText}>{description}</p>;
        
      case "dressUp":
        return (
          <div className={styles.dressUpContainer}>
            <Link href="/mini-dressup" className={styles.dressUpLink}>
              미니 꾸미기
            </Link>
          </div>
        );
        
      case "2Tab":
      case "3Tab":
        return (
          <div className={styles.tabContainer}>
            {tabs?.map((text, index) => (
              <Link 
                key={index} 
                href={tabLinks?.[index] || "#"} 
                className={`${styles.tabItem} ${onTab === index ? styles.activeTab : styles.inactiveTab}`}
              >
                {text}
              </Link>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <footer className={styles.footerContainer}>
      {renderContent()}
    </footer>
  );
}