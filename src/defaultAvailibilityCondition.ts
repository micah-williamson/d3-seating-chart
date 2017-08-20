import { ConditionResolver } from './conditionResolver.interface';

export const DefaultAvailabilityResolver : ConditionResolver = (ele: SVGElement) => {
  return !ele.classList.contains('reserved') && !ele.classList.contains('locked');
}