/* eslint-disable no-param-reassign */
import _ from 'lodash';

const getUniqId = () => _.uniqueId();

const switchToDefaultValue = (obj, path) => {
  obj[path] = null;
};

export { getUniqId, switchToDefaultValue };
