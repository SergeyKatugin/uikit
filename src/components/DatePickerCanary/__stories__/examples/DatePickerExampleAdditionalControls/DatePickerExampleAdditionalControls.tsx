import React, { useState } from 'react';

import { Button } from '../../../../Button/Button';
import { DateTimeAdditionalControlRenderProps } from '../../../../DateTimeCanary/helpers';
import { DatePicker, DatePickerPropValue } from '../../../DatePickerCanary';

export const DatePickerExampleAdditionalControls = () => {
  const [value, setValue] = useState<DatePickerPropValue<'date-range'>>([undefined, undefined]);

  const setCuarter = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 0 && month < 3) {
      setValue([new Date(year, 0, 1), new Date(year, 3, 0)]);
    } else if (month >= 3 && month < 6) {
      setValue([new Date(year, 3, 1), new Date(year, 6, 0)]);
    } else if (month >= 6 && month < 9) {
      setValue([new Date(year, 6, 1), new Date(year, 9, 0)]);
    } else {
      setValue([new Date(year, 9, 1), new Date(year + 1, 0, 0)]);
    }
  };

  const ControlRender = (props: DateTimeAdditionalControlRenderProps) => {
    const { currentVisibleDate } = props;

    return (
      <Button
        label="Этот квартал"
        onClick={() => currentVisibleDate && setCuarter(currentVisibleDate)}
      />
    );
  };

  return (
    <DatePicker
      value={value}
      type="date-range"
      onChange={({ value }) => setValue(value)}
      renderAdditionalControls={ControlRender}
    />
  );
};
