import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { IHomePostProps } from './@interfaces';

import styles from './home.post.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function HomePost({
  slug,
  first_publication_date,
  data,
}: IHomePostProps) {
  return (
    <div className={styles.homePostContainer}>
      <Link href={`/post/${slug}`}>
        <a>
          <h2>{data.title}</h2>
          <p>{data.subtitle}</p>
          <section className={commonStyles.info}>
            <div>
              <FiCalendar color="#BBBBBB" />
              <time>
                {format(new Date(first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </div>
            <div>
              <FiUser color="#BBBBBB" />
              <span>{data.author}</span>
            </div>
          </section>
        </a>
      </Link>
    </div>
  );
}
