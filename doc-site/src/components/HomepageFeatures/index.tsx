import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '🎯 Complete SDK Coverage',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Comprehensive documentation for the official Elgato Stream Deck SDK v2.
        Learn everything from basic actions to advanced features like Stream Deck+
        dials, encoders, and touch displays.
      </>
    ),
  },
  {
    title: '🚀 Quick Start to Production',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Get your first plugin running in minutes with our step-by-step guides.
        From environment setup to deployment, we cover the entire development
        workflow with real-world examples.
      </>
    ),
  },
  {
    title: '🤖 AI-Powered Documentation',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Built-in RAG (Retrieval-Augmented Generation) system powered by Google Gemini.
        Ask questions and get instant, context-aware answers from the entire
        documentation using <code>npm run test:query</code>.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
