import * as yup from 'yup';

export const rssSchema = yup.object().shape({
  url: yup
    .string()
    .required('URL обязателен')
    .url('Некорректный URL')
    .matches(
      /(rss|feed|xml)/i,
      'URL должен содержать RSS (например, .../rss.xml)'
    ),
});

export const validateUrl = (url) => {
  return rssSchema
    .validate({ url })
    .then(() => ({ isValid: true, error: null }))
    .catch((err) => ({ isValid: false, error: err.message }));
};