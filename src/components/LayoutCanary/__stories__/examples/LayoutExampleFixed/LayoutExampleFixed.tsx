import './LayoutExampleFixed.css';

import React from 'react';
import { select } from '@storybook/addon-knobs';

import { cn } from '../../../../../utils/bem';
import { Text } from '../../../../Text/Text';
import {
  Layout,
  layoutPropDirection,
  layoutPropDirectionDefault,
  layoutPropVerticalAlign,
  layoutPropVerticalAlignDefault,
} from '../../../LayoutCanary';

const cnLayoutExampleFixed = cn('LayoutExampleFixed');

const flexArray = [1, 2, 3, 4, 5, 6];

const defaultKnobs = () => ({
  direction: select('Direction', layoutPropDirection, layoutPropDirectionDefault),
  verticalAlign: select('Vertical align', layoutPropVerticalAlign, layoutPropVerticalAlignDefault),
  flexBlock1: select('Flex Block 1', flexArray, 1),
  flexBlock2: select('Flex Block 2', flexArray, 1),
});

export const LayoutExampleFixed = () => {
  const { direction, flexBlock1, flexBlock2, verticalAlign } = defaultKnobs();

  return (
    <Layout className={cnLayoutExampleFixed()} direction="column">
      {verticalAlign === 'top' && (
        <Layout
          scrollContainer={window}
          verticalAlign={verticalAlign}
          fixed
          className={cnLayoutExampleFixed('Header')}
        >
          <Text>Заголовок</Text>
        </Layout>
      )}
      <Layout direction={direction} className={cnLayoutExampleFixed('Content', { direction })}>
        <Layout className={cnLayoutExampleFixed('Block')} flex={flexBlock1}>
          <Text>Контент</Text>
        </Layout>
        <Layout className={cnLayoutExampleFixed('Block')} flex={flexBlock2}>
          <Text>Контент</Text>
        </Layout>
      </Layout>
      {verticalAlign === 'bottom' && (
        <Layout
          scrollContainer={window}
          verticalAlign={verticalAlign}
          fixed
          className={cnLayoutExampleFixed('Header')}
        >
          <Text>Заголовок</Text>
        </Layout>
      )}
    </Layout>
  );
};
