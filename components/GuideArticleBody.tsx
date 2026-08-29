import { AdUnit } from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/lib/adsense';

type GuideArticleBodyProps = {
  sections: ReadonlyArray<readonly [string, string]>;
};

export function GuideArticleBody({ sections }: GuideArticleBodyProps) {
  return (
    <div className="article-body">
      {sections.map(([title, body], index) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
          {index === 1 ? <AdUnit placement="article" slot={ADSENSE_SLOTS.article} /> : null}
        </section>
      ))}
    </div>
  );
}
