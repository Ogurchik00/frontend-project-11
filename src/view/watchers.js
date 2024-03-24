import onChange from 'on-change';

import { renderFeedbackOfFormSetion, renderBtnOfFormSection } from '../renders/formSectionRender.js';
import { renderRssContent, renderTitleOfViewedTopics } from '../renders/responseSectionRender.js';
import renderOfCurrentModalTopic from '../renders/modalRender.js';

import { setTimer, getCurrentTimerId } from '../handlers/updateHandlers.js';
import { handlerOfmodalWindowOpeningBtns } from '../handlers/modalHandlers.js';
import { switchToDefaultValue } from '../handlers/additionalHandlers.js';

const watcherValidationRssURL = (state) => {
  const watcher = onChange(state.resultOfValidationRssUrl, (path, validationStatus) => {
    if (validationStatus === null) return;
    renderFeedbackOfFormSetion(validationStatus, state.feedbackMessage);
    switchToDefaultValue(watcher, path);
  });
  return watcher;
};

const watcherActivityButton = (state) => {
  const watcher = onChange(state.process, (path, process) => renderBtnOfFormSection(process));
  return watcher;
};

const watcherLoadingRssContent = (state) => {
  const watcher = onChange(state.resultOfRssContentLoading, (path, value) => {
    switch (path) {
      case ('errorLoading'):
        if (value === true) {
          renderFeedbackOfFormSetion(false, state.feedbackMessage);
          switchToDefaultValue(watcher, path);
        }
        if (value === false) {
          renderRssContent(watcher, state.i18n);
          renderFeedbackOfFormSetion(true, state.feedbackMessage);
          handlerOfmodalWindowOpeningBtns(watcher);
          switchToDefaultValue(watcher, path);
          if (!getCurrentTimerId(watcher)) setTimer(watcher, state, true);
        }
        break;
      case ('updatingTopics.errorUpdating'):
        if (value === true) {
          // renderFeedbackOfFormSetion(false, state.feedbackMessage);
          setTimer(watcher, state, false);
          switchToDefaultValue(watcher.updatingTopics, 'errorUpdating');
        }
        if (value === false) {
          // renderFeedbackOfFormSetion(true, state.feedbackMessage);
          renderRssContent(watcher, state.i18n);
          handlerOfmodalWindowOpeningBtns(watcher);
          switchToDefaultValue(watcher.updatingTopics, 'errorUpdating');
        }
        break;
      case ('updatingTopics.currentTimerID'):
        setTimer(watcher, state, true);
        break;
      case ('uiState.currentModalTopic'):
        renderOfCurrentModalTopic(value);
        break;
      case ('uiState.viewedTopics'):
        renderTitleOfViewedTopics(watcher.uiState.viewedTopics);
        break;
      default:
        break;
    }
  });
  return watcher;
};

export {
  watcherValidationRssURL, watcherActivityButton,
  watcherLoadingRssContent,
};
