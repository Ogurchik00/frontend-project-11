/* eslint-disable max-len */
import handlerOfBtnFormSection from './handlers/btnFormSectionHandler.js';
import { handlerOfLinkOpeningBtn } from './handlers/modalHandlers.js';
import {
  watcherValidationRssURL, watcherActivityButton,
  watcherLoadingRssContent,
} from './view/watchers.js';

const app = (state) => {
  const input = document.querySelector('#url-input');

  const watcherValidationRSSUrl = watcherValidationRssURL(state);
  const watcherLoadingRSSContent = watcherLoadingRssContent(state);
  const watcherActivityBtn = watcherActivityButton(state);

  handlerOfLinkOpeningBtn();
  handlerOfBtnFormSection(state, watcherValidationRSSUrl, watcherLoadingRSSContent, watcherActivityBtn, input);
};

export default app;
