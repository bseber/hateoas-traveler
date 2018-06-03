import traveler from '../traveler';
import http from '../http';

describe('traveler', () => {
  /* eslint-disable jest/no-hooks */
  const resolve = data => Promise.resolve(data);

  beforeEach(() => {
    jest.spyOn(http, 'getJson').mockImplementation(url => {
      switch (url) {
        case '/api':
          return resolve(apiResponse);
        case '/api/persons':
          return resolve(personsResponse);
        case '/api/persons/business':
          return resolve(personsBusinessResponse);
        case '/api/search?query=bat':
          return resolve(searchResponse);
        default:
          throw new Error(
            `Whoops. Please define getJson mock data for url=${url}`,
          );
      }
    });
    jest.spyOn(http, 'postJson').mockImplementation(url => {
      switch (url) {
        case '/api/persons':
          return resolve(createPersonResponse);
        default:
          throw new Error(
            `Whoops. Please define postJson mock data for url=${url}`,
          );
      }
    });
  });

  afterEach(() => {
    http.getJson.mockRestore();
  });

  it('from', async () => {
    const response = await traveler.from('/api').get();

    expect(response).toEqual(apiResponse);
  });

  it('follow simple', async () => {
    const data = await traveler
      .from('/api')
      .follow('persons')
      .get();

    expect(data).toEqual(personsResponse);
  });

  it('follow deep (comma separated)', async () => {
    const data = await traveler
      .from('/api')
      .follow('persons', 'business')
      .get();

    expect(data).toEqual(personsBusinessResponse);
  });

  it('follow deep (array)', async () => {
    const data = await traveler
      .from('/api')
      .follow(['persons', 'business'])
      .get();

    expect(data).toEqual(personsBusinessResponse);
  });

  it('follow with templated query data', async () => {
    const data = await traveler
      .from('/api')
      .follow('search')
      .withQueryData({ query: 'bat' })
      .get();

    expect(data).toEqual(searchResponse);
  });

  it('follow with templated query data throws when #withQueryData has not been called', async () => {
    expect.assertions(1);
    try {
      await traveler
        .from('/api')
        .follow('search')
        .get();
    } catch (error) {
      expect(error.message).toEqual(
        'link="/api/search{?query}" is templated but no queryData is given',
      );
    }
  });

  it('follow with templated query data throws when queryData param is missing', async () => {
    expect.assertions(1);
    try {
      await traveler
        .from('/api')
        .follow('search')
        .withQueryData({ misspelled: 'query param' })
        .get();
    } catch (error) {
      expect(error.message).toEqual(
        'link="/api/search{?query}" requires parameters but "query" is undefined in queryData',
      );
    }
  });

  it('follows and posts data', async () => {
    const data = await traveler
      .from('/api')
      .follow('persons')
      .post({ firstname: 'Bruce', lastname: 'Wayne' });

    expect(data).toEqual(createPersonResponse);
  });
});

const apiResponse = {
  _links: {
    self: {
      href: '/api',
    },
    persons: {
      href: '/api/persons',
    },
    search: {
      href: '/api/search{?query}',
      templated: true,
    },
  },
};

const personsResponse = {
  content: [],
  _links: {
    self: {
      href: '/api/persons',
    },
    business: {
      href: '/api/persons/business',
    },
  },
};

const personsBusinessResponse = {
  content: [
    {
      personId: 1,
      name: 'serious sam',
    },
  ],
};

const searchResponse = {
  content: [
    {
      personId: 1,
      name: 'batman',
    },
    {
      personId: 2,
      name: 'batgirl',
    },
  ],
  _links: {
    self: {
      href: '/api/search?query=bat',
    },
  },
};

const createPersonResponse = {
  ok: 42,
};
