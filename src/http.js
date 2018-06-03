const http = {

  get(url, options = {}) {
    const headers = options.headers || {};
    const urlAppendix = http.stringifyQuery(options.queryParams);
    return fetch(url + urlAppendix, {
      credentials: 'include',
      headers,
    });
  },

  post(url, body, options = {}) {
    const headers = options.headers || {};
    return fetch(url, {
      headers,
      body,
      credentials: 'include',
      method: 'POST',
    });
  },

  async getJson(url, options = {}) {
    const headers = {
      accept: 'application/json',
    };
    const response = await http.get(url, { ...options, headers });
    return response.json();
  },

  async postJson(url, body) {
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
    };
    const response = await http.post(url, JSON.stringify(body), { headers });
    return response.json();
  },

  stringifyQuery(queryParams = {}) {
    const stringified = Object.entries(queryParams)
      .map(([name, value]) => `${name}=${value}`)
      .join('&');
    return stringified ? '?' + stringified : '';
  },
};

export default http;

