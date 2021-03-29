import styles from './home.post.module.scss';

export default function HomePost() {
  return (
    <div className={styles.homePostContainer}>
      <h2>Como Utilizar Hooks</h2>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, nam.
      </p>
      <section>
        <time>15 Mar 2021</time>
        <span>Henrique Tavares</span>
      </section>
    </div>
  );
}
