import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

import { useComponentSize } from '../../../hooks/useComponentSize/useComponentSize';
import { useMutableRef } from '../../../hooks/useMutableRef/useMutableRef';
import { SliderValue, TrackPosition } from '../helper';

import {
  ActiveButton,
  getActiveValue,
  getNewValue,
  getValidValue,
  getValueByPosition,
  isNotRangeParams,
  isRangeParams,
  trackPosition,
  UseSliderProps,
  UseSliderValues,
} from './helper';

export function useSlider<RANGE extends boolean>(props: UseSliderProps<RANGE>): UseSliderValues {
  const {
    disabled,
    range,
    value,
    min,
    max,
    step = 1,
    onChange,
    onAfterChange,
    sliderRef,
    buttonRefs,
  } = props;

  const minValue = max > min ? min : 0;
  const maxValue = max > min ? max : 100;

  const [currentValue, setCurrentValue] = useState<number | [number, number]>(value);
  const [leftPopover, setLeftPopover] = useState<TrackPosition>(null);
  const [rightPopover, setRightPopover] = useState<TrackPosition>(null);

  const activeButton: MutableRefObject<ActiveButton | null> = useRef(null);

  const sizeSlider = useComponentSize(sliderRef);

  const lastValue = useMutableRef(currentValue);

  useEffect(() => {
    if (disabled) {
      controlListeners('remove');
    }
  }, [disabled]);

  const controlListeners = (type: 'add' | 'remove') => {
    const method = type === 'add' ? 'addEventListener' : 'removeEventListener';
    document[method]('mouseup', handleRelease);
    document[method]('touchend', handleRelease);
    document[method]('mousemove', handleTouchMove);
    document[method]('touchmove', handleTouchMove);
  };

  useEffect(() => {
    if (Array.isArray(currentValue)) {
      setTooltipPosition(currentValue[0], 0);
      setTooltipPosition(currentValue[1], 1);
    } else {
      setTooltipPosition(currentValue, 0);
    }
  }, [currentValue]);

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
      setCurrentValue(value);
      setTooltipPosition(getActiveValue(value, activeButton.current), 0);
      activeButton.current = null;
    }
  }, [value]);

  useEffect(() => {
    onChange?.({
      value: Array.isArray(currentValue)
        ? ([
            getNewValue(currentValue[0], currentValue[0], step, min, max, 0),
            getNewValue(currentValue[1], currentValue[1], step, min, max, 1),
          ] as SliderValue<RANGE>)
        : (getNewValue(currentValue, currentValue, step, min, max, 0) as SliderValue<RANGE>),
    });
  }, [step]);

  useEffect(() => {
    if (typeof value !== 'undefined' && typeof step !== 'undefined') {
      const targetValue = isRangeParams(props)
        ? ([
            getValidValue(props.value[0], min, max, step),
            getValidValue(props.value[1], min, max, step),
          ] as [number, number])
        : getValidValue(props.value as number, min, max, step);
      setCurrentValue(targetValue);
    }
  }, [range, typeof value]);

  useEffect(() => {
    if (isRangeParams(props)) {
      if (props.value[0] > props.value[1]) {
        const newValue: SliderValue<true> = [props.value[1], props.value[1]];
        props.onChange?.({ value: newValue });
      }
    }
  }, []);

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent, typeButton: ActiveButton) => {
      if (!disabled && typeof typeButton === 'number' && typeof currentValue !== 'undefined') {
        let stepIncrement = !Array.isArray(step) ? step || 1 : 1;
        let validKeyCode = false;
        const changedValue = getActiveValue(currentValue, typeButton);
        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowRight':
          case '+':
            validKeyCode = true;
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
          case '-':
            validKeyCode = true;
            stepIncrement *= -1;
            break;
          default:
            break;
        }
        if (validKeyCode) {
          if (Array.isArray(step)) {
            let stepsArr = [...step];
            if (step[0] !== minValue) {
              stepsArr = [minValue, ...stepsArr];
            }
            if (step[step.length - 1] !== maxValue) {
              stepsArr = [...stepsArr, maxValue];
            }
            stepsArr.forEach((stepPoint, index) => {
              if (typeof typeButton === 'number' && changedValue === stepPoint) {
                if (stepIncrement >= 0) {
                  if (index === 0) {
                    stepIncrement = stepsArr[1] - minValue;
                  } else {
                    stepIncrement =
                      (typeof stepsArr[index + 1] !== 'undefined'
                        ? stepsArr[index + 1]
                        : maxValue) - stepPoint;
                  }
                } else if (index === 0) {
                  stepIncrement = minValue - stepsArr[1];
                } else {
                  stepIncrement =
                    (typeof stepsArr[index - 1] !== 'undefined' ? stepsArr[index - 1] : minValue) -
                    stepPoint;
                }
              }
            });
          }
          const newValue = getNewValue(
            changedValue + stepIncrement,
            currentValue,
            step,
            min,
            max,
            typeButton,
          );
          setCurrentValue(newValue);
          setTooltipPosition(getActiveValue(newValue, typeButton), typeButton);
          onChange?.({
            e: event,
            value: newValue as SliderValue<RANGE>,
          });
        }
      }
    },
    [currentValue, step, min, max],
  );

  const setTooltipPosition = (value: number, position: ActiveButton) => {
    if (sliderRef.current && typeof position === 'number') {
      const button = buttonRefs[position].current || sliderRef.current;
      const { x, width } = sliderRef.current.getBoundingClientRect();
      const newPosition = {
        y: button.offsetTop + button.offsetHeight + 50,
        x: x + Math.abs((value - minValue) / (maxValue - minValue)) * width,
      };
      if (position === 0) {
        setLeftPopover(newPosition);
      } else {
        setRightPopover(newPosition);
      }
    }
  };

  const changePosition = (event: Event) => {
    const nativeEvent = event as MouseEvent | TouchEvent;
    if (typeof activeButton.current !== 'number') {
      return value;
    }
    const position = trackPosition(nativeEvent);
    const positionValue = getValueByPosition(position, sliderRef, minValue, maxValue);
    return getNewValue(positionValue, currentValue, step, min, max, activeButton.current);
  };

  const onFocus = (e: React.FocusEvent | React.MouseEvent, button: ActiveButton) => {
    activeButton.current = button;
  };

  const handleTouchMove = (event: MouseEvent | TouchEvent | Event, typeButton?: ActiveButton) => {
    const button = typeButton || activeButton.current;
    if (typeof button === 'number') {
      const position = changePosition(event);
      const oldValue: number = getActiveValue(currentValue, button);
      const newValue: number = getActiveValue(position, button);
      if (oldValue !== newValue) {
        setCurrentValue(position);
        onAfterChange?.({ e: event, value: position as SliderValue<RANGE> });
      }
    }
  };

  useEffect(() => {
    if (isRangeParams(props)) {
      props.value.forEach((val, index) => {
        setTooltipPosition(getActiveValue(val, activeButton.current), index === 0 ? 0 : 1);
      });
    }
    if (isNotRangeParams(props)) {
      setTooltipPosition(getActiveValue(value, activeButton.current), 0);
    }
    activeButton.current = null;
  }, [sizeSlider, typeof value]);

  const handleRelease = useCallback(
    (e: MouseEvent | TouchEvent | Event) => {
      controlListeners('remove');
      if (isRangeParams(props) && Array.isArray(lastValue.current)) {
        const copyValues = [...lastValue.current].sort(
          (a, b) => Number(a) - Number(b),
        ) as SliderValue<true>;
        props.onChange?.({ e, value: copyValues });
      }
      if (isNotRangeParams(props) && typeof lastValue.current === 'number') {
        props.onChange?.({ e, value: lastValue.current });
      }
      activeButton.current = null;
    },
    [lastValue, value, onChange, handleTouchMove],
  );

  const handlePress = useCallback(
    (typeButton: ActiveButton) => {
      if (!disabled) {
        activeButton.current = typeButton;
        controlListeners('add');
      }
    },
    [currentValue, value, onChange, handleTouchMove, disabled],
  );

  return {
    onKeyPress,
    onFocus,
    handlePress,
    activeButton: activeButton.current,
    popoverPosition: [leftPopover, rightPopover],
    currentValue: Array.isArray(currentValue) ? currentValue : [currentValue],
  };
}
