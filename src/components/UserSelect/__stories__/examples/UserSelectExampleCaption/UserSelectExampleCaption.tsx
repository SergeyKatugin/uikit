import React, { useState } from 'react';

import { StoryBookExample } from '../../../../../uiKit/components/StoryBookExample/StoryBookExample';
import { UserSelect } from '../../../UserSelect';

type Item = {
  label: string;
  subLabel?: string;
  avatarUrl?: string;
  id: string | number;
};

const items: Item[] = [
  {
    label: 'Андрей Андреев',
    subLabel: 'andrey@gmail.com',
    id: 1,
  },
  {
    label: 'Иван Иванов',
    subLabel: 'ivan@gmail.com',
    id: 2,
  },
  {
    label: 'Егор Егоров',
    subLabel: 'igor@icloud.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/13190808?v=4',
    id: 3,
  },
];

export function UserSelectExampleCaption() {
  const [value, setValue] = useState<Item | null>();
  return (
    <>
      <StoryBookExample>
        <UserSelect
          items={items}
          value={value}
          onChange={({ value }) => setValue(value)}
          status="success"
          placeholder="Статус success"
          caption="Это подпись"
        />
      </StoryBookExample>
      <StoryBookExample>
        <UserSelect
          items={items}
          value={value}
          onChange={({ value }) => setValue(value)}
          status="alert"
          placeholder="Статус alert"
          caption="Это подпись"
        />
      </StoryBookExample>
      <StoryBookExample>
        <UserSelect
          items={items}
          value={value}
          onChange={({ value }) => setValue(value)}
          status="warning"
          placeholder="Статус warning"
          caption="Это подпись"
        />
      </StoryBookExample>
      <StoryBookExample>
        <UserSelect
          items={items}
          value={value}
          onChange={({ value }) => setValue(value)}
          placeholder="Обычное поле"
          caption="Это подпись"
        />
      </StoryBookExample>
    </>
  );
}
