/* @flow */
/* eslint import/no-extraneous-dependencies: ["error", {"peerDependencies": true}] */
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import { Observable } from 'rxjs';
import { each } from 'underscore';
import param from 'jquery-param';

const TYPE_MOVIES = 'movies';
// const TYPE_FIREBASE = 'firebase';

export const ENDPOINT = 'https://api.themoviedb.org/3';
export const ENDPOINT_FIREBASE = 'https://agenda-movies.firebaseio.com';

const initialOptions = {
  headers: {
    'content-type': 'application/json;charset=UTF-8',
  },
  onCloseError: () => {},
  retries: 3,
  timeout: 30000,
};

export const endpoint = (URI: string = '') => {
  const url = `${ENDPOINT}${URI}`;
  const API_KEY = process.env.REACT_APP_MOVIESDB_API_KEY;
  if (url.includes('?')) {
    return `${url}&api_key=${API_KEY}&language=pt-BR`;
  }
  return `${url}?api_key=${API_KEY}&language=pt-BR`;
};

export const endpointFirebase = (URI: string = '') => {
  const url = `${ENDPOINT_FIREBASE}${URI}`;
  const API_KEY = process.env.REACT_APP_FIREBASE_DATABASE_SECRET;
  if (url.includes('?')) {
    return `${url}&auth=${API_KEY}`;
  }
  return `${url}?auth=${API_KEY}`;
};

function ajaxRequest(method, uri, data, options) {
  return new Observable(observer => {
    const ajax = new XMLHttpRequest();

    if (method === 'get') {
      let params = '';

      if (data !== null) {
        /**
         * Verifica se o objeto data possui o método getAll indicando
         * ser um tipo URLSearchParams.
         */
        params = typeof data.getAll === 'function' ? `?${data.toString()}` : `?${param(data)}`;
      }

      ajax.open(method, `${uri}${params}`, true);
    } else {
      ajax.open(method, uri, true);
    }

    if (options.headers) {
      each(options.headers, (value, header) => {
        ajax.setRequestHeader(header, value);
      });
    }

    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4) {
        switch (ajax.status) {
          case 0:
          case 404:
          case 500:
            observer.error(ajax.response);
            return;
          case 401:
          case 403:
            // TODO authentication handling
            return;
          case 429:
            observer.error(JSON.parse(ajax.response));
            return;
          case 200:
          case 304:
          default:
            observer.next(JSON.parse(ajax.response));
        }
      }
    };

    if (method === 'get') return ajax.send();

    return ajax.send(JSON.stringify(data));
  });
}

export default (method, uri, data = null, options = initialOptions, endpointType = TYPE_MOVIES) =>
  Observable.of({})
    .mergeMap(() => ajaxRequest(
      method,
      endpointType === TYPE_MOVIES ? endpoint(uri) : endpointFirebase(uri),
      data,
      Object.assign(options, { retry: false }),
    ).map(response => response));
