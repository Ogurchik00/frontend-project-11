import * as yup from 'yup';
import i18n from './i18n';

const createValidation = (getState) => {
  const rssSchema = yup.object().shape({
    url: yup
      .string()
      .required(i18n.t('errors.required'))
      .url(i18n.t('errors.invalidUrl'))
      .matches(
        /\.(rss|xml|feed)(\?|$)/i,
        i18n.t('errors.notRss'))
      .test(
        'unique-feed',
        i18n.t('errors.duplicate'),
        (value) => !getState().feeds.some(feed => feed.url === value)
      ),
  });

  const validateUrl = (url) => {
    return rssSchema
      .validate({ url })
      .then(() => ({ isValid: true, error: null }))
      .catch((err) => ({ isValid: false, error: err.message }));
  };

  return { validateUrl };
};

export default createValidation;